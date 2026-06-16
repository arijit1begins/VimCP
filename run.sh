#!/bin/bash

# Change directory to the directory of this script to serve the correct files
cd "$(dirname "$0")" || exit 1

PORT=8080
echo -e "\033[1;32mStarting Vim Cookbook Server on port $PORT...\033[0m"
echo -e "\033[1;36mOpen http://localhost:$PORT in your web browser\033[0m"
echo -e "Press Ctrl+C to stop."

python3 -m http.server $PORT
