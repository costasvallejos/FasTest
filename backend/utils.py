successful_step_definition = r"""

completed_steps = []


function successful_step(description) {
    # Logs the successful completion of a test step.
    completed_steps.push(description)
}

"""


def add_step_logging_to_test_script(script: str) -> str:
    """
    Adds the successful_step function to the start of the test script
    """
    return successful_step_definition + script
