import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";
import { idSchema } from "@reactive-resume/schema";

export const updateSmartTableSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(255).optional(),
  data: z.record(z.unknown()).optional(),
});

export class UpdateSmartTableDto extends createZodDto(updateSmartTableSchema) {}
