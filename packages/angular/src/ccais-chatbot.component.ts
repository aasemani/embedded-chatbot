import "@ccais/embedded-chatbot-core";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { ChatbotPosition } from "@ccais/embedded-chatbot-core";

@Component({
  selector: "ccais-chatbot-wrapper",
  template: `
    <ccais-chatbot
      [attr.chatbot-id]="chatbotId"
      [attr.name]="name"
      [attr.primary-color]="primaryColor"
      [attr.accent-color]="accentColor"
      [attr.position]="position"
      [attr.welcome-message]="welcomeMessage"
      [attr.placeholder]="placeholder"
      [attr.api-base-url]="apiBaseUrl"
    ></ccais-chatbot>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CcaisChatbotComponent {
  @Input() chatbotId?: string;
  @Input() name?: string;
  @Input() primaryColor?: string;
  @Input() accentColor?: string;
  @Input() position?: ChatbotPosition;
  @Input() welcomeMessage?: string;
  @Input() placeholder?: string;
  @Input() apiBaseUrl?: string;
}
