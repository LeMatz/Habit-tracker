# Builds the signed Android release bundle (.aab) for Google Play.
# Usage:  powershell -ExecutionPolicy Bypass -File .\build-android.ps1
#         powershell -ExecutionPolicy Bypass -File .\build-android.ps1 -Apk   # debug APK instead
param([switch]$Apk)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# --- Toolchain (Android Studio's bundled JDK + local SDK) ---
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

Write-Host "==> Building web assets (vite)" -ForegroundColor Cyan
Set-Location $root
npm run build

Write-Host "==> Syncing Capacitor -> Android" -ForegroundColor Cyan
npx cap sync android

Set-Location (Join-Path $root "android")
if ($Apk) {
    Write-Host "==> Assembling debug APK" -ForegroundColor Cyan
    .\gradlew.bat assembleDebug --console=plain
    Write-Host "APK: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Green
} else {
    Write-Host "==> Bundling signed release AAB" -ForegroundColor Cyan
    .\gradlew.bat bundleRelease --console=plain
    Write-Host "AAB: android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Green
}
Set-Location $root
