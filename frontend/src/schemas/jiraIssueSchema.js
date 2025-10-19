import { z } from "zod";

// JiraIssueRequest
export const JiraIssueRequestSchema = z.object({
  summary: z.string(),
  description: z.string(),
  issue_type: z.string().default("Bug"),
}).strict();


// JiraIssueResponse
export const JiraIssueResponseSchema = z.object({
  issue_key: z.string(),
  issue_url: z.string().url().or(z.string()), // relax to string if URLs may be non-HTTP
  status: z.string(),
}).strict();
