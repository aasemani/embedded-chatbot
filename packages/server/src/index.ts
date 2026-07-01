import { pathToFileURL } from "node:url";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { config } from "./config";
import { chatRoute } from "./routes/chat.route";
import { isOriginAllowed } from "./utils/domain-guard";

export async function buildServer() {
  const fastify = Fastify({
    logger: true
  });

  await fastify.register(cors, {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, config.allowedOrigins)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS policy"), false);
    },
    methods: ["GET", "POST", "OPTIONS"]
  });

  await fastify.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: config.rateLimitTimeWindow
  });

  fastify.get("/health", async () => ({
    status: "ok",
    service: "CCAIS Embedded Chatbot Server"
  }));

  await fastify.register(chatRoute);

  return fastify;
}

const entrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined;

if (entrypoint === import.meta.url) {
  try {
    const server = await buildServer();
    await server.listen({
      host: config.host,
      port: config.port
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
