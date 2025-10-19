import os
import logging

from utils import (
    create_workspace,
    setup_testjs_workspace,
    install_test_dependencies,
    run_tests,
)


def setup_execution_logger(test_id: str, workspace_dir: str) -> logging.Logger:
    """Create a logger for test execution."""
    log_dir = os.path.join(workspace_dir, "logs")
    os.makedirs(log_dir, exist_ok=True)

    logger = logging.getLogger(f"test_exec_{test_id}")
    logger.setLevel(logging.INFO)
    logger.propagate = False

    # Remove existing handlers
    logger.handlers.clear()

    # File handler
    file_handler = logging.FileHandler(os.path.join(log_dir, "execution.log"))
    file_handler.setLevel(logging.INFO)

    # Format
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)

    return logger


def execute_playwright_test(test_id: str) -> dict:
    """
    Execute a Playwright test from the database.

    Args:
        test_id: UUID of the test to execute

    Returns:
        dict with success status, output, and other test execution details
    """
    from supabase_client import get_supabase_client

    # Create workspace first so we can set up logging
    workspace_dir, _ = create_workspace(test_id)
    logger = setup_execution_logger(test_id, workspace_dir)

    logger.info(f"Starting test execution for test ID: {test_id}")
    logger.info(f"Workspace directory: {workspace_dir}")

    try:
        supabase = get_supabase_client()
        logger.info("Connected to Supabase")

        # Fetch test data from Supabase
        logger.info(f"Fetching test data for ID: {test_id}")
        result = (
            supabase.table("tests")
            .select("test_script, plan")
            .eq("id", test_id)
            .single()
            .execute()
        )

        if not result.data:
            logger.error(f"Test with id {test_id} not found in database")
            raise ValueError(f"Test with id {test_id} not found")

        test_script = result.data.get("test_script")
        test_plan = result.data.get("plan")
        logger.info(f"Successfully fetched test data. Plan has {len(test_plan) if test_plan else 0} steps")

        if not test_script:
            logger.error(f"Test script is empty for test id {test_id}")
            raise ValueError(f"Test script is empty for test id {test_id}")

        # Setup testjs directory
        logger.info("Setting up testjs workspace")
        testjs_dir = setup_testjs_workspace(workspace_dir, logger)

        # Write test script to file
        test_file_path = os.path.join(testjs_dir, "tests", "test.spec.js")
        logger.info(f"Writing test script to {test_file_path}")
        with open(test_file_path, "w") as f:
            f.write(test_script)
        logger.info(f"Test script written successfully")

        # Install dependencies
        logger.info("Installing test dependencies")
        deps_installed = install_test_dependencies(testjs_dir, logger)
        if not deps_installed:
            logger.error("Failed to install dependencies")
            raise RuntimeError("Failed to install dependencies")
        logger.info("Dependencies installed successfully")

        # Run tests
        logger.info("Running Playwright tests")
        success, output = run_tests(testjs_dir, logger)
        logger.info(f"Test execution completed. Success: {success}")
        logger.info(f"Test output:\n{output}")

        # Cleanup logger handlers
        for handler in logger.handlers[:]:
            handler.close()
            logger.removeHandler(handler)

        log_path = os.path.join(workspace_dir, "logs", "execution.log")

        return {
            "success": success,
            "output": output,
            "test_id": test_id,
            "test_plan": test_plan,
            "workspace_dir": workspace_dir,
            "log_path": log_path,
        }

    except Exception as e:
        logger.error(f"Error executing test {test_id}: {str(e)}", exc_info=True)

        # Cleanup logger handlers
        for handler in logger.handlers[:]:
            handler.close()
            logger.removeHandler(handler)

        raise
