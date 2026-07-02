import type { FastifyPluginAsync } from "fastify";
import type { ServerResponse } from "node:http";
import { config } from "../config";
import { createChatRequestSchema } from "../schemas/chat.schema";
import { OpenWebUIService, SAFE_ASSISTANT_ERROR_MESSAGE } from "../services/openwebui.service";

const chatRequestSchema = createChatRequestSchema(config.maxMessageLength);
const openWebUIService = new OpenWebUIService(config);

function writeSseEvent(response: ServerResponse, event: string, payload: unknown): void {
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export const chatRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post("/api/chat", async (request, reply) => {
    const parsedBody = chatRequestSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({
        message: "Invalid chat request."
      });
    }

    try {
      const assistantStream = await openWebUIService.createChatCompletionStream({
        message: parsedBody.data.message,
        history: parsedBody.data.history
      });

      reply.hijack();
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no"
      });

      let hasContent = false;

      try {
        for await (const delta of assistantStream) {
          hasContent = true;
          writeSseEvent(reply.raw, "delta", { delta });
        }

        if (!hasContent) {
          writeSseEvent(reply.raw, "delta", { delta: SAFE_ASSISTANT_ERROR_MESSAGE });
        }

        writeSseEvent(reply.raw, "done", {});
      } catch (streamError) {
        request.log.error({ error: streamError }, "Open WebUI stream failed");
        writeSseEvent(reply.raw, "error", { message: SAFE_ASSISTANT_ERROR_MESSAGE });
      } finally {
        reply.raw.end();
      }
    } catch (error) {
      request.log.error({ error }, "Open WebUI proxy request failed");

      return reply.code(502).send({
        message: SAFE_ASSISTANT_ERROR_MESSAGE
      });
    }
  });
};
