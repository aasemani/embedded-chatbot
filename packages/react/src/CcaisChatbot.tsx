import "@ccais/embedded-chatbot-core";
import type React from "react";
import type { ChatbotPosition } from "@ccais/embedded-chatbot-core";

export type CcaisChatbotProps = {
  chatbotId?: string;
  name?: string;
  primaryColor?: string;
  accentColor?: string;
  position?: ChatbotPosition;
  welcomeMessage?: string;
  placeholder?: string;
  apiBaseUrl?: string;
};

type CcaisChatbotElementAttributes = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  "chatbot-id"?: string;
  name?: string;
  "primary-color"?: string;
  "accent-color"?: string;
  position?: ChatbotPosition;
  "welcome-message"?: string;
  placeholder?: string;
  "api-base-url"?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ccais-chatbot": CcaisChatbotElementAttributes;
    }
  }
}

export function CcaisChatbot({
  chatbotId,
  name,
  primaryColor,
  accentColor,
  position,
  welcomeMessage,
  placeholder,
  apiBaseUrl
}: CcaisChatbotProps) {
  return (
    <ccais-chatbot
      chatbot-id={chatbotId}
      name={name}
      primary-color={primaryColor}
      accent-color={accentColor}
      position={position}
      welcome-message={welcomeMessage}
      placeholder={placeholder}
      api-base-url={apiBaseUrl}
    />
  );
}
