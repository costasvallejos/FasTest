import { z } from "zod"

export const TestGenerationRequestSchema = z.object({
  target_url: z.string(),
  test_case_description: z.string(),
  // Optional in payload and may be null (matches Optional[str] = None)
  instance_id: z.string().optional().nullable(),
})

export const TestGenerationResponseSchema = z.object({
  test_plan: z.array(z.string()),
  test_script: z.string(),
  status: z.string(),
})
