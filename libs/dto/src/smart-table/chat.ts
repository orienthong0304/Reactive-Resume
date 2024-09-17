import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

export const chatSchema = z.object({
  id: idSchema,
  message: z.string(),
  isUser: z.boolean(),
  smartTableId: idSchema,
  createdAt: z.date().or(z.dateString()),
});

export class ChatDto extends createZodDto(chatSchema) {}

export const createChatSchema = chatSchema.pick({
  message: true,
  isUser: true,
  smartTableId: true,
});

export class CreateChatDto extends createZodDto(createChatSchema) {}
