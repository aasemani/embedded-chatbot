import { css } from "lit";

export const chatbotStyles = css`
  :host {
    --ccais-primary-color: #0066cc;
    --ccais-accent-color: #10b981;
    --ccais-bg-color: #ffffff;
    --ccais-text-color: #111827;
    --ccais-border-radius: 16px;
    --ccais-z-index: 2147483000;

    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: var(--ccais-z-index);
    color: var(--ccais-text-color);
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  :host([position="bottom-left"]) {
    right: auto;
    left: 20px;
  }

  * {
    box-sizing: border-box;
  }

  .panel {
    position: absolute;
    right: 0;
    bottom: 76px;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: 368px;
    max-width: calc(100vw - 32px);
    height: min(620px, calc(100vh - 112px));
    overflow: hidden;
    background: var(--ccais-bg-color);
    border: 1px solid rgba(17, 24, 39, 0.1);
    border-radius: var(--ccais-border-radius);
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
  }

  :host([position="bottom-left"]) .panel {
    right: auto;
    left: 0;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 58px;
    padding: 14px 16px;
    color: #ffffff;
    background: var(--ccais-primary-color);
  }

  .title {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .icon-button,
  .bubble,
  .send {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    cursor: pointer;
    font: inherit;
  }

  .icon-button {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    color: #ffffff;
    background: transparent;
    border-radius: 999px;
  }

  .icon-button:hover {
    background: rgba(255, 255, 255, 0.14);
  }

  .messages {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
    padding: 16px;
    overflow-y: auto;
    background: #f8fafc;
  }

  .message {
    width: fit-content;
    max-width: 88%;
    padding: 10px 12px;
    border-radius: 14px;
    font-size: 14px;
    line-height: 1.45;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .message.assistant {
    align-self: flex-start;
    color: var(--ccais-text-color);
    background: #ffffff;
    border: 1px solid rgba(17, 24, 39, 0.08);
    border-bottom-left-radius: 6px;
  }

  .message.user {
    align-self: flex-end;
    color: #ffffff;
    background: var(--ccais-primary-color);
    border-bottom-right-radius: 6px;
  }

  .typing {
    align-self: flex-start;
    color: #4b5563;
    background: #ffffff;
  }

  .error {
    padding: 10px 12px;
    color: #991b1b;
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.4;
  }

  .composer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    padding: 12px;
    background: #ffffff;
    border-top: 1px solid rgba(17, 24, 39, 0.08);
  }

  .input {
    width: 100%;
    min-width: 0;
    height: 42px;
    padding: 0 12px;
    color: var(--ccais-text-color);
    background: #ffffff;
    border: 1px solid rgba(17, 24, 39, 0.16);
    border-radius: 999px;
    font: inherit;
    font-size: 14px;
    outline: none;
  }

  .input:focus {
    border-color: var(--ccais-primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ccais-primary-color) 20%, transparent);
  }

  .send {
    min-width: 72px;
    height: 42px;
    padding: 0 14px;
    color: #ffffff;
    background: var(--ccais-primary-color);
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
  }

  .send:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }

  .bubble {
    width: 60px;
    height: 60px;
    color: #ffffff;
    background: var(--ccais-primary-color);
    border-radius: 999px;
    box-shadow: 0 18px 44px rgba(15, 23, 42, 0.28);
    transition:
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .bubble:hover {
    transform: translateY(-1px);
    box-shadow: 0 22px 52px rgba(15, 23, 42, 0.32);
  }

  .bubble svg {
    width: 28px;
    height: 28px;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    margin-right: 8px;
    background: var(--ccais-accent-color);
    border-radius: 999px;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
  }

  .header-title {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  @media (max-width: 480px) {
    :host {
      right: 16px;
      bottom: 16px;
    }

    :host([position="bottom-left"]) {
      left: 16px;
    }

    .panel {
      width: calc(100vw - 32px);
      height: min(590px, calc(100vh - 96px));
      bottom: 72px;
    }

    .message {
      max-width: 92%;
    }
  }
`;
