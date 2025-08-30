#!/usr/bin/env bash
# Small helper to set JAVA_HOME to a JDK 17 installation for local emulator use.
# Usage: source scripts/set-java-for-emulator.sh
# Example: source scripts/set-java-for-emulator.sh /Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home

if [ "$#" -lt 1 ]; then
  echo "Usage: source scripts/set-java-for-emulator.sh <path-to-jdk17>"
  echo "This script must be sourced to affect the current shell: source scripts/set-java-for-emulator.sh /path/to/jdk17"
  return 1 2>/dev/null || exit 1
fi

JDK17_PATH="$1"
if [ ! -d "$JDK17_PATH" ]; then
  echo "Provided path does not exist: $JDK17_PATH"
  return 1 2>/dev/null || exit 1
fi

export JAVA_HOME="$JDK17_PATH"
export PATH="$JAVA_HOME/bin:$PATH"

echo "JAVA_HOME set to $JAVA_HOME"
java -version
