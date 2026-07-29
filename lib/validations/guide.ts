import { z } from "zod";

export const guideStepSchema = z.object({
  stepNum: z.number().int().positive(),
  title: z.string().min(1, "กรุณากรอกหัวข้อขั้นตอน"),
  instruction: z.string().min(1, "กรุณากรอกคำอธิบายขั้นตอน"),
  mediaUrl: z.string().url("กรุณากรอก URL วิดีโอ/รูปภาพที่ถูกต้อง").or(z.literal("")).optional(),
  pdfUrl: z.string().url("กรุณากรอก URL เอกสารที่ถูกต้อง").or(z.literal("")).optional(),
  warning: z.string().optional(),
});

export const guideSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "กรุณากรอกชื่อคู่มือ"),
  categoryId: z.string().min(1, "กรุณาเลือกประเภทสินค้า"),
  subcategoryId: z.string().optional(),
  modelIds: z.array(z.string()).optional(),
  symptomTypeId: z.string().optional(),
  symptomId: z.string().optional(),
  description: z.string().optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  timeEstimated: z.string().optional(),
  status: z.enum(["published", "draft", "archived"]),
  tags: z.array(z.string()),
  toolsRequired: z.array(z.string()),
  partsRequired: z.array(z.string()),
  steps: z.array(guideStepSchema).min(1, "ต้องมีขั้นตอนอย่างน้อย 1 ขั้นตอน"),
});

export type GuideFormData = z.infer<typeof guideSchema>;
export type GuideStepFormData = z.infer<typeof guideStepSchema>;
