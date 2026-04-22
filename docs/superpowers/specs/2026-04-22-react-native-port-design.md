# React Native Port — Design Spec

**Date:** 2026-04-22
**Status:** Approved for implementation
**Author:** brainstorming session

## Goal

Port the existing Vite + React web habit tracker to a production-grade native iOS app using React Native / Expo. Preserve all existing features, UX, and data model exactly — no new features. Make existing features that are partially stubbed on the web (haptics, sounds, notifications) actually work natively.

## Constraints

- **1:1 feature parity** with the current web app. No additions, no removals (except dead code: `screens/Tips.tsx` already unwired per commit `94fafa7`).
- **Fresh start on data** — no migration from web app `localStorage`. Users re-enter their habit name on first launch.
- **Web app is deprecated** — Vite/Netlify scaffolding removed after port completes.
- **No new automated tests** introduced. Manual testing only.

## Stack Decisions

| Concern | Choice | Notes |
|---|---|---|
| Framework | Expo (SDK 54, already installed) | Keeps current Expo/RN 0.81.5 setup |
| Navigation | `@react-navigation/native` + `bottom-tabs` | Maps 1:1 to current `activeTab` switch |
| Styling | NativeWind v4 | Preserve Tailwind utility classes |
| Storage | `@react-native-async-storage/async-storage` | Drop-in for `localStorage` |
| Charts | `react-native-gifted-charts` | Single `AreaChart` in Stats |
| Icons | `lucide-react-native` | Same icon names as `lucide-react` |
| Haptics | `expo-haptics` | Replaces `navigator.vibrate` |
| Sounds | `expo-audio` + 5 pre-rendered `.mp3`s | Web Audio synth → bundled assets |
| Notifications | `expo-notifications` | Wire existing `reminderTime` setting to real scheduling |
| Safe areas | `react-native-safe-area-context` | Standard RN requirement |
| Gradients | `expo-linear-gradient` | Where Tailwind gradient classes were used |
| Blur effects | `expo-blur` | Only where `backdrop-blur` was used |

## File Structure

```
App.tsx                      # RN entry (rewritten from App.native.tsx)
index.ts                     # registerRootComponent
constants.tsx                # UNCHANGED (pure data)
types.ts                     # UNCHANGED (pure types)
context/HabitContext.tsx     # PORTED (web-API swaps)
services/storageService.ts   # PORTED (async AsyncStorage)
utils/haptics.ts             # PORTED (expo-haptics)
utils/soundService.ts        # PORTED (expo-audio + mp3s)
components/
  Layout.tsx                 # REWRITTEN (no tab bar — native nav handles it)
  HabitButtons.tsx           # REWRITTEN to RN primitives
  HabitLoopView.tsx          # REWRITTEN
  Heatmap.tsx                # REWRITTEN (CSS grid → RN flex)
  WillpowerModal.tsx         # REWRITTEN
screens/
  Home.tsx                   # REWRITTEN
  Tasks.tsx                  # REWRITTEN
  Stats.tsx                  # REWRITTEN (recharts → gifted-charts)
  Gamification.tsx           # REWRITTEN
  Settings.tsx               # REWRITTEN (navigator.storage check removed)
assets/
  sounds/
    success.mp3              # NEW (pre-rendered arpeggio)
    taskComplete.mp3         # NEW
    diceTick.mp3             # NEW
    diceResult.mp3           # NEW
    purchase.mp3             # NEW
  icon.png                   # UNCHANGED
  [other existing assets]    # UNCHANGED
docs/superpowers/specs/      # This spec
```

**Delete after port completes:**
- `App.tsx` (old web entry)
- `App.native.tsx` (scaffolding shell)
- `index.tsx` (old Vite entry)
- `index.html`
- `vite.config.ts`
- `tsconfig.node.json`
- `netlify.toml`
- `_redirects`
- `screens/Tips.tsx` (already unwired)
- Web-only deps in `package.json`: `vite`, `@vitejs/plugin-react`, `react-dom`, `recharts`, `lucide-react`, `postcss`, `autoprefixer`, `@types/react-dom`

## Navigation Architecture

Bottom tab navigator replaces the current `activeTab` useState + switch. Tabs:

| Tab ID | Label | Screen Component |
|---|---|---|
| home | Home | `HomeScreen` |
| tasks | Tasks | `TasksScreen` |
| stats | Stats | `StatsScreen` |
| rewards | Rewards | `GamificationScreen` |
| settings | Settings | `SettingsScreen` |

Tab bar is rendered by React Navigation. The current `<Layout>` component's tab-bar portion is removed; its shared container wrapper (dark background, safe-area inset) remains as a per-screen wrapper.

## State & Storage Port Rules

`HabitContext.tsx` logic ports verbatim except these four web APIs:

| Web | Native |
|---|---|
| `window.addEventListener('focus', checkDate)` | `AppState.addEventListener('change', handler)` where handler fires `checkDate` when next state is `'active'` |
| `document.addEventListener('visibilitychange')` | Subsumed by the single `AppState` listener above |
| `localStorage.clear()` | `AsyncStorage.clear()` |
| `window.location.reload()` | Re-run `loadInitialState` to reset context from storage (no actual process reload) |

`storageService.ts` becomes async:

```ts
async saveData<T>(key: string, data: T): Promise<void>
async loadData<T>(key: string, fallback: T): Promise<T>
```

Callers that currently consume these synchronously get updated to `await` (or the call site is moved into an `async` init block).

Dark mode sync: instead of toggling `document.documentElement.classList`, store `isDarkMode` in context (already there) and render conditional `className="dark"` on the root `<View>` — NativeWind v4 supports class-based dark mode.

Font size sync: same strategy — conditional class on root. If class-based font scaling doesn't propagate as expected, fall back to a context-provided scale factor applied per `<Text>`.

## Platform Bridges

### Haptics (`utils/haptics.ts`)

| Current | Port |
|---|---|
| `selection: vibrate(5)` | `Haptics.selectionAsync()` |
| `light: vibrate(15)` | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` |
| `medium: vibrate(30)` | `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` |
| `heavy: vibrate(60)` | `Haptics.impactAsync(ImpactFeedbackStyle.Heavy)` |
| `success: vibrate([10,40,10])` | `Haptics.notificationAsync(NotificationFeedbackType.Success)` |
| `error: vibrate([50,50,50])` | `Haptics.notificationAsync(NotificationFeedbackType.Error)` |

All call sites unchanged — API surface identical.

### Sounds (`utils/soundService.ts`)

Pre-render the five Web Audio synth outputs as `.mp3` files (generated offline, bundled in `assets/sounds/`). Implementation uses `expo-audio` with pre-loaded `AudioPlayer` instances for latency-free playback. Public API of `soundService` remains identical (`playSuccess`, `playTaskComplete`, `playDiceTick`, `playDiceResult`, `playPurchase`).

### Notifications

Currently: `notificationsEnabled` and `reminderTime` settings exist in UI but are not wired to any scheduling code (web has no viable native notification story).

Native wiring (not a new feature — wiring existing UI to real behavior):

- On app startup and whenever `notificationsEnabled` / `reminderTime` changes, reconcile a scheduled daily local notification via `expo-notifications`.
- If `notificationsEnabled === false`, cancel any scheduled notification.
- Notification content: a simple reminder referencing the user's `habitName`.
- Permissions requested on first toggle-on.

### Web APIs being dropped

- `navigator.share` (only in `Tips.tsx`, being deleted)
- `navigator.storage.persisted()` in Settings: replaced with a hardcoded `true` indicator (AsyncStorage is persistent on iOS by design)

## Styling Port Rules

- Run `npx nativewind init` and extend existing `tailwind.config.js` for RN.
- Most utility classes carry over. Known rewrites needed:
  - Gradients (`bg-gradient-to-*`) → wrap in `<LinearGradient>` from `expo-linear-gradient`
  - Backdrop blur (`backdrop-blur-*`) → wrap in `<BlurView>` from `expo-blur`
  - `hover:` pseudo-class → drop (no hover on touch)
  - `active:` pseudo-class → supported by NativeWind v4
  - CSS transitions on `className` changes → use RN `Animated` or `LayoutAnimation` only if user-visible motion was non-trivial
- Global dark mode: root `<View>` toggles `className="dark"`.

## Chart Replacement

`screens/Stats.tsx` uses `recharts.AreaChart` with:
- XAxis (last 7 days)
- YAxis (0–100 willpower)
- Tooltip
- Area fill (cyan, semi-transparent)
- CartesianGrid

Replace with `react-native-gifted-charts` `<LineChart areaChart />`:
- Data array pre-mapped to gifted-charts shape
- Same cyan fill color
- Tooltip configured via `pointerConfig`
- Grid via `yAxisColor` / `rulesColor` props

Heatmap component is not a recharts chart; it's custom divs. Port to nested `<View>`s with identical grid math.

## Implementation Order

Linear waves. Each wave is a verifiable checkpoint.

1. **Foundation** — install deps, NativeWind config, `App.tsx` rewrite, `index.ts`, bottom-tab navigator with 5 placeholder screens rendering names. Native build runs.
2. **Services** — port `storageService`, `haptics`, `soundService` (with placeholder mp3s initially). Pre-render real mp3s before end of wave.
3. **Context** — port `HabitContext.tsx` with the 4 web-API swaps. Provider wraps navigator in `App.tsx`.
4. **Shared components** — `Layout` (trimmed), `HabitButtons`, `HabitLoopView`, `Heatmap`, `WillpowerModal`.
5. **Screens** — port in order: Home, Tasks, Settings, Stats, Gamification.
6. **Native polish** — notifications wired to `reminderTime`, splash, app icon, status bar style, safe areas verified.
7. **Cleanup** — delete web scaffolding files and web-only `package.json` deps.

## Risks & Known Unknowns

- **Heatmap grid math** — uses CSS Grid, needs flex-wrap conversion. Resolvable but fiddly.
- **WillpowerModal animation** — if it uses CSS transitions, may need `LayoutAnimation` or Reanimated. Verify during Wave 4.
- **Font size "large"** — RN doesn't cascade font scaling via className. Fallback: context-provided scale factor applied per `<Text>`.
- **Sound file generation** — need to decide offline whether to script via Node's WebAudio library, or record once and commit. Decision deferred to Wave 2.
- **Notifications permission UX** — iOS prompts on first enable. Existing Settings UI doesn't explain this; we'll let the system prompt speak for itself (no new UI).

## Out of Scope

Explicitly not part of this port:

- Home-screen or Lock-screen widgets
- Apple Watch companion
- Siri Shortcuts
- HealthKit integration
- Push notifications (local only)
- Any new UI element, screen, or setting
- Data migration from the web app
- Keeping the web app functional

## Acceptance Criteria

- App launches on iOS Simulator and device from `npx expo run:ios`.
- All 5 tabs render and their primary interactions work.
- Habit check-ins persist across app relaunch.
- Dark mode toggles via Settings and applies app-wide.
- Haptics fire on supported actions (same triggers as web).
- Sounds play when `soundsEnabled`.
- Local reminder notification schedules when `notificationsEnabled`.
- Web scaffolding (Vite, Netlify, webpack-era configs) removed.
- App archives successfully from Xcode with no new signing errors.
- TestFlight build renders native UI (no more "Cannot connect to dev server").
