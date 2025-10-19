from collections.abc import AsyncIterator

from agents import ItemHelpers, StreamEvent


successful_step_definition = r"""

let completed_steps = []


function successful_step(description) {
    // Logs the successful completion of a test step.
    completed_steps.push(description)
}

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
                    "[Tool Output] Received output from tool\t",
                    "Tokens: ",
                    len(enc.encode(output)),
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
