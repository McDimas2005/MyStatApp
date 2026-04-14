#!/bin/bash

echo "🚀 Starting MyStatApp Dev Environment..."

PROJECT_DIR="/home/mcdimas/projects/mystat-app/MyStatApp"
JAVA_PATH="/usr/lib/jvm/java-17-openjdk-amd64"

cd "$PROJECT_DIR" || exit

echo "☕ Setting Java 17..."
export JAVA_HOME=$JAVA_PATH
export PATH=$JAVA_HOME/bin:$PATH

echo "🔍 Checking device..."
adb kill-server
adb start-server
adb devices

echo "🔌 Setting up port reverse..."
adb reverse --remove-all
adb reverse tcp:8081 tcp:8081

echo "🧹 Killing old Metro (if any)..."
lsof -ti:8081 | xargs -r kill -9

echo "📦 Starting Metro bundler..."
npx react-native start --host 0.0.0.0 --port 8081 --reset-cache &

sleep 3

echo "📱 Restarting app on device..."
adb shell am force-stop com.dimascorp.mystat
adb shell monkey -p com.dimascorp.mystat -c android.intent.category.LAUNCHER 1

echo "✅ MyStatApp should now be running!"
echo "👉 If not, open the app manually on your phone."
