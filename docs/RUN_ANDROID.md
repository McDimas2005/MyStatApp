# Run MyStatApp on Android Studio Emulator

## Quick start (2–5 minutes)
- [ ] Step 1: From repo root, install dependencies with `npm ci` (this repo uses `package-lock.json`).
- [ ] Step 2: Start an Android emulator in Android Studio Device Manager (recommended: Pixel + API 36 image).
- [ ] Step 3: In terminal 1 (repo root), run `npm start`.
- [ ] Step 4: In terminal 2 (repo root), run `npm run android`.
- [ ] Step 5: Wait for `BUILD SUCCESSFUL` and app launch on the emulator.

## Project type detection (Expo vs RN CLI)
This repository is **React Native CLI** (not Expo managed, not Expo dev-build).

How this was detected:
- `package.json` scripts use React Native CLI commands:
  - `"start": "react-native start"`
  - `"android": "react-native run-android"`
- `package.json` dependencies include `react-native@0.82.1` and do **not** include `expo`, `expo-router`, or `eas-cli`.
- Native folders exist: `android/` and `ios/`.
- No `eas.json`, `app.config.js`, or `app.config.ts` exists.

README note:
- `README.md` includes Yarn alternatives, but this repo has `package-lock.json` and no `yarn.lock`; canonical commands in this guide use **npm**.

## Prerequisites (Windows + Android Studio)
### Install & configure
- Android Studio (latest stable) with these SDK components:
  - Android SDK Platform **36** (from `android/build.gradle` `compileSdkVersion = 36`)
  - Android SDK Build-Tools **36.0.0** (from `buildToolsVersion = "36.0.0"`)
  - Android SDK Platform-Tools
  - Android Emulator
  - Android SDK Command-line Tools (latest)
  - NDK (Side by side) **27.1.12297006** (from `ndkVersion = "27.1.12297006"`)
- Add ADB/emulator tools to PATH (PowerShell example):

```powershell
setx ANDROID_SDK_ROOT "$env:LOCALAPPDATA\Android\Sdk"
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
setx PATH "$($env:PATH);$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\emulator"
```

- JDK: use **Java 17** (React Native Gradle plugin in this repo targets Java toolchain 17).
- Node.js: use **Node >= 20** (`package.json` engines).
- Package manager: **npm** (`package-lock.json` present).
- Run all commands from **repo root**: `MyStatApp/` unless explicitly noted.

`android/local.properties`:
- If missing, create it with your SDK path.
- Windows (PowerShell/Gradle on Windows):

```text
sdk.dir=C\:\\Users\\<YOUR_USER>\\AppData\\Local\\Android\\Sdk
```

- WSL2 (Gradle in WSL):

```text
sdk.dir=/mnt/c/Users/<YOUR_USER>/AppData/Local/Android/Sdk
```

## Emulator setup (AVD)
- Open Android Studio -> **More Actions** -> **Virtual Device Manager**.
- Click **Create device**.
- Recommended profile: `Pixel 7` (or similar phone profile).
- System image:
  - Preferred: **API 36** x86_64 / Google APIs.
  - If API 36 image is unavailable, API 35/34 also works (app `minSdkVersion` is 24).
- Finish creation, then click **Play** to boot the emulator.
- Verify emulator is visible:

```powershell
adb devices
```

You should see an entry like `emulator-5554    device`.

## Run / develop on Android emulator
### Path A — Expo Go (if supported)
Not supported in this repository.
- No `expo` dependency.
- No `expo start` script.

### Path B — Expo development build (if supported)
Not supported in this repository.
- No Expo dev-build tooling (`expo run:android`) and no `eas.json`.

### Path C — React Native CLI (if supported)
Supported. Use these flows from repo root.

First-time setup:

```powershell
npm ci
```

Daily development run:

```powershell
# Terminal 1
npm start

# Terminal 2
npm run android
```

Run on a specific emulator/device:

```powershell
adb devices
npx react-native run-android --list-devices
npx react-native run-android --device "<DEVICE_NAME>"
```

Alternative targeting by serial:

```powershell
$env:ANDROID_SERIAL="emulator-5554"
npm run android
```

If Metro connection issues occur, run:

```powershell
adb -s emulator-5554 reverse tcp:8081 tcp:8081
```

## Verify it’s working
- Metro terminal (`npm start`) should show bundler startup logs and stay running on port `8081`.
- Android run terminal (`npm run android`) should show a successful Gradle build (`BUILD SUCCESSFUL`) and app launch.
- Emulator should open `MyStatApp` without a red error screen.
- Optional Metro health check:

```powershell
curl http://127.0.0.1:8081/status
```

Expected response: `packager-status:running`.

## Useful adb commands
- List devices:

```powershell
adb devices
```

- Target one device:

```powershell
adb -s emulator-5554 shell getprop ro.product.model
```

- Reverse Metro port (React Native CLI):

```powershell
adb -s emulator-5554 reverse tcp:8081 tcp:8081
```

- Show app logs:

```powershell
adb logcat
```

- Filter to React Native-related logs:

```powershell
adb logcat *:S ReactNative:V ReactNativeJS:V
```

## Troubleshooting
- `adb not found`

```powershell
$env:ANDROID_SDK_ROOT="$env:LOCALAPPDATA\Android\Sdk"
$env:Path += ";$env:ANDROID_SDK_ROOT\platform-tools;$env:ANDROID_SDK_ROOT\emulator"
adb version
```

- Emulator not detected

```powershell
adb kill-server
adb start-server
adb devices
```

Then ensure the AVD is actually booted in Android Studio Device Manager.

- Metro not reachable / red screen

```powershell
adb -s emulator-5554 reverse tcp:8081 tcp:8081
npm start -- --reset-cache
```

In another terminal, re-run:

```powershell
npm run android
```

- Gradle/JDK mismatch

```powershell
java -version
cd android
.\gradlew.bat -version
cd ..
```

If Java is not 17, set `JAVA_HOME` to a JDK 17 installation and retry.

- `SDK location not found`

```powershell
"sdk.dir=C\:\\Users\\<YOUR_USER>\\AppData\\Local\\Android\\Sdk" | Out-File -Encoding ASCII android\local.properties
```

For WSL:

```bash
printf "sdk.dir=/mnt/c/Users/<YOUR_USER>/AppData/Local/Android/Sdk\n" > android/local.properties
```

- `Failed to install the app`

```powershell
adb uninstall com.dimascorp.mystat
cd android
.\gradlew.bat clean
cd ..
npm run android
```

- Port already in use (8081)

```powershell
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

Or start Metro on another port and use the same port for install/run:

```powershell
npm start -- --port 8088
npx react-native run-android --port 8088
```

- WSL-only warning: `Failed to run environment setup script "setup_env.sh" ... EPERM`

```bash
chmod +x node_modules/@react-native-community/cli/setup_env.sh
```

If it persists, run commands from PowerShell (recommended for Android builds on Windows).

## Notes about Windows vs WSL2
- Preferred for this repo: **PowerShell on Windows** for `npm start` and `npm run android`.
- Use WSL2 only if needed; when using WSL2:
  - Point `android/local.properties` to `/mnt/c/Users/<YOUR_USER>/AppData/Local/Android/Sdk`.
  - Ensure `adb` from the Windows SDK is reachable in WSL `PATH`.
  - If you see script permission issues (`setup_env.sh EPERM`), use `chmod +x ...` or run from PowerShell.

## Appendix: Commands reference
```powershell
# From repo root
npm ci

# Start emulator first (Android Studio Device Manager), then:
npm start
npm run android

# Device targeting
adb devices
npx react-native run-android --list-devices
npx react-native run-android --device "<DEVICE_NAME>"

# Metro/network fixes
adb -s emulator-5554 reverse tcp:8081 tcp:8081
npm start -- --reset-cache

# Clean rebuild
cd android
.\gradlew.bat clean
cd ..
npm run android
```
