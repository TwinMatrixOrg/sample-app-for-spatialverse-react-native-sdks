#!/usr/bin/env bash
# Build APK with Gradle, then install/launch via Windows adb (WSL-safe).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

adb reverse tcp:8081 tcp:8081 >/dev/null || true

echo "Building debug APK..."
./android/gradlew -p android app:assembleDebug -PreactNativeDevServerPort=8081

APK=android/app/build/outputs/apk/debug/app-debug.apk
if [[ ! -f "$APK" ]]; then
  echo "APK not found at $APK" >&2
  exit 1
fi

echo "Installing $APK..."
adb install -r "$APK"
adb reverse tcp:8081 tcp:8081 >/dev/null || true
adb shell am start -n com.myproject/.MainActivity
echo "App launched. Metro should be reachable via adb reverse on :8081."
