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


export const TestExecutionRequestSchema = z
  .object({
    test_id: z.string(),
  })
  .strict();

export const TestExecutionResponseSchema = z
  .object({
    success: z.boolean(),
    output: z.string(),
    test_id: z.string(),
    test_plan: z.array(z.string()).nullable().optional(),
    failing_step: z.string().nullable().optional(),
    failing_step_index: z.number().int().nullable().optional(),
    screenshot_id: z.string().nullable().optional(),
  })
  .strict();