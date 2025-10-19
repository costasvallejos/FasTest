const dummyTestGenerationResponse = {
  test_plan: [
    "Check if the login page loads",
    "Verify username input",
    "Verify password input",
    "Test login button",
  ],
  test_script: "function testLogin() { /* test script here */ }",
  status: "success",
}

export const getDummyTestGenerationResponse = () => {
  return dummyTestGenerationResponse
}
