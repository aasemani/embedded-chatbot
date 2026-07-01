import { z } from "zod";

export const chatRoleSchema = z.enum(["user", "assistant", "system"]);

export const createChatRequestSchema = (maxMessageLength: number) => {
  const chatMessageSchema = z.object({
    role: chatRoleSchema,
    content: z.string().trim().min(1).max(maxMessageLength)
  });

  return z.object({
    chatbotId: z.string().trim().min(1).max(100),
    sessionId: z.string().trim().min(1).max(128),
    message: z.string().trim().min(1).max(maxMessageLength),
    history: z.array(chatMessageSchema).max(50).default([])
  });
};

export type ChatRequestBody = z.infer<ReturnType<typeof createChatRequestSchema>>;
export type ChatMessage = ChatRequestBody["history"][number];
