import { z } from "zod"

export const TestGenerationRequestSchema = z.object({
  target_url: z.string(),
  test_case_description: z.string(),
})

export const TestGenerationResponseSchema = z.object({
  test_plan: z.array(z.string()),
  test_script: z.string(),
  status: z.string(),
})
