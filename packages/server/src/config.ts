import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { config as loadEnvFile } from "dotenv";
import { z } from "zod";

const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));
const cwdEnvPath = resolve(process.cwd(), ".env");

for (const envPath of new Set([cwdEnvPath, rootEnvPath])) {
  loadEnvFile({ path: envPath });
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().min(1).default("0.0.0.0"),
  OPEN_WEBUI_BASE_URL: z.string().url().default("http://localhost:3000"),
  OPEN_WEBUI_API_KEY: z
    .string({
      required_error:
        "OPEN_WEBUI_API_KEY is required. Set it in the server environment; never expose it to frontend code."
    })
    .trim()
    .min(1, "OPEN_WEBUI_API_KEY is required. Set it in the server environment."),
  OPEN_WEBUI_MODEL: z.string().min(1).default("llama3.1"),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:4200,http://localhost:8080"),
  DEFAULT_SYSTEM_PROMPT: z.string().min(1).default("You are a helpful assistant."),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_TIME_WINDOW: z.string().min(1).default("1 minute"),
  MAX_MESSAGE_LENGTH: z.coerce.number().int().positive().max(20000).default(4000)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid CCAIS embedded chatbot server configuration:\n${details}`);
}

const env = parsedEnv.data;

export const config = {
  port: env.PORT,
  host: env.HOST,
  openWebuiBaseUrl: env.OPEN_WEBUI_BASE_URL.replace(/\/+$/, ""),
  openWebuiApiKey: env.OPEN_WEBUI_API_KEY,
  openWebuiModel: env.OPEN_WEBUI_MODEL,
  allowedOrigins: env.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  defaultSystemPrompt: env.DEFAULT_SYSTEM_PROMPT,
  rateLimitMax: env.RATE_LIMIT_MAX,
  rateLimitTimeWindow: env.RATE_LIMIT_TIME_WINDOW,
  maxMessageLength: env.MAX_MESSAGE_LENGTH
} as const;

export type ServerConfig = typeof config;
