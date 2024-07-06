#!/bin/bash

# Ensure that GIT_REPOSITORY_URL is provided

# export GIT_REPOSITORY_URL="$GIT_REPOSITORY__URL"

if [ -z "$GIT_REPOSITORY_URL" ]; then
  echo "Error: GIT_REPOSITORY_URL is not set."
  exit 1
fi

# Clone the git repository
git clone "$GIT_REPOSITORY_URL" "/home/app/output"

# Execute the node script
exec node script.js
