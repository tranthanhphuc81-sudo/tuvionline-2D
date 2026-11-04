#!/usr/bin/env bash
# Cài Android SDK (command-line tools, platform 36, build-tools 36) để build APK/AAB ngay trong Codespace.
# Chạy tự động khi tạo Codespace; chạy lại an toàn (bỏ qua phần đã cài).
set -euo pipefail
SDK="${ANDROID_HOME:-/opt/android-sdk}"
REPO="https://dl.google.com/android/repository"

if ! command -v unzip >/dev/null 2>&1; then
  sudo apt-get update -y && sudo apt-get install -y unzip
fi

if [ ! -x "$SDK/cmdline-tools/latest/bin/sdkmanager" ]; then
  echo "→ Tải Android command-line tools..."
  sudo mkdir -p "$SDK" && sudo chown -R "$(id -u):$(id -g)" "$SDK"
  FILE="$(curl -fsSL "$REPO/repository2-3.xml" | grep -o 'commandlinetools-linux-[0-9]*_latest.zip' | sort -t- -k3 -n | tail -1 || true)"
  FILE="${FILE:-commandlinetools-linux-13114758_latest.zip}"
  curl -fsSL "$REPO/$FILE" -o /tmp/cmdline-tools.zip
  rm -rf /tmp/cmdline-tools && unzip -q /tmp/cmdline-tools.zip -d /tmp/cmdline-tools
  mkdir -p "$SDK/cmdline-tools" && rm -rf "$SDK/cmdline-tools/latest"
  mv /tmp/cmdline-tools/cmdline-tools "$SDK/cmdline-tools/latest"
fi

export PATH="$PATH:$SDK/cmdline-tools/latest/bin:$SDK/platform-tools"
echo "→ Chấp nhận giấy phép và cài platform/build-tools (khớp android/variables.gradle: compileSdk 36)..."
yes | sdkmanager --licenses >/dev/null || true
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
echo "sdk.dir=$SDK" > "$(dirname "$0")/../android/local.properties"
echo "✓ Android SDK sẵn sàng tại $SDK"
