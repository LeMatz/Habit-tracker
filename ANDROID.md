# Android / Google Play

This app is a React + Vite web app wrapped in a native Android shell with
[Capacitor](https://capacitorjs.com). The web code is unchanged; Capacitor loads
the built `dist/` inside a native WebView and bridges native APIs
(local notifications, status bar, app lifecycle).

## Prerequisites (already set up on this machine)

- **JDK**: bundled with Android Studio at `C:\Program Files\Android\Android Studio\jbr`
- **Android SDK**: `%LOCALAPPDATA%\Android\Sdk`
- No global `JAVA_HOME`/`ANDROID_HOME` needed — the build script sets them.

## Building

```powershell
npm run android:aab   # signed release bundle for Play Store  -> app-release.aab
npm run android:apk   # debug APK for sideloading / testing   -> app-debug.apk
npm run android:open  # open the project in Android Studio
```

Output locations:
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`

After changing web code you can also just run `npm run cap:sync` then rebuild.

## Signing (IMPORTANT — keep these safe)

- Upload keystore: `android/upload-keystore.jks`
- Credentials: `android/keystore.properties`
- **Both are gitignored and NOT in version control.** Back them up somewhere safe
  (password manager + encrypted backup). If you lose the keystore you cannot push
  updates under the same upload key without contacting Google to reset it.
- Key alias: `upload`.

## App identity

| Field         | Value                 | Where                          |
|---------------|-----------------------|--------------------------------|
| Package name  | `com.sistemashce.app` | `android/app/build.gradle`     |
| App name      | `Sistema SHCE`        | `android/app/src/main/res/values/strings.xml` |
| versionCode   | `1`                   | `android/app/build.gradle`     |
| versionName   | `1.0`                 | `android/app/build.gradle`     |

**Bump `versionCode` (integer, +1) for every Play upload.** `versionName` is the
human-facing version. The package name is permanent once published.

## App icon / splash

Generated from `resources/icon.png` and `resources/splash.png` (built by
`resources/gen-icons.mjs`). To rebrand: replace those PNGs (icon 1024×1024,
splash 2732×2732) and run:

```
node resources/gen-icons.mjs        # only if regenerating from the SVG script
npx @capacitor/assets generate --android
```

## Notifications

Daily reminders use `@capacitor/local-notifications` on native (scheduled at the
OS level — fires even when the app is closed, survives reboot). On web the old
30-second polling fallback still runs. See `utils/notificationService.ts` and the
reminder effect in `context/HabitContext.tsx`.

## Publishing to Google Play (checklist)

1. **Play Console** → Create app → fill name, default language, app/game, free/paid.
2. **Upload the AAB**: Release → Production (or Internal testing first) → create
   release → upload `app-release.aab`.
3. **Play App Signing**: accept it (default). Google manages the final signing key;
   your `upload-keystore.jks` only signs uploads.
4. **Store listing**: short + full description, app icon (512×512), feature graphic
   (1024×500), min. 2 phone screenshots.
5. **Content**: privacy policy URL (required), data safety form, content rating
   questionnaire, target audience, ads declaration.
6. **Review**: submit. First review typically 1–7 days.

## Styling / offline

Tailwind is compiled locally via PostCSS (`tailwind.config.js`, `postcss.config.js`,
`index.css`) and Montserrat is self-hosted via `@fontsource/montserrat` — **no CDN
dependency, so the app is fully styled offline.**

Note: `tailwind.config.js` has a small `safelist` for four `shadow-<color>-500/20`
classes that `components/HabitLoopView.tsx` builds dynamically. If you change the
habit-loop step colors, update that safelist or the glow shadow won't be generated.
