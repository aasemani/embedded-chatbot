# CCAIS Embedded Chatbot

Phase 1 of `CCAIS-embedded-chatbot` is a reusable embedded chatbot SDK for websites. It provides a framework-agnostic web component, thin React and Angular wrappers, and a secure backend proxy for Open WebUI.

The browser never receives the Open WebUI API key. Frontend code calls the backend proxy, and the proxy calls Open WebUI with the server-side key.

## Architecture

```text
Host website
  |
  | imports one of:
  | - @ccais/embedded-chatbot-core
  | - @ccais/embedded-chatbot-react
  | - @ccais/embedded-chatbot-angular
  v
<ccais-chatbot> web component
  |
  | POST /api/chat
  v
@ccais/embedded-chatbot-server
  |
  | Authorization: Bearer OPEN_WEBUI_API_KEY
  v
Open WebUI /api/chat/completions
```

## Packages

- `@ccais/embedded-chatbot-core`: Lit web component and browser chat client.
- `@ccais/embedded-chatbot-react`: React wrapper that only passes props to the web component.
- `@ccais/embedded-chatbot-angular`: Angular wrapper module/component for the web component.
- `@ccais/embedded-chatbot-server`: Fastify backend proxy for Open WebUI.

## Quick Start

For complete setup and run instructions, see [docs/setup-and-running.md](docs/setup-and-running.md).

```bash
pnpm install
cp .env.example .env
```

Edit `.env` and set `OPEN_WEBUI_API_KEY` to the real server-side Open WebUI key. Then build the packages and start the backend proxy:

```bash
pnpm build
pnpm dev
```

Verify the backend:

```bash
curl http://localhost:4000/health
```

Open `examples/plain-html/index.html` in a browser after the core package has been built. The chatbot will call `http://localhost:4000/api/chat`.

## Security Model

Do not put `OPEN_WEBUI_API_KEY` or any equivalent key in frontend environment variables. Values such as `VITE_OPEN_WEBUI_API_KEY`, `REACT_APP_OPEN_WEBUI_API_KEY`, `NEXT_PUBLIC_OPEN_WEBUI_API_KEY`, and `ANGULAR_APP_OPEN_WEBUI_API_KEY` are unsafe because browser bundles are inspectable by users.

Only the backend reads `OPEN_WEBUI_API_KEY`. The frontend sends chat requests to `POST {apiBaseUrl}/api/chat`, and the backend forwards validated requests to Open WebUI.

## Install

```bash
pnpm install
```

## Backend Setup

Create a server environment file from the example:

```bash
cp .env.example .env
```

Set `OPEN_WEBUI_API_KEY` to the real server-side key, then start the proxy:

```bash
pnpm --filter @ccais/embedded-chatbot-server dev
```

Health check:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "CCAIS Embedded Chatbot Server"
}
```

## Environment Variables

- `PORT`: Backend port. Defaults to `4000`.
- `HOST`: Backend bind host. Defaults to `0.0.0.0`.
- `OPEN_WEBUI_BASE_URL`: Open WebUI base URL.
- `OPEN_WEBUI_API_KEY`: Required server-side API key.
- `OPEN_WEBUI_MODEL`: Model sent to Open WebUI.
- `ALLOWED_ORIGINS`: Comma-separated CORS allowlist.
- `DEFAULT_SYSTEM_PROMPT`: System message prepended by the proxy.
- `RATE_LIMIT_MAX`: Request count allowed per rate limit window.
- `RATE_LIMIT_TIME_WINDOW`: Fastify rate limit window, such as `1 minute`.
- `MAX_MESSAGE_LENGTH`: Maximum accepted message and history item length.

## Core Web Component Usage

Importing the core package registers `<ccais-chatbot>`.

```ts
import "@ccais/embedded-chatbot-core";
```

```html
<ccais-chatbot
  chatbot-id="support"
  name="CCAIS Assistant"
  primary-color="#0066CC"
  accent-color="#10B981"
  position="bottom-right"
  welcome-message="Hi, how can I help you?"
  placeholder="Type your message..."
  api-base-url="http://localhost:4000"
></ccais-chatbot>
```

Supported positions are `bottom-right` and `bottom-left`.

## React Usage

```tsx
import { CcaisChatbot } from "@ccais/embedded-chatbot-react";

export default function App() {
  return <CcaisChatbot chatbotId="support" apiBaseUrl="http://localhost:4000" />;
}
```

## Angular Usage

```ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { CcaisChatbotModule } from "@ccais/embedded-chatbot-angular";

@NgModule({
  imports: [BrowserModule, CcaisChatbotModule]
})
export class AppModule {}
```

```html
<ccais-chatbot-wrapper
  chatbotId="support"
  apiBaseUrl="http://localhost:4000"
></ccais-chatbot-wrapper>
```

## Plain HTML Usage

Build the core package first:

```bash
pnpm --filter @ccais/embedded-chatbot-core build
```

Then open `examples/plain-html/index.html`. It loads:

```html
<script type="module" src="../../packages/core/dist/ccais-embedded-chatbot.js"></script>
```

## Design Preview

Open `examples/design-preview/index.html` after building the core package to see a sample host dashboard with the chatbot opened and preloaded with example messages.

Generated reference screenshots:

- `examples/design-preview/ccais-chatbot-design-preview.png`
- `examples/design-preview/ccais-chatbot-design-preview-mobile.png`

## Local Development Commands

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm dev
```

`pnpm dev` starts the backend proxy. Package-specific commands can be run with `pnpm --filter <package-name> <script>`.

Common package commands:

```bash
pnpm --filter @ccais/embedded-chatbot-server dev
pnpm --filter @ccais/embedded-chatbot-server build
pnpm --filter @ccais/embedded-chatbot-server start
pnpm --filter @ccais/embedded-chatbot-core build
pnpm --filter @ccais/embedded-chatbot-react build
pnpm --filter @ccais/embedded-chatbot-angular build
pnpm --filter @ccais/embedded-chatbot-react-demo dev
```

For production-like local server startup:

```bash
pnpm --filter @ccais/embedded-chatbot-server build
pnpm --filter @ccais/embedded-chatbot-server start
```

## Troubleshooting

- Server exits on startup: confirm `.env` exists and `OPEN_WEBUI_API_KEY` is set.
- Browser CORS error: add the website origin to `ALLOWED_ORIGINS`.
- Chat request returns a safe error message: confirm `OPEN_WEBUI_BASE_URL`, `OPEN_WEBUI_MODEL`, and the API key are valid.
- Plain HTML example has no chatbot script: run `pnpm --filter @ccais/embedded-chatbot-core build` first.

## Phase 1 Limitations

Phase 1 does not include:

- Streaming responses
- Admin dashboard
- Database persistence
- Multi-tenant config database
- Analytics
- Human handoff
- Cloudflare CDN
- File upload
- RAG collection selection UI

## Future Roadmap

- Streaming response support.
- Durable session and chat history storage.
- Tenant-level chatbot configuration.
- Admin dashboard for prompt, theme, and model settings.
- Analytics and conversation quality reporting.
- Human handoff workflows.
- Optional CDN distribution after packaging and security review.
- File upload and RAG collection controls.
