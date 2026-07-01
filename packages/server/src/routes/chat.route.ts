import type { FastifyPluginAsync } from "fastify";
import { config } from "../config";
import { createChatRequestSchema } from "../schemas/chat.schema";
import { OpenWebUIService, SAFE_ASSISTANT_ERROR_MESSAGE } from "../services/openwebui.service";

const chatRequestSchema = createChatRequestSchema(config.maxMessageLength);
const openWebUIService = new OpenWebUIService(config);

export const chatRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post("/api/chat", async (request, reply) => {
    const parsedBody = chatRequestSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({
        message: "Invalid chat request."
      });
    }

    try {
      const assistantMessage = await openWebUIService.createChatCompletion({
        message: parsedBody.data.message,
        history: parsedBody.data.history
      });

      return reply.send({
        message: assistantMessage
      });
    } catch (error) {
      request.log.error({ error }, "Open WebUI proxy request failed");

      return reply.code(502).send({
        message: SAFE_ASSISTANT_ERROR_MESSAGE
      });
    }
  });
};
