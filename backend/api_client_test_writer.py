"""
FastAPI Server for E2E Test Generation

Simple API endpoint to trigger isolated test generation using Playwright MCP.
Each request generates tests in an isolated workspace.
"""

import os
import uuid
import tempfile
import shutil
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException
from prompts.system_prompt_string import SYSTEM_PROMPT
from pydantic import BaseModel
from dotenv import load_dotenv

# Import from prototype_tests
import sys

from utils import add_step_logging_to_test_script


sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

app = FastAPI(title="E2E Test Generator API")


class TestGenerationRequest(BaseModel):
    """Request model for test generation."""

    target_url: str
    test_case_description: str
    instance_id: Optional[str] = None


class TestGenerationResponse(BaseModel):
    """Response model with generated test data."""

    # instance_id: str
    # workspace_path: str
    # test_script_path: str
    test_plan: list[str]
    test_script: str
    status: str


# Storage for capturing test data during generation
test_data_store = {}


def setup_logger(instance_id: str, workspace_dir: str) -> logging.Logger:
    """Create a logger for a specific test instance."""
    log_dir = os.path.join(workspace_dir, "logs")
    os.makedirs(log_dir, exist_ok=True)

    logger = logging.getLogger(f"test_gen_{instance_id}")
    logger.setLevel(logging.INFO)
    logger.propagate = False

    # Remove existing handlers
    logger.handlers.clear()

    # File handler
    file_handler = logging.FileHandler(os.path.join(log_dir, "request.log"))
    file_handler.setLevel(logging.INFO)

    # Format
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)

    return logger


def create_test_data_capture(instance_id: str, logger: logging.Logger):
    """Factory to create tool functions that capture data for API response."""
    from agents import function_tool

    test_data_store[instance_id] = {"test_plan": None, "test_script": None}

    def create_write_test_plan(workspace_dir: str):
        @function_tool
        def write_test_plan(steps: list[str]) -> str:
            logger.info("TEST PLAN WRITTEN:")
            for step in steps:
                logger.info(f"- {step}")
            print()

            # Capture for API response
            test_data_store[instance_id]["test_plan"] = steps
            return "Test plan recorded successfully"

        return write_test_plan

    def create_write_test_script(workspace_dir: str):
        @function_tool
        def write_test_script(script: str) -> str:
            script = add_step_logging_to_test_script(script)

            logger.info("=" * 80)
            logger.info("TEST SCRIPT")
            logger.info("=" * 80)
            logger.info(script)
            logger.info("=" * 80)

            # Capture for API response
            test_data_store[instance_id]["test_script"] = script

            # Write to workspace
            testjs_dir = os.path.join(workspace_dir, "testjs")
            tests_dir = os.path.join(testjs_dir, "tests")
            output_path = os.path.join(tests_dir, "test.spec.js")

            os.makedirs(tests_dir, exist_ok=True)

            with open(output_path, "w") as f:
                f.write(script)

            logger.info(f"Test script written to: {output_path}")

            # Copy configs
            import subprocess

            original_testjs = os.path.join(
                os.path.dirname(os.path.abspath(__file__)), "testjs"
            )

            for config_file in ["playwright.config.js", "package.json"]:
                workspace_config = os.path.join(testjs_dir, config_file)
                if not os.path.exists(workspace_config):
                    original_config = os.path.join(original_testjs, config_file)
                    if os.path.exists(original_config):
                        shutil.copy2(original_config, workspace_config)

            # Install dependencies if needed
            node_modules = os.path.join(testjs_dir, "node_modules")
            if not os.path.exists(node_modules):
                logger.info(f"Installing dependencies in {testjs_dir}...")
                try:
                    subprocess.run(
                        ["npm", "install"],
                        cwd=testjs_dir,
                        capture_output=True,
                        text=True,
                        timeout=120,
                    )
                except Exception as e:
                    logger.warning(f"Failed to install dependencies: {e}")

            # Run tests
            logger.info(f"Running tests from {testjs_dir}...")
            try:
                result = subprocess.run(
                    ["npm", "run", "test"],
                    cwd=testjs_dir,
                    capture_output=True,
                    text=True,
                    timeout=60,
                )
                output = f"STDOUT:\n{result.stdout}\n\nSTDERR:\n{result.stderr}\n\nReturn Code: {result.returncode}"
                logger.info(f"Test execution completed. Output:\n{output}")
                return f"Test Execution Results:\n{output}"
            except subprocess.TimeoutExpired:
                logger.error("Test execution timed out")
                return f"Test script written to {output_path}\n\nERROR: Test execution timed out"
            except Exception as e:
                logger.error(f"Error during test execution: {e}")
                return f"Test script written to {output_path}\n\nERROR: {str(e)}"

        return write_test_script

    return create_write_test_plan, create_write_test_script


async def generate_test_for_api(
    test_case_description: str, target_url: str, instance_id: str = None
) -> dict:
    """Modified test generation that returns data for API response."""
    from agents import Agent, Runner, ModelSettings
    from agents.mcp import MCPServerStdio

    # Generate instance ID if not provided
    if not instance_id:
        instance_id = str(uuid.uuid4())[:8]

    # Create workspace
    workspace_dir = os.path.join(
        tempfile.gettempdir(), f"playwright_test_{instance_id}"
    )
    os.makedirs(workspace_dir, exist_ok=True)

    browser_data_dir = os.path.join(workspace_dir, "browser_data")
    os.makedirs(browser_data_dir, exist_ok=True)

    # Setup logger
    logger = setup_logger(instance_id, workspace_dir)
    logger.info(f"Starting test generation for instance {instance_id}")
    logger.info(f"Target URL: {target_url}")
    logger.info(f"Test case: {test_case_description}")

    # Create tool functions with data capture
    create_plan_fn, create_script_fn = create_test_data_capture(instance_id, logger)
    write_test_plan = create_plan_fn(workspace_dir)
    write_test_script = create_script_fn(workspace_dir)

    # Setup MCP server
    browser_automation_mcp_server = MCPServerStdio(
        name=f"Playwright MCP {instance_id}",
        params={
            "command": "npx",
            "args": [
                "@playwright/mcp@latest",
                "--isolated",
                "--user-data-dir",
                browser_data_dir,
                # "--headless",
            ],
        },
        client_session_timeout_seconds=15,
    )

    TARGET_URL_PROMPT = f"Target URL: {target_url}\n"

    async with browser_automation_mcp_server:
        # Create agent
        agent = Agent(
            name="E2ETestGenerator",
            instructions=TARGET_URL_PROMPT + SYSTEM_PROMPT,
            tools=[write_test_plan, write_test_script],
            model="gpt-5",
            mcp_servers=[browser_automation_mcp_server],
            model_settings=ModelSettings(tool_choice="required"),
        )

        # Run agent
        result = Runner.run_streamed(
            agent,
            max_turns=30,
            input=f"Generate an E2E test for the following test case: {test_case_description}",
        )

        # Consume stream
        async for event in result.stream_events():
            pass  # Just consume events, tools already capture data

    # Get captured data
    captured_data = test_data_store.get(instance_id, {})

    logger.info("Test generation completed")

    # Cleanup logger handlers
    for handler in logger.handlers[:]:
        handler.close()
        logger.removeHandler(handler)

    return {
        "instance_id": instance_id,
        "workspace_dir": workspace_dir,
        "test_plan": captured_data.get("test_plan"),
        "test_script": captured_data.get("test_script"),
    }


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
    # Validate API key
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=500, detail="OPENAI_API_KEY not configured on server"
        )

    # Generate instance ID for logging
    instance_id = request.instance_id or str(uuid.uuid4())[:8]
    workspace_dir = os.path.join(
        tempfile.gettempdir(), f"playwright_test_{instance_id}"
    )
    log_path = os.path.join(workspace_dir, "logs", "request.log")

    # Log request start to main console
    print(f"\n{'='*80}")
    print("New test generation request started")
    print(f"Instance ID: {instance_id}")
    print(f"Target URL: {request.target_url}")
    print(f"Test Case: {request.test_case_description}")
    print(f"Log Path: {log_path}")
    print(f"{'='*80}\n")

    try:
        # Generate test
        result = await generate_test_for_api(
            test_case_description=request.test_case_description,
            target_url=request.target_url,
            instance_id=instance_id,
        )

        # Build response
        test_script_path = os.path.join(
            result["workspace_dir"], "testjs", "tests", "test.spec.js"
        )

        response = TestGenerationResponse(
            # instance_id=result["instance_id"],
            # workspace_path=result["workspace_dir"],
            # test_script_path=test_script_path,
            test_plan=result.get("test_plan"),
            test_script=result.get("test_script"),
            status="success",
        )

        # Cleanup data store
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
    workspace_dir = os.path.join(
        tempfile.gettempdir(), f"playwright_test_{instance_id}"
    )

    if not os.path.exists(workspace_dir):
        raise HTTPException(
            status_code=404, detail=f"Workspace not found for instance {instance_id}"
        )

    try:
        if keep_tests:
            browser_data = os.path.join(workspace_dir, "browser_data")
            node_modules = os.path.join(workspace_dir, "testjs", "node_modules")

            if os.path.exists(browser_data):
                shutil.rmtree(browser_data)
            if os.path.exists(node_modules):
                shutil.rmtree(node_modules)
        else:
            shutil.rmtree(workspace_dir)

        return {
            "status": "success",
            "message": f"Workspace cleaned for instance {instance_id}",
            "kept_tests": keep_tests,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
    # run this as well
    # ngrok http --url=superelegant-lovetta-unfilmed.ngrok-free.dev 8000
