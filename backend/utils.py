import os
import shutil
import subprocess
import tempfile
import logging
from collections.abc import AsyncIterator

from agents import ItemHelpers, StreamEvent


successful_step_definition = r"""
import * as fs from "fs";
import * as path from "path";

test.afterEach(async () => {
    const outputPath = path.join(process.cwd(), 'completed_steps.json');
    fs.writeFileSync(outputPath, JSON.stringify(completed_steps, null, 2));
});

"""


def add_step_logging_to_test_script(script: str) -> str:
    """
    Adds the successful_step function to the start of the test script
    """
    return successful_step_definition + script


async def print_result_stream(stream: AsyncIterator[StreamEvent], logger):
    """Log events from the result stream.
    Args:
        stream: An async iterator yielding StreamEvent objects.
    """
    import tiktoken

    enc = tiktoken.encoding_for_model("gpt-4.1")
    # Stream events as they happen
    async for event in stream:
        # Ignore raw response deltas to avoid token-by-token noise
        if event.type == "raw_response_event":
            continue
        # When the agent updates
        elif event.type == "agent_updated_stream_event":
            logger.info(f"[Agent] Updated: {event.new_agent.name}")
        # When items are generated
        elif event.type == "run_item_stream_event":
            if event.item.type == "tool_call_item":
                tool_name = getattr(
                    event.item.raw_item,
                    "name",
                    "unknown_tool",
                )
                # tool_args = getattr(
                #     event.item.raw_item,
                #     "arguments",
                #     {},
                # )
                logger.info(
                    f"[Tool Call] Executing: {tool_name}",
                    # ", Params: ",
                    # tool_args,
                )
            elif event.item.type == "tool_call_output_item":
                output = event.item.raw_item.get("output")
                logger.info(
                    f"[Tool Output] Received output from tool\tTokens: {len(enc.encode(output))}"
                )
                # logger.info(
                #     "Output: ",
                #     output[:300] + ("..." if len(output) > 300 else ""),
                #     "\n",
                # )
            elif event.item.type == "message_output_item":
                message = ItemHelpers.text_message_output(event.item)
                if message and len(message) > 100:
                    logger.info(f"[Message] {message[:100]}...")
                elif message:
                    logger.info(f"[Message] {message}")


# Workspace Management Functions


def create_workspace(instance_id: str) -> tuple[str, str]:
    """
    Create workspace directory structure for test generation.

    Args:
        instance_id: Unique identifier for this test instance

    Returns:
        Tuple of (workspace_dir, browser_data_dir)
    """
    workspace_dir = os.path.join(
        tempfile.gettempdir(), f"playwright_test_{instance_id}"
    )
    os.makedirs(workspace_dir, exist_ok=True)

    browser_data_dir = os.path.join(workspace_dir, "browser_data")
    os.makedirs(browser_data_dir, exist_ok=True)

    return workspace_dir, browser_data_dir


def setup_testjs_workspace(workspace_dir: str, logger: logging.Logger = None) -> str:
    """
    Set up testjs directory structure and copy configuration files.

    Args:
        workspace_dir: Path to the workspace directory
        logger: Optional logger for logging operations

    Returns:
        Path to the testjs directory
    """
    testjs_dir = os.path.join(workspace_dir, "testjs")
    tests_dir = os.path.join(testjs_dir, "tests")
    os.makedirs(tests_dir, exist_ok=True)

    # Copy config files from original testjs
    original_testjs = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "testjs"
    )

    for config_file in ["playwright.config.js", "package.json"]:
        workspace_config = os.path.join(testjs_dir, config_file)
        if not os.path.exists(workspace_config):
            original_config = os.path.join(original_testjs, config_file)
            if os.path.exists(original_config):
                shutil.copy2(original_config, workspace_config)
                if logger:
                    logger.info(f"Copied {config_file} to workspace")

    return testjs_dir


def install_test_dependencies(testjs_dir: str, logger: logging.Logger = None) -> bool:
    """
    Install npm dependencies in the testjs workspace.

    Args:
        testjs_dir: Path to the testjs directory
        logger: Optional logger for logging operations

    Returns:
        True if successful, False otherwise
    """
    node_modules = os.path.join(testjs_dir, "node_modules")
    if os.path.exists(node_modules):
        return True

    if logger:
        logger.info(f"Installing dependencies in {testjs_dir}...")

    try:
        subprocess.run(
            ["npm", "install"],
            cwd=testjs_dir,
            capture_output=True,
            text=True,
            timeout=120,
        )
        return True
    except Exception as e:
        if logger:
            logger.warning(f"Failed to install dependencies: {e}")
        return False


def run_tests(testjs_dir: str, logger: logging.Logger = None) -> tuple[bool, str]:
    """
    Run playwright tests in the testjs workspace.

    Args:
        testjs_dir: Path to the testjs directory
        logger: Optional logger for logging operations

    Returns:
        Tuple of (success: bool, output: str)
    """
    if logger:
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

        if logger:
            logger.info(f"Test execution completed. Output:\n{output}")

        return result.returncode == 0, output

    except subprocess.TimeoutExpired:
        error_msg = "Test execution timed out"
        if logger:
            logger.error(error_msg)
        return False, f"ERROR: {error_msg}"

    except Exception as e:
        error_msg = f"Error during test execution: {e}"
        if logger:
            logger.error(error_msg)
        return False, f"ERROR: {str(e)}"


def cleanup_workspace(instance_id: str, keep_tests: bool = False) -> bool:
    """
    Clean up workspace for a specific instance.

    Args:
        instance_id: The instance ID to clean up
        keep_tests: If True, only remove browser data and node_modules

    Returns:
        True if successful, False otherwise
    """
    workspace_dir = os.path.join(
        tempfile.gettempdir(), f"playwright_test_{instance_id}"
    )

    if not os.path.exists(workspace_dir):
        return False

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
        return True
    except Exception:
        return False
