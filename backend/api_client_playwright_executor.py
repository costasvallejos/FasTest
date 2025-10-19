import os
import logging

from utils import (
    create_workspace,
    setup_testjs_workspace,
    install_test_dependencies,
    run_tests,
)


def execute_playwright_test(test_id: str) -> dict:
    """
    Execute a Playwright test from the database.

    Args:
        test_id: UUID of the test to execute

    Returns:
        dict with success status, output, and other test execution details
    """
    from supabase_client import get_supabase_client

    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)

    try:
        supabase = get_supabase_client()

        # Fetch test data from Supabase
        result = (
            supabase.table("tests")
            .select("test_script, plan")
            .eq("id", test_id)
            .single()
            .execute()
        )

        if not result.data:
            raise ValueError(f"Test with id {test_id} not found")

        test_script = result.data.get("test_script")
        test_plan = result.data.get("plan")

        if not test_script:
            raise ValueError(f"Test script is empty for test id {test_id}")

        # Create workspace
        workspace_dir, _ = create_workspace(test_id)
        logger.info(f"Created workspace at {workspace_dir}")

        # Setup testjs directory
        testjs_dir = setup_testjs_workspace(workspace_dir, logger)

        # Write test script to file
        test_file_path = os.path.join(testjs_dir, "tests", "test.spec.js")
        with open(test_file_path, "w") as f:
            f.write(test_script)
        logger.info(f"Written test script to {test_file_path}")

        # Install dependencies
        deps_installed = install_test_dependencies(testjs_dir, logger)
        if not deps_installed:
            raise RuntimeError("Failed to install dependencies")

        # Run tests
        success, output = run_tests(testjs_dir, logger)

        return {
            "success": success,
            "output": output,
            "test_id": test_id,
            "test_plan": test_plan,
            "workspace_dir": workspace_dir,
        }

    except Exception as e:
        logger.error(f"Error executing test {test_id}: {str(e)}")
        raise
