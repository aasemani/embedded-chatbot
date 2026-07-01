import { html, LitElement, type PropertyValues } from "lit";
import { chatbotStyles } from "./styles";
import { ChatClient } from "./chat-client";
import type { ChatMessage, ChatbotPosition } from "./types";

const SESSION_STORAGE_KEY = "ccais_chatbot_session_id";
const DEFAULT_ERROR_MESSAGE = "I'm sorry, I couldn't process that request right now.";

function createSessionId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `ccais-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateSessionId(): string {
  try {
    const existingSessionId = globalThis.localStorage?.getItem(SESSION_STORAGE_KEY);

    if (existingSessionId) {
      return existingSessionId;
    }

    const sessionId = createSessionId();
    globalThis.localStorage?.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
  } catch {
    return createSessionId();
  }
}

export class CcaisChatbotElement extends LitElement {
  static override styles = chatbotStyles;

  static override properties = {
    chatbotId: { type: String, attribute: "chatbot-id" },
    name: { type: String },
    primaryColor: { type: String, attribute: "primary-color" },
    accentColor: { type: String, attribute: "accent-color" },
    position: { type: String, reflect: true },
    welcomeMessage: { type: String, attribute: "welcome-message" },
    placeholder: { type: String },
    apiBaseUrl: { type: String, attribute: "api-base-url" },
    isOpen: { type: Boolean, state: true },
    inputValue: { type: String, state: true },
    loading: { type: Boolean, state: true },
    errorMessage: { type: String, state: true },
    messages: { state: true }
  };

  chatbotId = "default";
  name = "CCAIS Assistant";
  primaryColor = "#0066CC";
  accentColor = "#10B981";
  position: ChatbotPosition = "bottom-right";
  welcomeMessage = "Hi, how can I help you?";
  placeholder = "Type your message...";
  apiBaseUrl = "http://localhost:4000";

  private isOpen = false;
  private inputValue = "";
  private loading = false;
  private errorMessage = "";
  private messages: ChatMessage[] = [];
  private readonly sessionId = getOrCreateSessionId();

  protected override firstUpdated(): void {
    this.resetWelcomeMessage();
    this.applyThemeVariables();
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (
      changedProperties.has("primaryColor") ||
      changedProperties.has("accentColor") ||
      changedProperties.has("position")
    ) {
      this.applyThemeVariables();
    }

    if (changedProperties.has("welcomeMessage") && this.hasOnlyWelcomeMessage()) {
      this.resetWelcomeMessage();
    }
  }

  private applyThemeVariables(): void {
    this.style.setProperty("--ccais-primary-color", this.primaryColor);
    this.style.setProperty("--ccais-accent-color", this.accentColor);
  }

  private resetWelcomeMessage(): void {
    this.messages = [
      {
        role: "assistant",
        content: this.welcomeMessage
      }
    ];
  }

  private hasOnlyWelcomeMessage(): boolean {
    return this.messages.length === 0 || (this.messages.length === 1 && this.messages[0]?.role === "assistant");
  }

  private getConversationHistory(): ChatMessage[] {
    return this.messages.filter(
      (message, index) =>
        !(index === 0 && message.role === "assistant" && message.content === this.welcomeMessage)
    );
  }

  private togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  private handleInput(event: Event): void {
    this.inputValue = (event.currentTarget as HTMLInputElement).value;
  }

  private handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    void this.sendMessage();
  }

  private async sendMessage(): Promise<void> {
    const message = this.inputValue.trim();

    if (!message || this.loading) {
      return;
    }

    const history = this.getConversationHistory();
    const userMessage: ChatMessage = {
      role: "user",
      content: message
    };

    this.messages = [...this.messages, userMessage];
    this.inputValue = "";
    this.errorMessage = "";
    this.loading = true;

    try {
      const chatClient = new ChatClient(this.apiBaseUrl);
      const response = await chatClient.sendMessage({
        chatbotId: this.chatbotId,
        sessionId: this.sessionId,
        message,
        history
      });

      this.messages = [
        ...this.messages,
        {
          role: "assistant",
          content: response.message
        }
      ];
    } catch (error) {
      this.errorMessage = error instanceof Error && error.message ? error.message : DEFAULT_ERROR_MESSAGE;
    } finally {
      this.loading = false;
    }
  }

  override render() {
    return html`
      ${this.isOpen ? this.renderPanel() : null}
      <button
        class="bubble"
        type="button"
        aria-label=${this.isOpen ? "Close chat" : "Open chat"}
        @click=${this.togglePanel}
      >
        ${this.isOpen ? this.renderCloseIcon() : this.renderChatIcon()}
      </button>
    `;
  }

  private renderPanel() {
    return html`
      <section class="panel" role="dialog" aria-label=${this.name}>
        <header class="header">
          <div class="header-title">
            <span class="status-dot" aria-hidden="true"></span>
            <h2 class="title">${this.name}</h2>
          </div>
          <button class="icon-button" type="button" aria-label="Close chat" @click=${this.togglePanel}>
            ${this.renderCloseIcon()}
          </button>
        </header>

        <div class="messages" aria-live="polite">
          ${this.messages.map(
            (message) => html`<div class="message ${message.role}">${message.content}</div>`
          )}
          ${this.loading
            ? html`<div class="message assistant typing" role="status">Thinking...</div>`
            : null}
          ${this.errorMessage ? html`<div class="error" role="alert">${this.errorMessage}</div>` : null}
        </div>

        <form class="composer" @submit=${this.handleSubmit}>
          <input
            class="input"
            .value=${this.inputValue}
            placeholder=${this.placeholder}
            maxlength="4000"
            autocomplete="off"
            @input=${this.handleInput}
          />
          <button class="send" type="submit" ?disabled=${this.loading || this.inputValue.trim().length === 0}>
            ${this.loading ? "..." : "Send"}
          </button>
        </form>
      </section>
    `;
  }

  private renderChatIcon() {
    return html`
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path
          d="M5 6.8C5 5.25 6.25 4 7.8 4h8.4C17.75 4 19 5.25 19 6.8v5.6c0 1.55-1.25 2.8-2.8 2.8h-4.55L7.6 18.35c-.45.35-1.1.03-1.1-.54V15.1C5.63 14.67 5 13.77 5 12.7V6.8Z"
          fill="currentColor"
        />
      </svg>
    `;
  }

  private renderCloseIcon() {
    return html`
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path
          d="M7.28 6.22a.75.75 0 0 0-1.06 1.06L10.94 12l-4.72 4.72a.75.75 0 1 0 1.06 1.06L12 13.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L13.06 12l4.72-4.72a.75.75 0 0 0-1.06-1.06L12 10.94 7.28 6.22Z"
          fill="currentColor"
        />
      </svg>
    `;
  }
}

if (!customElements.get("ccais-chatbot")) {
  customElements.define("ccais-chatbot", CcaisChatbotElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "ccais-chatbot": CcaisChatbotElement;
  }
}
