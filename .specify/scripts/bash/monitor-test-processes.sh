#!/bin/bash
# monitor-test-processes.sh - Monitor and kill runaway test processes
#
# Usage:
#   ./monitor-test-processes.sh [--threshold PERCENT] [--kill]
#
# Options:
#   --threshold PERCENT  Memory usage threshold (default: 50.0)
#   --kill               Kill processes exceeding threshold (default: report only)

set -euo pipefail

THRESHOLD=${THRESHOLD:-50.0}
KILL_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --threshold)
      THRESHOLD="$2"
      shift 2
      ;;
    --kill)
      KILL_MODE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "=== Test Process Monitor ==="
echo "Threshold: ${THRESHOLD}% memory"
echo "Kill mode: ${KILL_MODE}"
echo ""

# Find vitest processes
VITEST_PROCS=$(ps aux | grep -E "node.*vitest" | grep -v grep || true)

if [ -z "$VITEST_PROCS" ]; then
  echo "✓ No vitest processes running"
  exit 0
fi

echo "Found vitest processes:"
echo "$VITEST_PROCS" | awk '{printf "  PID: %-6s  MEM: %5s%%  CMD: %s\n", $2, $4, $11}'
echo ""

# Check memory usage
HIGH_MEM_PROCS=$(echo "$VITEST_PROCS" | awk -v threshold="$THRESHOLD" '$4 > threshold {print $2}')

if [ -z "$HIGH_MEM_PROCS" ]; then
  echo "✓ All processes within threshold"
  exit 0
fi

echo "⚠️  High memory usage detected:"
echo "$HIGH_MEM_PROCS" | while read -r pid; do
  MEM=$(ps -p "$pid" -o %mem= 2>/dev/null || echo "N/A")
  echo "  PID $pid using ${MEM}% memory"
done

if [ "$KILL_MODE" = true ]; then
  echo ""
  echo "Killing high-memory processes..."
  echo "$HIGH_MEM_PROCS" | while read -r pid; do
    kill -9 "$pid" 2>/dev/null || echo "  Failed to kill PID $pid"
    echo "  ✓ Killed PID $pid"
  done
else
  echo ""
  echo "Run with --kill to terminate these processes"
fi
