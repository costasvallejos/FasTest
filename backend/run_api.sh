#!/bin/bash

# Run the Python API with uv
uv run api_client_test_writer.py &
API_PID=$!

# Run ngrok
ngrok http --url=superelegant-lovetta-unfilmed.ngrok-free.dev 8000 &
NGROK_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down..."
    kill $API_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit
}

# Set up trap to cleanup on Ctrl+C
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
