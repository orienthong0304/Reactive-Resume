import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

export const createSmartTableSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(255, "标题最多255个字符"),
  file: z.any(), // 改为 any 类型，因为在服务器端我们会单独处理文件
});

export class CreateSmartTableDto extends createZodDto(createSmartTableSchema) {}