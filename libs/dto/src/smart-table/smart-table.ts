import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

export const smartTableSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(255),
  data: z.array(z.unknown()).or(z.null()),
  userId: idSchema,
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export class SmartTableDto extends createZodDto(smartTableSchema) {}