import type { ChatRequest, ChatResponse, ChatStreamHandlers } from "./types";

const CHAT_ENDPOINT = "/api/chat";
const DEFAULT_STREAM_ERROR_MESSAGE = "I'm sorry, I couldn't process that request right now.";

type SseEvent = {
  event?: string;
  data: string;
};

type StreamPayload = {
  delta?: unknown;
  message?: unknown;
  choices?: Array<{
    delta?: {
      content?: unknown;
    };
    message?: {
      content?: unknown;
    };
    text?: unknown;
  }>;
};

export class ChatClient {
  constructor(private readonly apiBaseUrl: string) {}

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.streamMessage(request, {
      onDelta: () => {
        return;
      }
    });
  }

  async streamMessage(request: ChatRequest, handlers: ChatStreamHandlers): Promise<ChatResponse> {
    const response = await fetch(`${this.apiBaseUrl.replace(/\/+$/, "")}${CHAT_ENDPOINT}`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request),
      signal: handlers.signal
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as Partial<ChatResponse>;
      throw new Error(payload.message || "Chat request failed.");
    }

    if (!response.body) {
      throw new Error("Chat response stream was empty.");
    }

    const message = await this.readEventStream(response.body, handlers);
    handlers.onDone?.(message);

    return { message };
  }

  private async readEventStream(
    stream: ReadableStream<Uint8Array>,
    handlers: ChatStreamHandlers
  ): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let message = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parsedEvents = this.drainEvents(buffer);
        buffer = parsedEvents.remaining;

        for (const event of parsedEvents.events) {
          const result = this.handleStreamEvent(event);

          if (result.done) {
            return message;
          }

          if (result.errorMessage) {
            throw new Error(result.errorMessage);
          }

          if (result.delta) {
            message += result.delta;
            handlers.onDelta(result.delta);
          }
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        const result = this.handleStreamEvent(this.parseEvent(buffer));

        if (result.errorMessage) {
          throw new Error(result.errorMessage);
        }

        if (result.delta) {
          message += result.delta;
          handlers.onDelta(result.delta);
        }
      }
    } finally {
      reader.releaseLock();
    }

    return message || DEFAULT_STREAM_ERROR_MESSAGE;
  }

  private drainEvents(buffer: string): { events: SseEvent[]; remaining: string } {
    const events: SseEvent[] = [];
    let remaining = buffer;

    while (true) {
      const separatorMatch = /\r?\n\r?\n/.exec(remaining);

      if (!separatorMatch) {
        break;
      }

      events.push(this.parseEvent(remaining.slice(0, separatorMatch.index)));
      remaining = remaining.slice(separatorMatch.index + separatorMatch[0].length);
    }

    return { events, remaining };
  }

  private parseEvent(rawEvent: string): SseEvent {
    let eventName: string | undefined;
    const dataLines: string[] = [];

    for (const line of rawEvent.split(/\r?\n/)) {
      if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim();
      }

      if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trim());
      }
    }

    return {
      event: eventName,
      data: dataLines.join("\n")
    };
  }

  private handleStreamEvent(event: SseEvent): {
    delta?: string;
    done?: boolean;
    errorMessage?: string;
  } {
    if (!event.data) {
      return {};
    }

    if (event.data === "[DONE]" || event.event === "done") {
      return { done: true };
    }

    try {
      const payload = JSON.parse(event.data) as StreamPayload;

      if (event.event === "error") {
        return {
          errorMessage: typeof payload.message === "string" ? payload.message : DEFAULT_STREAM_ERROR_MESSAGE
        };
      }

      const delta = this.extractDelta(payload);

      return delta ? { delta } : {};
    } catch {
      return {};
    }
  }

  private extractDelta(payload: StreamPayload): string | undefined {
    const firstChoice = payload.choices?.[0];
    const delta =
      payload.delta ??
      payload.message ??
      firstChoice?.delta?.content ??
      firstChoice?.message?.content ??
      firstChoice?.text;

    return typeof delta === "string" ? delta : undefined;
  }
}
