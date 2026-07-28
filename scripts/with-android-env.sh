#!/usr/bin/env bash
# Env for building/running Android from WSL (portable JDK + Linux Android SDK).
set -euo pipefail

export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk-17}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"

WIN_PLATFORM_TOOLS="/mnt/c/Users/hamza/AppData/Local/Android/Sdk/platform-tools"
export PATH="$HOME/.local/bin:$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/cmake/3.22.1/bin:${PATH:-}"

write_adb_wrapper() {
  local target=$1
  cat > "$target" <<EOF
#!/usr/bin/env bash
WIN_ADB="$WIN_PLATFORM_TOOLS/adb.exe"
# AGP/ddmlib cannot parse Windows CRLF in \`adb devices\`
if [[ "\${1:-}" == "devices" ]]; then
  "\$WIN_ADB" "\$@" | tr -d '\\r'
  exit "\${PIPESTATUS[0]}"
fi
exec "\$WIN_ADB" "\$@"
EOF
  chmod +x "$target"
}

# Windows-hosted emulator: route adb through adb.exe (with CRLF fix for Gradle).
if [[ -x "$WIN_PLATFORM_TOOLS/adb.exe" ]]; then
  mkdir -p "$HOME/.local/bin"
  write_adb_wrapper "$HOME/.local/bin/adb"
  if [[ -d "$ANDROID_HOME/platform-tools" ]]; then
    if [[ -x "$ANDROID_HOME/platform-tools/adb" && ! -f "$ANDROID_HOME/platform-tools/adb.linux" ]]; then
      # Keep linux adb only if it is a real ELF binary (not our wrapper).
      if file "$ANDROID_HOME/platform-tools/adb" | grep -q 'ELF'; then
        mv "$ANDROID_HOME/platform-tools/adb" "$ANDROID_HOME/platform-tools/adb.linux"
      fi
    fi
    write_adb_wrapper "$ANDROID_HOME/platform-tools/adb"
  fi
fi
export PATH="$HOME/.local/bin:$PATH"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROP="$ROOT/android/local.properties"
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > "$PROP"

if [[ ! -x "$JAVA_HOME/bin/java" ]]; then
  echo "JAVA_HOME is invalid: $JAVA_HOME" >&2
  echo "Install JDK 17 or set JAVA_HOME to a valid path." >&2
  exit 1
fi

if [[ ! -d "$ANDROID_HOME" ]]; then
  echo "ANDROID_HOME is invalid: $ANDROID_HOME" >&2
  echo "Install Linux SDK packages under ~/Android/Sdk." >&2
  exit 1
fi

exec "$@"
