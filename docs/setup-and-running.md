# Setup And Running

This guide walks through installing the monorepo, configuring the secure backend proxy, running the local server, and opening the example frontends.

## Prerequisites

- Node.js `20` or newer.
- pnpm `11.7.0` or compatible.
- A running Open WebUI instance.
- A server-side Open WebUI API key.

The Open WebUI API key must stay on the backend. Do not add it to frontend `.env` files or browser-facing environment variables.

## 1. Install Dependencies

From the repository root:

```bash
pnpm install
```

If pnpm asks to approve dependency build scripts, approve `esbuild`. Vite and tsup need it for package builds.

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

## 3. Build Packages

Build all packages:

```bash
pnpm build
```

This creates:

- `packages/core/dist/ccais-embedded-chatbot.js`
- React wrapper output in `packages/react/dist`
- Angular wrapper output in `packages/angular/dist`
- Server output in `packages/server/dist`

## 4. Run The Backend In Development

Start the Fastify proxy:

```bash
pnpm dev
```

Equivalent package-specific command:

```bash
pnpm --filter @ccais/embedded-chatbot-server dev
```

Verify the server:

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

## 5. Test A Chat Request

With the backend running and Open WebUI available, send a request:

```bash
curl -X POST http://localhost:4000/api/chat \
  -H "content-type: application/json" \
  --data '{
    "chatbotId": "support",
    "sessionId": "local-test-session",
    "message": "Hello",
    "history": []
  }'
```

Expected shape:

```json
{
  "message": "Assistant response text"
}
```

The backend forwards the request to:

```text
POST {OPEN_WEBUI_BASE_URL}/api/chat/completions
```

using `Authorization: Bearer {OPEN_WEBUI_API_KEY}` on the server side only.

## 6. Run The Plain HTML Example

Build the core package first:

```bash
pnpm --filter @ccais/embedded-chatbot-core build
```

Open:

```text
examples/plain-html/index.html
```

The page imports:

```html
<script type="module" src="../../packages/core/dist/ccais-embedded-chatbot.js"></script>
```

The chatbot element points to:

```html
api-base-url="http://localhost:4000"
```

Keep the backend proxy running while using the example.

## 7. Run The React Demo

Build the packages first so workspace package exports resolve:

```bash
pnpm build
```

Start the React demo:

```bash
pnpm --filter @ccais/embedded-chatbot-react-demo dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173
```

Keep the backend running in another terminal:

```bash
pnpm dev
```

`http://localhost:5173` is included in the default `ALLOWED_ORIGINS`.

## 8. Use The Angular Wrapper

The Angular package exports `CcaisChatbotModule` and `CcaisChatbotComponent`.

Import the module:

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

## 9. Production-Like Local Run

Build the server:

```bash
pnpm --filter @ccais/embedded-chatbot-server build
```

Start compiled JavaScript:

```bash
pnpm --filter @ccais/embedded-chatbot-server start
```

The same `.env` values are used.

## 10. Useful Commands

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm clean
pnpm dev
```

Package-specific examples:

```bash
pnpm --filter @ccais/embedded-chatbot-core build
pnpm --filter @ccais/embedded-chatbot-react build
pnpm --filter @ccais/embedded-chatbot-angular build
pnpm --filter @ccais/embedded-chatbot-server dev
pnpm --filter @ccais/embedded-chatbot-server start
```

## Troubleshooting

Server fails with `OPEN_WEBUI_API_KEY is required`:

Set `OPEN_WEBUI_API_KEY` in `.env`. This is expected protection so the server never starts with an unsafe or incomplete proxy configuration.

Browser shows a CORS error:

Add the browser origin to `ALLOWED_ORIGINS`, then restart the backend. Origins must include protocol and port, for example `http://localhost:5173`.

Chat response says the request could not be processed:

Confirm Open WebUI is running, `OPEN_WEBUI_BASE_URL` is correct, `OPEN_WEBUI_MODEL` exists, and the API key is valid.

Plain HTML example does not load the chatbot:

Run `pnpm --filter @ccais/embedded-chatbot-core build` and confirm `packages/core/dist/ccais-embedded-chatbot.js` exists.

React demo loads but chat requests fail:

Keep the backend running with `pnpm dev`, and confirm the React demo origin is in `ALLOWED_ORIGINS`.
