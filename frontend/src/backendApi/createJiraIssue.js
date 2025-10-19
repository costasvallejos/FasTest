import {
  JiraIssueRequestSchema,
  JiraIssueResponseSchema,
} from "../schemas/jiraIssueSchema.js"
import { API_BASE_URL } from "../constants.js"

export const createJiraIssue = async (requestData) => {
  JiraIssueRequestSchema.parse(requestData)

  const response = await fetch(`${API_BASE_URL}/create-jira-issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to create Jira issue: ${response.statusText}`)
  }

  const responseData = await response.json()
  JiraIssueResponseSchema.parse(responseData)

  return responseData
}
