#!/usr/bin/env bash
# Autosecure Dashboard Startup Script
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PORT="${PORT:-3000}"
export PORT

echo "Starting Autosecure Dashboard on port $PORT..."
node server/index.js
