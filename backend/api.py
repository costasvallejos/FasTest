"""
FastAPI Server for E2E Test Generation

API endpoints for test generation service.
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from api_client_test_writer import generate_test_for_api

from api_client_playwright_executor import execute_playwright_test
from utils import cleanup_workspace as cleanup_workspace_util

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="E2E Test Generator API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # any origin
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # any request headers
    allow_credentials=False,  # must be False if allow_origins=["*"]
)


class TestGenerationRequest(BaseModel):
    """Request model for test generation."""

    target_url: str
    test_case_description: str
    instance_id: Optional[str] = None


class TestGenerationResponse(BaseModel):
    """Response model with generated test data."""

    test_plan: list[str]
    test_script: str
    status: str


class TestExecutionRequest(BaseModel):
    """Request model for test execution."""

    test_id: str


class TestExecutionResponse(BaseModel):
    """Response model for test execution."""

    success: bool
    output: str
    test_id: str
    test_plan: Optional[list[str]] = None


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "E2E Test Generator API",
        "status": "running",
        "version": "1.0.0",
    }


@app.post("/generate-test", response_model=TestGenerationResponse)
async def generate_test_endpoint(request: TestGenerationRequest):
    """
    Generate E2E test for the specified test case.

    Args:
        request: Test generation request with target URL and test case description

    Returns:
        TestGenerationResponse with test plan, script, and workspace info
    """
    from dotenv import load_dotenv
    import uuid

    load_dotenv()

    # Validate API key
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=500, detail="OPENAI_API_KEY not configured on server"
        )

    # Generate instance ID for logging
    instance_id = request.instance_id or str(uuid.uuid4())[:8]

    # Log request start to main console
    print(f"\n{'='*80}")
    print("New test generation request started")
    print(f"Instance ID: {instance_id}")
    print(f"Target URL: {request.target_url}")
    print(f"Test Case: {request.test_case_description}")
    print(f"{'='*80}\n")

    try:
        # Generate test
        result = await generate_test_for_api(
            test_case_description=request.test_case_description,
            target_url=request.target_url,
            instance_id=instance_id,
        )

        # Log workspace path
        log_path = os.path.join(result["workspace_dir"], "logs", "request.log")
        print(f"Log Path: {log_path}\n")

        # Build response
        test_script_path = os.path.join(
            result["workspace_dir"], "testjs", "tests", "test.spec.js"
        )

        response = TestGenerationResponse(
            test_plan=result.get("test_plan"),
            test_script=result.get("test_script"),
            status="success",
        )

        # Cleanup data store (imported from test generator)
        from api_client_test_writer import test_data_store

        if result["instance_id"] in test_data_store:
            del test_data_store[result["instance_id"]]

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test generation failed: {str(e)}")


@app.delete("/workspace/{instance_id}")
async def cleanup_workspace(instance_id: str, keep_tests: bool = False):
    """
    Clean up workspace for a specific instance.

    Args:
        instance_id: The instance ID to clean up
        keep_tests: If True, only remove browser data and node_modules
    """
    success = cleanup_workspace_util(instance_id, keep_tests)

    if not success:
        raise HTTPException(
            status_code=404, detail=f"Workspace not found for instance {instance_id}"
        )

    return {
        "status": "success",
        "message": f"Workspace cleaned for instance {instance_id}",
        "kept_tests": keep_tests,
    }


@app.post("/execute-test", response_model=TestExecutionResponse)
async def execute_test_endpoint(request: TestExecutionRequest):
    """
    Execute a Playwright test from the database.

    Args:
        request: Test execution request with test ID

    Returns:
        TestExecutionResponse with success status, output, and test plan
    """
    print(f"\n{'='*80}")
    print("Test execution request started")
    print(f"Test ID: {request.test_id}")
    print(f"{'='*80}\n")

    try:
        result = execute_playwright_test(request.test_id)

        return TestExecutionResponse(
            success=result["success"],
            output=result["output"],
            test_id=result["test_id"],
            test_plan=result.get("test_plan"),
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test execution failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
    # run this as well
    # ngrok http --url=superelegant-lovetta-unfilmed.ngrok-free.dev 8000
