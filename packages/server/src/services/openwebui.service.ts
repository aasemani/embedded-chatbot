import type { ServerConfig } from "../config";
import type { ChatMessage } from "../schemas/chat.schema";

export const SAFE_ASSISTANT_ERROR_MESSAGE =
  "I'm sorry, I couldn't process that request right now.";

type ChatCompletionInput = {
  message: string;
  history: ChatMessage[];
};

type OpenWebUIStreamChoice = {
  delta?: {
    content?: unknown;
  };
  message?: {
    content?: unknown;
  };
  text?: unknown;
};

type OpenWebUIStreamPayload = {
  choices?: OpenWebUIStreamChoice[];
  message?: {
    content?: unknown;
  };
  content?: unknown;
};

export class OpenWebUIService {
  constructor(private readonly serverConfig: ServerConfig) {}

  async createChatCompletionStream(input: ChatCompletionInput): Promise<AsyncIterable<string>> {
    const response = await fetch(`${this.serverConfig.openWebuiBaseUrl}/api/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.serverConfig.openWebuiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.serverConfig.openWebuiModel,
        messages: [
          {
            role: "system",
            content: this.serverConfig.defaultSystemPrompt
          },
          ...input.history,
          {
            role: "user",
            content: input.message
          }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Open WebUI request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Open WebUI returned an empty streaming response body");
    }

    return this.parseOpenWebUIStream(response.body);
  }

  private async *parseOpenWebUIStream(stream: ReadableStream<Uint8Array>): AsyncIterable<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parsedEvents = this.drainStreamEvents(buffer);
        buffer = parsedEvents.remaining;

        for (const event of parsedEvents.events) {
          const delta = this.parseStreamEvent(event);

          if (delta === null) {
            return;
          }

          if (delta) {
            yield delta;
          }
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        const delta = this.parseStreamEvent(buffer);

        if (delta) {
          yield delta;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private drainStreamEvents(buffer: string): { events: string[]; remaining: string } {
    const events: string[] = [];
    let remaining = buffer;

    while (true) {
      const separatorMatch = /\r?\n\r?\n/.exec(remaining);

      if (!separatorMatch) {
        break;
      }

      events.push(remaining.slice(0, separatorMatch.index));
      remaining = remaining.slice(separatorMatch.index + separatorMatch[0].length);
    }

    return { events, remaining };
  }

  private parseStreamEvent(event: string): string | null | undefined {
    const dataLines = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice("data:".length).trim());

    for (const data of dataLines) {
      if (!data) {
        continue;
      }

      if (data === "[DONE]") {
        return null;
      }

      try {
        const payload = JSON.parse(data) as OpenWebUIStreamPayload;
        const delta = this.extractDelta(payload);

        if (delta) {
          return delta;
        }
      } catch {
        continue;
      }
    }

    return undefined;
  }

  private extractDelta(payload: OpenWebUIStreamPayload): string | undefined {
    const firstChoice = payload.choices?.[0];
    const content =
      firstChoice?.delta?.content ??
      firstChoice?.message?.content ??
      firstChoice?.text ??
      payload.message?.content ??
      payload.content;

    return typeof content === "string" ? content : undefined;
  }
}
