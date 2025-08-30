#!/usr/bin/env bash
# Instala el APK adjunto en `public/app-debug-apk.zip` en un emulador local.
# - detecta y descomprime ZIP si es necesario
# - arranca un AVD si se pasa -a <AVD_NAME>
# - instala el APK en el emulador y lanza la app
# - lanza logcat (Ctrl-C para salir)

set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
TMP_DIR="/tmp/hiposuite_apk"
DEFAULT_ZIP="public/app-debug-apk.zip"
AVD_NAME=""
ARTIFACT=""
SKIP_SHA=0
EXPECTED_SHA=""

usage(){
  cat <<EOF
Usage: source scripts/install-on-emulator.sh [options]

Options:
  -s <path>    ZIP or APK path to install (default: ${DEFAULT_ZIP})
  -a <AVD>     AVD name to auto-start if no device is connected
  --sha <sha>  Optional expected sha256 for the ZIP file (verifica antes de instalar)
  --skip-sha   Skip SHA verification
  -h           Show this help

Examples:
  source scripts/install-on-emulator.sh -s public/app-debug-apk.zip
  source scripts/install-on-emulator.sh -s /tmp/x.apk
  source scripts/install-on-emulator.sh -a Pixel_3_API_30
EOF
}

# parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    -s) ARTIFACT="$2"; shift 2;;
    -a) AVD_NAME="$2"; shift 2;;
    --sha) EXPECTED_SHA="$2"; shift 2;;
    --skip-sha) SKIP_SHA=1; shift;;
    -h) usage; return 0 2>/dev/null || exit 0;;
    *) echo "Unknown arg: $1"; usage; return 1 2>/dev/null || exit 1;;
  esac
done

ARTIFACT=${ARTIFACT:-$DEFAULT_ZIP}

# helpers
info(){ echo "[info] $*"; }
err(){ echo "[error] $*" >&2; }

# environment checks
ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}
if [ ! -d "$ANDROID_SDK_ROOT" ]; then
  err "ANDROID_SDK_ROOT not found at $ANDROID_SDK_ROOT. Export ANDROID_SDK_ROOT or install Android SDK."
  return 1 2>/dev/null || exit 1
fi
export PATH="$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$PATH"

command -v adb >/dev/null 2>&1 || { err "adb not found in PATH. Install platform-tools."; return 1 2>/dev/null || exit 1; }
command -v unzip >/dev/null 2>&1 || { err "unzip not found."; return 1 2>/dev/null || exit 1; }

mkdir -p "$TMP_DIR"
rm -rf "$TMP_DIR"/*

# verify artifact exists
if [ ! -f "$ARTIFACT" ]; then
  err "Artifact not found: $ARTIFACT"
  return 1 2>/dev/null || exit 1
fi

# optional sha check
if [ "$SKIP_SHA" -eq 0 ]; then
  if [ -n "$EXPECTED_SHA" ]; then
    info "Verifying SHA256 for $ARTIFACT"
    ACTUAL_SHA=$(shasum -a 256 "$ARTIFACT" | awk '{print $1}')
    if [ "$ACTUAL_SHA" != "$EXPECTED_SHA" ]; then
      err "SHA mismatch: expected $EXPECTED_SHA but got $ACTUAL_SHA"
      return 1 2>/dev/null || exit 1
    else
      info "SHA matched"
    fi
  else
    info "No expected SHA provided; skipping SHA check (use --sha to enforce)."
  fi
else
  info "--skip-sha: skipping SHA verification"
fi

# unpack if zip
LOWER=$(echo "$ARTIFACT" | awk '{print tolower($0)}')
if [[ "$LOWER" == *.zip ]]; then
  info "Unzipping $ARTIFACT to $TMP_DIR"
  unzip -o "$ARTIFACT" -d "$TMP_DIR" >/dev/null
  # find apk inside
  APK_PATH=$(find "$TMP_DIR" -type f -iname "*.apk" | head -n1 || true)
  if [ -z "$APK_PATH" ]; then
    err "No .apk found inside $ARTIFACT"
    return 1 2>/dev/null || exit 1
  fi
else
  # assume direct apk
  APK_PATH="$ARTIFACT"
fi

info "Using APK: $APK_PATH"

# function to pick device id
pick_device(){
  # returns device id or empty
  DEVICES_RAW=$(adb devices | sed -n '2,$p' | awk '{print $1" " $2}' | sed '/^\s*$/d')
  # filter devices with 'device' state
  DEVICE_ID=$(echo "$DEVICES_RAW" | awk '$2=="device"{print $1; exit}') || true
  echo "$DEVICE_ID"
}

DEVICE_ID="$(pick_device)"
if [ -z "$DEVICE_ID" ]; then
  info "No device/emulator detected via adb."
  # if no AVD specified, try to pick the first available one
  if [ -z "$AVD_NAME" ]; then
    AVD_NAME=$("$ANDROID_SDK_ROOT/emulator/emulator" -list-avds 2>/dev/null | head -n1 || true)
    if [ -n "$AVD_NAME" ]; then
      info "Auto-selected AVD: $AVD_NAME"
    fi
  fi

  if [ -n "$AVD_NAME" ]; then
    info "Attempting to start AVD: $AVD_NAME"
    # start emulator in background
    nohup "$ANDROID_SDK_ROOT/emulator/emulator" -avd "$AVD_NAME" -netdelay none -netspeed full >/tmp/hipo_emulator.log 2>&1 &
    EMU_PID=$!
    info "Emulator started (PID $EMU_PID). Waiting for device to boot... (see /tmp/hipo_emulator.log)"
  else
    err "No device and no AVD available. Start an emulator in AVD Manager or pass -a <AVD_NAME>."
    return 1 2>/dev/null || exit 1
  fi
else
  info "Found connected device: $DEVICE_ID"
fi

# wait for device to be ready
adb wait-for-device
info "Waiting for device..."
# wait until boot complete (max ~180s)
for i in $(seq 1 180); do
  BOOT=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)
  if [ "$BOOT" = "1" ]; then
    info "Device booted"
    break
  fi
  if [ $((i % 10)) -eq 0 ]; then
    info "Still waiting for boot... ($i s)"
  fi
  sleep 1
done

# re-check device id
DEVICE_ID="$(pick_device)"
if [ -z "$DEVICE_ID" ]; then
  err "No device available after waiting"
  return 1 2>/dev/null || exit 1
fi
info "Installing APK on device $DEVICE_ID"

# list packages before
PACKAGES_BEFORE=$(adb -s "$DEVICE_ID" shell pm list packages -3 | sed 's/package://g' | sort)

# install APK
adb -s "$DEVICE_ID" install -r "$APK_PATH"

# list packages after and diff to find newly installed package(s)
PACKAGES_AFTER=$(adb -s "$DEVICE_ID" shell pm list packages -3 | sed 's/package://g' | sort)
NEW_PACKAGE=$(comm -13 <(echo "$PACKAGES_BEFORE") <(echo "$PACKAGES_AFTER") | head -n1 || true)

if [ -z "$NEW_PACKAGE" ]; then
  info "No new user package detected. Trying to infer package from APK via aapt (if available)."
  AAPT_BIN=$(find "$ANDROID_SDK_ROOT" -type f -path "*/build-tools/*/aapt" -print -quit || true)
  if [ -n "$AAPT_BIN" ]; then
    NEW_PACKAGE=$($AAPT_BIN dump badging "$APK_PATH" 2>/dev/null | awk -F"'" '/package: name=/{print $2; exit}') || true
  fi
fi

if [ -z "$NEW_PACKAGE" ]; then
  err "Could not determine package name automatically. Start the app manually from the emulator launcher."
  info "APK installed: $APK_PATH"
  info "Exiting; you can run 'adb logcat' to see logs."
  return 0 2>/dev/null || exit 0
fi

info "Detected package: $NEW_PACKAGE"
info "Starting app"
adb -s "$DEVICE_ID" shell monkey -p "$NEW_PACKAGE" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true

info "Tailing logcat (Ctrl-C to stop)."
adb -s "$DEVICE_ID" logcat

# End
