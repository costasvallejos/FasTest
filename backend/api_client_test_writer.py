"""
Test Generation Logic for E2E Tests

Core test generation functionality using Playwright MCP.
Each request generates tests in an isolated workspace.
"""

import os
import uuid
import logging
import sys
from prompts.system_prompt_string import SYSTEM_PROMPT
from utils import (
    add_step_logging_to_test_script,
    print_result_stream,
    setup_testjs_workspace,
    install_test_dependencies,
    run_tests,
    create_workspace,
)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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

            # Setup workspace and write script
            testjs_dir = setup_testjs_workspace(workspace_dir, logger)
            output_path = os.path.join(testjs_dir, "tests", "test.spec.js")

            with open(output_path, "w") as f:
                f.write(script)

            logger.info(f"Test script written to: {output_path}")

            # Install dependencies
            install_test_dependencies(testjs_dir, logger)

            # Run tests
            success, output = run_tests(testjs_dir, logger)

            if success:
                return f"Test Execution Results:\n{output}"
            else:
                return f"Test script written to {output_path}\n\n{output}"

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
    workspace_dir, browser_data_dir = create_workspace(instance_id)

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

        await print_result_stream(result.stream_events(), logger)

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
