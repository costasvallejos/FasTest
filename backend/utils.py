def add_step_logging_to_test_script(script: str) -> str:
    """
    Adds the successful_step function to the start of the test script
    """
    successful_step_definition = (
        "function successful_step(description) {\n"
        "    console.log(`STEP COMPLETED: ${description}`);\n"
        "}\n\n"
    )
    return successful_step_definition + script
