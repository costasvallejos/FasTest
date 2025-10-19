import {
  TestGenerationResponseSchema,
  TestGenerationRequestSchema,
  TestExecutionRequestSchema,
  TestExecutionResponseSchema,
} from "../schemas/generateTestSchema.js"
import { API_BASE_URL } from "../constants.js"
import { getDummyTestGenerationResponse } from "../test_data/dummyData.js"

export const generateTest = async (requestData) => {
  TestGenerationRequestSchema.parse(requestData)

  // !!! USING DUMMY DATA
  const responseData = getDummyTestGenerationResponse()

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 20000))

  // const response = await fetch(`${API_BASE_URL}/generate-test`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(requestData),
  // })
  // const responseData = await response.json()

  TestGenerationResponseSchema.parse(responseData)

  return responseData
}

export const executeTest = async (requestData) => {
  TestExecutionRequestSchema.parse(requestData)

  const response = await fetch(`${API_BASE_URL}/execute-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
  const responseData = await response.json()

  TestExecutionResponseSchema.parse(responseData)

  return responseData
}
