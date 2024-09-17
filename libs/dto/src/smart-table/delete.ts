import { idSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

export const deleteSmartTableSchema = z.object({
  id: idSchema,
});

export class DeleteSmartTableDto extends createZodDto(deleteSmartTableSchema) {}
