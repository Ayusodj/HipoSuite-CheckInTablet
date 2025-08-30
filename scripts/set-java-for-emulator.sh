#!/usr/bin/env bash
# Small helper to set JAVA_HOME to a JDK 17 installation for local emulator use.
# Usage: source scripts/set-java-for-emulator.sh
# Example: source scripts/set-java-for-emulator.sh /Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home

if [ "$#" -lt 1 ]; then
  # Try to auto-detect on macOS using /usr/libexec/java_home
  if command -v /usr/libexec/java_home >/dev/null 2>&1; then
    DETECTED=$(/usr/libexec/java_home -v 17 2>/dev/null || true)
    if [ -n "$DETECTED" ] && [ -d "$DETECTED" ]; then
      JDK17_PATH="$DETECTED"
      echo "Detected JDK17 at $JDK17_PATH"
    else
      echo "No JDK17 detected. Usage: source scripts/set-java-for-emulator.sh /path/to/jdk17"
      return 1 2>/dev/null || exit 1
    fi
  else
    echo "No argument provided and /usr/libexec/java_home not available. Usage: source scripts/set-java-for-emulator.sh /path/to/jdk17"
    return 1 2>/dev/null || exit 1
  fi
else
  JDK17_PATH="$1"
  if [ ! -d "$JDK17_PATH" ]; then
    echo "Provided path does not exist: $JDK17_PATH"
    return 1 2>/dev/null || exit 1
  fi
fi

export JAVA_HOME="$JDK17_PATH"
export PATH="$JAVA_HOME/bin:$PATH"

echo "JAVA_HOME set to $JAVA_HOME"
java -version
