export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  chatbotId: string;
  sessionId: string;
  message: string;
  history: ChatMessage[];
};

export type ChatResponse = {
  message: string;
};

export type ChatStreamHandlers = {
  onDelta: (delta: string) => void;
  onDone?: (message: string) => void;
  signal?: AbortSignal;
};

export type ChatbotPosition = "bottom-right" | "bottom-left";

export type ChatbotConfig = {
  chatbotId: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  position: ChatbotPosition;
  welcomeMessage: string;
  placeholder: string;
  apiBaseUrl: string;
};
