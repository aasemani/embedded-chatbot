import type { ServerConfig } from "../config";
import type { ChatMessage } from "../schemas/chat.schema";

export const SAFE_ASSISTANT_ERROR_MESSAGE =
  "I'm sorry, I couldn't process that request right now.";

type OpenWebUIChoice = {
  message?: {
    content?: unknown;
  };
};

type OpenWebUIResponse = {
  choices?: OpenWebUIChoice[];
};

type ChatCompletionInput = {
  message: string;
  history: ChatMessage[];
};

export class OpenWebUIService {
  constructor(private readonly serverConfig: ServerConfig) {}

  async createChatCompletion(input: ChatCompletionInput): Promise<string> {
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
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Open WebUI request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OpenWebUIResponse;
    const content = payload.choices?.[0]?.message?.content;

    if (typeof content !== "string" || content.trim().length === 0) {
      return SAFE_ASSISTANT_ERROR_MESSAGE;
    }

    return content;
  }
}
