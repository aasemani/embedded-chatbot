# Setup And Running

This guide walks through installing the npm monorepo, configuring the secure backend proxy, running each layer, and opening the example frontends.

## Prerequisites

- Node.js `20` or newer.
- npm `10` or newer.
- A running Open WebUI instance.
- A server-side Open WebUI API key.

The Open WebUI API key must stay on the backend. Do not add it to frontend `.env` files or browser-facing environment variables.

Chat responses stream end to end. The backend sends `"stream": true` to Open WebUI and exposes the result to browsers as sanitized server-sent events.

## 1. Install Dependencies

Install once from the repository root:

```bash
npm install
```

npm workspaces install and link:

- `@ccais/embedded-chatbot-core`
- `@ccais/embedded-chatbot-server`
- `@ccais/embedded-chatbot-react`
- `@ccais/embedded-chatbot-angular`
- `@ccais/embedded-chatbot-react-demo`
- `@ccais/embedded-chatbot-angular-demo`

## 2. Configure The Backend

Create a local environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```dotenv
PORT=4000
HOST=0.0.0.0
OPEN_WEBUI_BASE_URL=http://localhost:3000
OPEN_WEBUI_API_KEY=replace-with-server-side-openwebui-api-key
OPEN_WEBUI_MODEL=llama3.1
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4200,http://localhost:8080
DEFAULT_SYSTEM_PROMPT=You are a helpful assistant.
RATE_LIMIT_MAX=60
RATE_LIMIT_TIME_WINDOW=1 minute
MAX_MESSAGE_LENGTH=4000
```

Required values:

- `OPEN_WEBUI_API_KEY`: must be set or the server fails fast on startup.
- `OPEN_WEBUI_BASE_URL`: must point to your Open WebUI server.
- `OPEN_WEBUI_MODEL`: must be a model available to Open WebUI.
- `ALLOWED_ORIGINS`: must include each website or local dev server origin that will load the chatbot.

## 3. Root Commands

Run these from the repository root:

```bash
npm run build
npm run typecheck
npm run lint
npm run clean
npm run dev
```

`npm run dev` starts the backend proxy.

## 4. Core SDK Layer

Package:

```text
@ccais/embedded-chatbot-core
```

Build the framework-agnostic Lit web component:

```bash
npm run build --workspace @ccais/embedded-chatbot-core
```

Typecheck it:

```bash
npm run typecheck --workspace @ccais/embedded-chatbot-core
```

Watch-build during SDK development:

```bash
npm run dev --workspace @ccais/embedded-chatbot-core
```

Build output:

```text
packages/core/dist/ccais-embedded-chatbot.js
packages/core/dist/index.d.ts
```

Browser usage:

```html
<script type="module" src="./path/to/ccais-embedded-chatbot.js"></script>
<ccais-chatbot api-base-url="http://localhost:4000"></ccais-chatbot>
```

## 5. Backend Proxy Layer

Package:

```text
@ccais/embedded-chatbot-server
```

Run the server in development:

```bash
npm run dev --workspace @ccais/embedded-chatbot-server
```

Verify health:

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

Build the server:

```bash
npm run build --workspace @ccais/embedded-chatbot-server
```

Start compiled JavaScript:

```bash
npm run start --workspace @ccais/embedded-chatbot-server
```

Test a chat request:

```bash
curl -N -X POST http://localhost:4000/api/chat \
  -H "accept: text/event-stream" \
  -H "content-type: application/json" \
  --data '{
    "chatbotId": "support",
    "sessionId": "local-test-session",
    "message": "Hello",
    "history": []
  }'
```

Expected shape:

```text
event: delta
data: {"delta":"Assistant response chunk"}

event: delta
data: {"delta":"Another response chunk"}

event: done
data: {}
```

The backend forwards the request to:

```text
POST {OPEN_WEBUI_BASE_URL}/api/chat/completions
```

using `Authorization: Bearer {OPEN_WEBUI_API_KEY}` on the server side only. The Open WebUI payload includes:

```json
{
  "stream": true
}
```

The frontend never receives the Open WebUI API key or raw backend error details.

## 6. React Wrapper Layer

Package:

```text
@ccais/embedded-chatbot-react
```

Build the React wrapper:

```bash
npm run build --workspace @ccais/embedded-chatbot-react
```

Typecheck it:

```bash
npm run typecheck --workspace @ccais/embedded-chatbot-react
```

Use it in a React app:

```tsx
import { CcaisChatbot } from "@ccais/embedded-chatbot-react";

export default function App() {
  return <CcaisChatbot chatbotId="support" apiBaseUrl="http://localhost:4000" />;
}
```

Run the included React demo:

```bash
npm run dev --workspace @ccais/embedded-chatbot-react-demo
```

Keep the backend running in another terminal:

```bash
npm run dev --workspace @ccais/embedded-chatbot-server
```

Vite usually serves the React demo at:

```text
http://localhost:5173
```

`http://localhost:5173` is included in the default `ALLOWED_ORIGINS`.

## 7. Angular Wrapper Layer

Package:

```text
@ccais/embedded-chatbot-angular
```

Build the Angular wrapper:

```bash
npm run build --workspace @ccais/embedded-chatbot-angular
```

Typecheck it:

```bash
npm run typecheck --workspace @ccais/embedded-chatbot-angular
```

Use it in an Angular app:

```ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { CcaisChatbotModule } from "@ccais/embedded-chatbot-angular";

@NgModule({
  imports: [BrowserModule, CcaisChatbotModule]
})
export class AppModule {}
```

Render the wrapper:

```html
<ccais-chatbot-wrapper
  chatbotId="support"
  apiBaseUrl="http://localhost:4000"
></ccais-chatbot-wrapper>
```

If your Angular dev server runs on a different port, add that origin to `ALLOWED_ORIGINS`.

## 8. Plain HTML Example

Build the core package first:

```bash
npm run build --workspace @ccais/embedded-chatbot-core
```

Serve the repository root:

```bash
python3 -m http.server 8090
```

Open:

```text
http://127.0.0.1:8090/examples/plain-html/index.html
```

Keep the backend proxy running while using the example:

```bash
npm run dev --workspace @ccais/embedded-chatbot-server
```

## 9. Design Preview

Build the core package:

```bash
npm run build --workspace @ccais/embedded-chatbot-core
```

Serve the repository root:

```bash
python3 -m http.server 8090
```

Open:

```text
http://127.0.0.1:8090/examples/design-preview/index.html
```

The design preview is preloaded with sample messages and does not require Open WebUI.

## Troubleshooting

Server fails with `OPEN_WEBUI_API_KEY is required`:

Set `OPEN_WEBUI_API_KEY` in `.env`. This is expected protection so the server never starts with an unsafe or incomplete proxy configuration.

Browser shows a CORS error:

Add the browser origin to `ALLOWED_ORIGINS`, then restart the backend. Origins must include protocol and port, for example `http://localhost:5173`.

Chat response says the request could not be processed:

Confirm Open WebUI is running, `OPEN_WEBUI_BASE_URL` is correct, `OPEN_WEBUI_MODEL` exists, and the API key is valid.

Streaming request appears to hang in curl:

Use `curl -N` so curl does not buffer the server-sent event stream.

Plain HTML example does not load the chatbot:

Run `npm run build --workspace @ccais/embedded-chatbot-core` and confirm `packages/core/dist/ccais-embedded-chatbot.js` exists.

React demo loads but chat requests fail:

Keep the backend running with `npm run dev --workspace @ccais/embedded-chatbot-server`, and confirm the React demo origin is in `ALLOWED_ORIGINS`.
