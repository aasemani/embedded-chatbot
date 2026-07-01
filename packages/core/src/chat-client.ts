import type { ChatRequest, ChatResponse } from "./types";

const CHAT_ENDPOINT = "/api/chat";

export class ChatClient {
  constructor(private readonly apiBaseUrl: string) {}

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.apiBaseUrl.replace(/\/+$/, "")}${CHAT_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    const payload = (await response.json().catch(() => ({}))) as Partial<ChatResponse>;

    if (!response.ok) {
      throw new Error(payload.message || "Chat request failed.");
    }

    if (typeof payload.message !== "string") {
      throw new Error("Chat response was malformed.");
    }

    return {
      message: payload.message
    };
  }
}
