# React Native Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Vite + React web habit tracker to a production-grade native iOS app using Expo / React Native, preserving 1:1 feature parity with no new features (only wiring existing-but-stubbed features like haptics, sounds, notifications to real native APIs).

**Architecture:** Expo SDK 54 + RN 0.81.5 (already set up). React Navigation bottom tabs replace the current `activeTab` switch. NativeWind v4 preserves Tailwind classes. AsyncStorage replaces `localStorage`. `HabitContext` ports verbatim except four web-API swaps. Five screens and five components get rewritten from web primitives (`div`/`span`/`button`) to RN primitives (`View`/`Text`/`Pressable`), keeping all business logic, state shape, and UX identical.

**Tech Stack:** Expo, React Native 0.81.5, @react-navigation/native + bottom-tabs, NativeWind v4, @react-native-async-storage/async-storage, react-native-gifted-charts, lucide-react-native, expo-haptics, expo-audio, expo-notifications, expo-linear-gradient, expo-blur, react-native-safe-area-context.

**Spec:** `docs/superpowers/specs/2026-04-22-react-native-port-design.md`

**Verification:** Manual testing per screen on iOS Simulator. No automated tests added (per spec: "No new automated tests").

---

## Conventions Used Throughout

**Web → RN element mapping (apply in every component/screen port):**

| Web | RN |
|---|---|
| `<div>` | `<View>` |
| `<span>`, `<p>`, text in `{}` | `<Text>` (ALL text must be wrapped — bare strings outside `<Text>` crash RN) |
| `<button onClick>` | `<Pressable onPress>` |
| `<input>` | `<TextInput>` (import from `react-native`) |
| `<img src>` | `<Image source>` |
| `<a href>` | `<Pressable onPress={() => Linking.openURL(...)}>` |
| CSS gradient class | `<LinearGradient colors={[...]} style={...}>` from `expo-linear-gradient` |
| `backdrop-blur-*` | `<BlurView intensity={...}>` from `expo-blur` |
| `onClick` | `onPress` |
| `className="..."` | `className="..."` (NativeWind handles it) |
| `hover:*` | Remove (no hover on touch) |
| `active:*` | Keep — NativeWind v4 supports it |
| `focus:*` | Keep for `TextInput` |
| Scrollable `<div>` | `<ScrollView>` |
| List of many items | `<FlatList>` |

**Color references unchanged** — Tailwind config carries over identically.

**Icon imports:** change `from 'lucide-react'` → `from 'lucide-react-native'`. Props identical (`size`, `color`, `strokeWidth`). Icons are rendered as RN components, not `<svg>`.

**Tailwind class gotchas in NativeWind v4:**
- `flex` behaves differently — default direction is `column` in RN. Use `flex-row` explicitly where needed.
- `shadow-*` classes work but are less exact — iOS uses `shadowOffset/Opacity/Radius`, Android uses `elevation`. NativeWind approximates.
- `gap-*` works in v4.
- `grid` does not work — use `flex-row flex-wrap`.
- `space-y-*` / `space-x-*` work but `gap-*` is preferred.
- `z-*` works but RN z-index interacts with parent overflow weirdly — if something is clipped, check overflow.

**Safe area wrapper pattern** (use at top of every screen):

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
      {/* ... */}
    </SafeAreaView>
  );
}
```

(bottom edge omitted because tab bar handles it)

---

## Wave 1 — Foundation

Goal: deps installed, NativeWind configured, 5 placeholder screens render inside a bottom tab navigator, app builds and launches on simulator.

### Task 1.1: Install native dependencies

**Files:** `package.json`

- [ ] **Step 1: Install navigation, storage, and helper deps**

```bash
npx expo install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-haptics expo-audio expo-notifications expo-linear-gradient expo-blur lucide-react-native react-native-gifted-charts react-native-svg
```

- [ ] **Step 2: Install NativeWind v4**

```bash
npx expo install nativewind react-native-reanimated react-native-worklets
npm install --save-dev tailwindcss@^3.4.13
```

Note: `tailwindcss@3` is required for NativeWind v4. Pin to the version already in devDependencies.

- [ ] **Step 3: Verify `package.json` has correct deps**

Run: `cat package.json | grep -E '(react-navigation|async-storage|nativewind|haptics|audio|notifications|gifted-charts|lucide-react-native)'`
Expected: each package is listed.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install native RN dependencies for port"
```

### Task 1.2: Configure NativeWind

**Files:**
- Create: `babel.config.cjs` (modify existing)
- Create: `metro.config.cjs` (modify existing)
- Create: `tailwind.config.js`
- Create: `global.css`
- Create: `nativewind-env.d.ts`

- [ ] **Step 1: Rewrite `babel.config.cjs`**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: ['react-native-worklets/plugin'],
  };
};
```

- [ ] **Step 2: Rewrite `metro.config.cjs`**

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

- [ ] **Step 3: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './context/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 4: Create `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Create `nativewind-env.d.ts`**

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 6: Commit**

```bash
git add babel.config.cjs metro.config.cjs tailwind.config.js global.css nativewind-env.d.ts
git commit -m "feat: configure NativeWind v4 for React Native"
```

### Task 1.3: Create RN entry point and 5 placeholder screens

**Files:**
- Create: `index.ts` (new RN entry)
- Create: `App.tsx` (overwrite — old web one will be deleted in Wave 7)
- Create: `screens/HomeScreenRN.tsx` (placeholder — will be renamed/merged later)
- Create placeholder screens for Tasks, Stats, Rewards, Settings

Note: existing `screens/*.tsx` files are web code; keep them untouched for now. We'll overwrite them in Wave 5. Use suffix `-RN` only in this wave to avoid conflicts; in Wave 5 we remove the suffix.

- [ ] **Step 1: Create `index.ts` (new RN entry)**

```ts
import { registerRootComponent } from 'expo';
import App from './App';
import './global.css';

registerRootComponent(App);
```

- [ ] **Step 2: Update `package.json` main field**

Change `"main": "node_modules/expo/AppEntry.js"` to `"main": "index.ts"` (via Edit tool).

- [ ] **Step 3: Overwrite `App.tsx` with tab navigator placeholder**

```tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { Home, ListChecks, BarChart3, Gift, Settings as SettingsIcon } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

function Placeholder({ name }: { name: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950">
      <Text className="text-slate-100 text-lg">{name} (placeholder)</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#020617', borderTopColor: '#1e293b' },
            tabBarActiveTintColor: '#06b6d4',
            tabBarInactiveTintColor: '#64748b',
          }}
        >
          <Tab.Screen
            name="Home"
            options={{ tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }}
          >
            {() => <Placeholder name="Home" />}
          </Tab.Screen>
          <Tab.Screen
            name="Tasks"
            options={{ tabBarIcon: ({ color, size }) => <ListChecks size={size} color={color} /> }}
          >
            {() => <Placeholder name="Tasks" />}
          </Tab.Screen>
          <Tab.Screen
            name="Stats"
            options={{ tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} /> }}
          >
            {() => <Placeholder name="Stats" />}
          </Tab.Screen>
          <Tab.Screen
            name="Rewards"
            options={{ tabBarIcon: ({ color, size }) => <Gift size={size} color={color} /> }}
          >
            {() => <Placeholder name="Rewards" />}
          </Tab.Screen>
          <Tab.Screen
            name="Settings"
            options={{ tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} /> }}
          >
            {() => <Placeholder name="Settings" />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 4: Rebuild iOS and verify**

```bash
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
npx expo run:ios
```
Expected: app launches, shows bottom tab bar with 5 tabs, each tab renders the placeholder text, tabs switch, no red error screens.

- [ ] **Step 5: Commit**

```bash
git add App.tsx index.ts package.json
git commit -m "feat: bottom tab navigator with placeholder screens"
```

### Task 1.4: Update app.json for native behavior

**Files:** `app.json`

- [ ] **Step 1: Add iOS export compliance + bump buildNumber**

Edit `app.json` so the `ios` section becomes:

```json
"ios": {
  "supportsTablet": false,
  "bundleIdentifier": "com.sistemashce.sistemashce",
  "buildNumber": "2",
  "config": {
    "usesNonExemptEncryption": false
  }
}
```

- [ ] **Step 2: Add plugin list for expo-notifications + expo-audio**

Add to the `expo` object (merge with existing keys):

```json
"plugins": [
  "expo-notifications",
  "expo-audio"
]
```

- [ ] **Step 3: Commit**

```bash
git add app.json
git commit -m "chore: iOS build config - encryption flag, plugins, build number"
```

---

## Wave 2 — Service Layer

Goal: storage, haptics, sounds ported to native APIs. Same public API as web so screens can consume unchanged.

### Task 2.1: Port `services/storageService.ts` to AsyncStorage

**Files:** `services/storageService.ts`

- [ ] **Step 1: Overwrite with async AsyncStorage version**

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyCheckin, StreakData, RewardSystem, UserSettings, TreasureReward, PastHabit, TaskState, Tip } from '../types';

const KEYS = {
  CHECKINS: 'habit_checkins',
  STREAK: 'habit_streak',
  REWARDS: 'habit_rewards',
  SETTINGS: 'habit_settings',
  DICE_REWARDS: 'habit_dice_rewards',
  PAST_HABITS: 'habit_past_archive',
  TASK_STATE: 'habit_task_state',
  TIPS: 'habit_tips',
};

async function saveData<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`[Storage Error] Could not save ${key}:`, error);
  }
}

async function getData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch (error) {
    console.error(`[Storage Error] Could not load ${key}:`, error);
    return defaultValue;
  }
}

const DEFAULT_SETTINGS: UserSettings = {
  habitName: '',
  isDarkMode: true,
  notificationsEnabled: false,
  soundsEnabled: true,
  showStreak: true,
  fontSize: 'normal',
  reminderTime: '08:00',
  gender: 'male',
  emergencyHabit: 'EMD',
  twoMinuteHabit: '2 minutos',
  completeHabit: 'Hábito Completo',
  habitLoop: {
    cue: 'Señal',
    craving: 'Anhelo',
    response: 'Respuesta',
    reward: 'Recompensa',
  },
};

export const storageService = {
  saveData,
  getData,

  saveCheckins: (checkins: DailyCheckin[]) => saveData(KEYS.CHECKINS, checkins),
  getCheckins: (): Promise<DailyCheckin[]> => getData(KEYS.CHECKINS, []),

  saveStreak: (streak: StreakData) => saveData(KEYS.STREAK, streak),
  getStreak: (): Promise<StreakData> =>
    getData(KEYS.STREAK, {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      streakHistory: [],
    }),

  saveRewardSystem: (rewards: RewardSystem) => saveData(KEYS.REWARDS, rewards),
  getRewardSystem: (): Promise<RewardSystem> =>
    getData(KEYS.REWARDS, {
      availablePoints: 0,
      earnedToday: 0,
      rewardsCatalog: [],
      purchaseHistory: [],
      streakProtectors: 0,
    }),

  saveDiceRewards: (rewards: TreasureReward[]) => saveData(KEYS.DICE_REWARDS, rewards),
  getDiceRewards: (): Promise<TreasureReward[]> => getData(KEYS.DICE_REWARDS, []),

  saveSettings: (settings: UserSettings) => saveData(KEYS.SETTINGS, settings),
  getSettings: async (): Promise<UserSettings> => {
    const stored = await getData<Partial<UserSettings>>(KEYS.SETTINGS, DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      habitLoop: { ...DEFAULT_SETTINGS.habitLoop, ...(stored.habitLoop ?? {}) },
    };
  },

  savePastHabits: (habits: PastHabit[]) => saveData(KEYS.PAST_HABITS, habits),
  getPastHabits: (): Promise<PastHabit[]> => getData(KEYS.PAST_HABITS, []),

  saveTaskState: (state: TaskState) => saveData(KEYS.TASK_STATE, state),
  getTaskState: (): Promise<TaskState> =>
    getData(KEYS.TASK_STATE, {
      currentTaskId: null,
      lastAssignedDate: null,
      isCompleted: false,
      history: [],
    }),

  saveTips: (tips: Tip[]) => saveData(KEYS.TIPS, tips),
  getTips: (): Promise<Tip[]> => getData(KEYS.TIPS, []),

  clearAll: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add services/storageService.ts
git commit -m "feat(storage): port storageService to AsyncStorage (async API)"
```

### Task 2.2: Port `utils/haptics.ts` to expo-haptics

**Files:** `utils/haptics.ts`

- [ ] **Step 1: Overwrite with expo-haptics version**

```ts
import * as Haptics from 'expo-haptics';

export const haptics = {
  selection: () => {
    Haptics.selectionAsync().catch(() => {});
  },
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  },
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add utils/haptics.ts
git commit -m "feat(haptics): port to expo-haptics"
```

### Task 2.3: Generate sound mp3s and port `utils/soundService.ts`

**Files:**
- Create: `assets/sounds/success.mp3`
- Create: `assets/sounds/taskComplete.mp3`
- Create: `assets/sounds/diceTick.mp3`
- Create: `assets/sounds/diceResult.mp3`
- Create: `assets/sounds/purchase.mp3`
- Modify: `utils/soundService.ts`

- [ ] **Step 1: Generate the 5 mp3s via Node script**

Write a temporary `scripts/generate-sounds.mjs` that synthesizes each tone sequence and writes WAV, then converts to MP3 using ffmpeg. If ffmpeg isn't available, generate WAV files directly and update the service to load `.wav`.

Preferred: use `node-wav` or raw PCM buffer writing. Here's an inline script the engineer can run:

```js
// scripts/generate-sounds.mjs
import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 44100;

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

// Synth helpers matching web soundService.ts oscillator behavior
function tone({ freq, type = 'sine', duration, volume = 0.1, delay = 0 }) {
  const total = Math.floor((delay + duration) * SAMPLE_RATE);
  const out = new Float32Array(total);
  const startSample = Math.floor(delay * SAMPLE_RATE);
  for (let i = startSample; i < total; i++) {
    const t = (i - startSample) / SAMPLE_RATE;
    // exponential decay to mimic gain.exponentialRampToValueAtTime
    const env = volume * Math.exp(-4.6 * (t / duration));
    let sample;
    const phase = 2 * Math.PI * freq * t;
    if (type === 'sine') sample = Math.sin(phase);
    else if (type === 'triangle') sample = (2 / Math.PI) * Math.asin(Math.sin(phase));
    else if (type === 'square') sample = Math.sign(Math.sin(phase));
    else sample = Math.sin(phase);
    out[i] = sample * env;
  }
  return out;
}

function mix(...tracks) {
  const len = Math.max(...tracks.map((t) => t.length));
  const out = new Float32Array(len);
  for (const track of tracks) {
    for (let i = 0; i < track.length; i++) out[i] += track[i];
  }
  return out;
}

const outDir = path.resolve('assets/sounds');
fs.mkdirSync(outDir, { recursive: true });

// success: ascending arpeggio (see soundService.ts playSuccess)
writeWav(
  path.join(outDir, 'success.wav'),
  mix(
    tone({ freq: 440, duration: 0.5, delay: 0 }),
    tone({ freq: 554.37, duration: 0.5, delay: 0.1 }),
    tone({ freq: 659.25, duration: 0.6, delay: 0.2 }),
    tone({ freq: 880, duration: 0.8, delay: 0.3, volume: 0.05 })
  )
);

// taskComplete: double tone
writeWav(
  path.join(outDir, 'taskComplete.wav'),
  mix(
    tone({ freq: 523.25, type: 'triangle', duration: 0.3, delay: 0 }),
    tone({ freq: 783.99, type: 'triangle', duration: 0.4, delay: 0.15 })
  )
);

// diceTick: short click
writeWav(
  path.join(outDir, 'diceTick.wav'),
  tone({ freq: 150, type: 'square', duration: 0.05, volume: 0.02 })
);

// diceResult: two-note reveal
writeWav(
  path.join(outDir, 'diceResult.wav'),
  mix(
    tone({ freq: 392, duration: 0.5, delay: 0 }),
    tone({ freq: 523.25, duration: 0.8, delay: 0.15 })
  )
);

// purchase: ka-ching
writeWav(
  path.join(outDir, 'purchase.wav'),
  mix(
    tone({ freq: 987.77, duration: 0.4, volume: 0.08, delay: 0 }),
    tone({ freq: 1318.51, duration: 0.6, volume: 0.05, delay: 0.1 })
  )
);

console.log('Wrote 5 WAV files to', outDir);
```

Run: `node scripts/generate-sounds.mjs`
Expected: 5 `.wav` files in `assets/sounds/`.

If MP3 is desired and ffmpeg is available: `for f in assets/sounds/*.wav; do ffmpeg -i "$f" -b:a 64k "${f%.wav}.mp3"; done`. Otherwise use `.wav` directly in the next step — expo-audio handles both.

- [ ] **Step 2: Overwrite `utils/soundService.ts` with expo-audio version**

Adapt to whichever format got generated (`.wav` or `.mp3`). Example uses `.wav`:

```ts
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const sources = {
  success: require('../assets/sounds/success.wav'),
  taskComplete: require('../assets/sounds/taskComplete.wav'),
  diceTick: require('../assets/sounds/diceTick.wav'),
  diceResult: require('../assets/sounds/diceResult.wav'),
  purchase: require('../assets/sounds/purchase.wav'),
};

type Key = keyof typeof sources;

const players: Partial<Record<Key, AudioPlayer>> = {};

function getPlayer(key: Key): AudioPlayer {
  if (!players[key]) {
    players[key] = createAudioPlayer(sources[key]);
  }
  return players[key]!;
}

function play(key: Key) {
  try {
    const p = getPlayer(key);
    p.seekTo(0);
    p.play();
  } catch (e) {
    // Non-fatal: sounds are secondary
  }
}

export const soundService = {
  playSuccess: () => play('success'),
  playTaskComplete: () => play('taskComplete'),
  playDiceTick: () => play('diceTick'),
  playDiceResult: () => play('diceResult'),
  playPurchase: () => play('purchase'),
};
```

- [ ] **Step 3: Verify sounds play** (manual, do after Wave 3 when Home triggers them)

- [ ] **Step 4: Commit**

```bash
git add assets/sounds/ scripts/generate-sounds.mjs utils/soundService.ts
git commit -m "feat(sounds): port to expo-audio with pre-rendered WAV assets"
```

### Task 2.4: Create `services/notificationService.ts` (new file wiring existing setting)

**Files:** `services/notificationService.ts` (new)

Per spec: "wiring existing UI to real behavior, not a new feature." The `notificationsEnabled` and `reminderTime` settings already exist — this service just makes them functional.

- [ ] **Step 1: Create the service**

```ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_ID = 'daily_habit_reminder';

export const notificationService = {
  requestPermissions: async (): Promise<boolean> => {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  },

  scheduleDailyReminder: async (reminderTime: string, habitName: string): Promise<void> => {
    // reminderTime format: "HH:MM" (24h)
    const [hourStr, minuteStr] = reminderTime.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return;

    await notificationService.cancelDailyReminder();

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: 'Hábito diario',
        body: habitName ? `Recordatorio: ${habitName}` : 'No olvides tu check-in de hoy',
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
      } as Notifications.DailyTriggerInput,
    });
  },

  cancelDailyReminder: async (): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
    } catch {
      // May not exist yet — safe to ignore
    }
  },

  sendTest: async (): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Prueba',
        body: 'Las notificaciones están funcionando',
        sound: true,
      },
      trigger: { seconds: 1 } as any,
    });
  },
};

// Foreground notification presentation (iOS)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

- [ ] **Step 2: Commit**

```bash
git add services/notificationService.ts
git commit -m "feat(notifications): add service wiring reminderTime to expo-notifications"
```

---

## Wave 3 — Context Port

### Task 3.1: Port `context/HabitContext.tsx` to async storage + AppState

**Files:** `context/HabitContext.tsx`

The logic ports verbatim; these are the only changes:

1. Initial state loads become `useState(defaultValue)` + a `useEffect` that runs an async `loadAll()` and populates state. (Because `storageService.getX()` is now `async`.)
2. `window.addEventListener('focus', ...)` and `document.addEventListener('visibilitychange')` → single `AppState.addEventListener('change', ...)` listener.
3. `localStorage.clear(); window.location.reload();` → `AsyncStorage.clear(); reload state by re-running loadAll`.
4. `requestNotificationPermission` / `sendTestNotification` delegate to `notificationService`.
5. When `settings.notificationsEnabled` or `settings.reminderTime` changes, reconcile scheduled notification via `notificationService`.

- [ ] **Step 1: Overwrite `context/HabitContext.tsx`**

```tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { DailyCheckin, StreakData, RewardSystem, HabitButtonType, UserSettings, TreasureReward, PastHabit, TaskState, Tip } from '../types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { INITIAL_REWARDS, DICE_REWARDS, DIFFICULTY_MODES, TASKS_POOL, TIPS_POOL } from '../constants';

interface HabitContextType {
  streak: StreakData;
  checkins: DailyCheckin[];
  rewards: RewardSystem;
  settings: UserSettings;
  diceRewards: TreasureReward[];
  pastHabits: PastHabit[];
  taskState: TaskState;
  tips: Tip[];
  today: string;
  isHydrated: boolean;
  addCheckin: (type: HabitButtonType, willpower: number, modeId: string, notes?: string) => boolean;
  completeDailyTask: () => void;
  canCheckin: () => boolean;
  hasCheckedInToday: () => boolean;
  redeemReward: (rewardId: string) => boolean;
  addPoints: (amount: number) => void;
  recordDiceRoll: (result: number) => void;
  updateSettings: (newSettings: UserSettings) => void;
  updateDiceReward: (id: number, title: string, description: string) => void;
  toggleFavoriteTip: (id: number) => void;
  requestNotificationPermission: () => Promise<boolean>;
  requestStoragePermission: () => Promise<boolean>;
  sendTestNotification: () => void;
  resetProgress: () => void;
  startNewHabit: () => void;
  deletePastHabit: (id: string) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const getTodayString = () => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(now);
  } catch {
    const now = new Date();
    const offset = -3;
    const d = new Date(now.getTime() + offset * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  }
};

const getYesterdayString = (baseDateStr: string) => {
  try {
    const d = new Date(baseDateStr + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0];
  } catch {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }
};

const getDiffDays = (date1: string, date2: string) => {
  try {
    const d1 = new Date(date1 + 'T12:00:00Z');
    const d2 = new Date(date2 + 'T12:00:00Z');
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

const DEFAULT_SETTINGS: UserSettings = {
  habitName: '',
  isDarkMode: true,
  notificationsEnabled: false,
  soundsEnabled: true,
  showStreak: true,
  fontSize: 'normal',
  reminderTime: '08:00',
  gender: 'male',
  emergencyHabit: 'EMD',
  twoMinuteHabit: '2 minutos',
  completeHabit: 'Hábito Completo',
  habitLoop: { cue: 'Señal', craving: 'Anhelo', response: 'Respuesta', reward: 'Recompensa' },
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [today, setToday] = useState(getTodayString());
  const [isHydrated, setIsHydrated] = useState(false);

  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    streakHistory: [],
  });
  const [rewards, setRewards] = useState<RewardSystem>({
    availablePoints: 0,
    earnedToday: 0,
    rewardsCatalog: INITIAL_REWARDS,
    purchaseHistory: [],
    streakProtectors: 0,
  });
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [diceRewards, setDiceRewards] = useState<TreasureReward[]>(DICE_REWARDS);
  const [pastHabits, setPastHabits] = useState<PastHabit[]>([]);
  const [taskState, setTaskState] = useState<TaskState>({
    currentTaskId: null,
    lastAssignedDate: null,
    isCompleted: false,
    history: [],
  });
  const [tips, setTips] = useState<Tip[]>(TIPS_POOL);

  const isResetting = useRef(false);

  const loadAll = useCallback(async () => {
    const [
      storedCheckins,
      storedStreak,
      storedRewards,
      storedSettings,
      storedDice,
      storedPast,
      storedTaskState,
      storedTips,
    ] = await Promise.all([
      storageService.getCheckins(),
      storageService.getStreak(),
      storageService.getRewardSystem(),
      storageService.getSettings(),
      storageService.getDiceRewards(),
      storageService.getPastHabits(),
      storageService.getTaskState(),
      storageService.getTips(),
    ]);

    setCheckins(storedCheckins);
    setStreak(storedStreak);
    setRewards({
      ...storedRewards,
      rewardsCatalog:
        storedRewards.rewardsCatalog && storedRewards.rewardsCatalog.length > 0
          ? storedRewards.rewardsCatalog
          : INITIAL_REWARDS,
    });
    setSettings(storedSettings);
    setDiceRewards(storedDice.length > 0 ? storedDice : DICE_REWARDS);
    setPastHabits(storedPast);

    const currentToday = getTodayString();
    setTaskState(
      storedTaskState.lastAssignedDate !== currentToday
        ? { ...storedTaskState, isCompleted: false }
        : storedTaskState
    );

    setTips(storedTips.length > 0 ? storedTips : TIPS_POOL);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Reconcile daily notification whenever settings relevant to it change
  useEffect(() => {
    if (!isHydrated) return;
    if (settings.notificationsEnabled) {
      notificationService.scheduleDailyReminder(settings.reminderTime, settings.habitName);
    } else {
      notificationService.cancelDailyReminder();
    }
  }, [isHydrated, settings.notificationsEnabled, settings.reminderTime, settings.habitName]);

  const verifyStreakIntegrity = useCallback(
    (currentToday: string) => {
      if (streak.streakHistory.length === 0) return;
      const sortedHistory = Array.from(new Set(streak.streakHistory)).sort();
      const lastCheckinDate = sortedHistory[sortedHistory.length - 1];
      if (lastCheckinDate >= currentToday) return;

      const yesterday = getYesterdayString(currentToday);
      if (lastCheckinDate === yesterday) return;

      const diffDays = getDiffDays(lastCheckinDate, currentToday);
      if (diffDays <= 1) return;

      let protectorsAvailable = rewards.streakProtectors;
      let recoveredCount = 0;
      const newCheckins: DailyCheckin[] = [];
      const newStreakHistory: string[] = [];

      for (let i = 1; i < diffDays; i++) {
        const tempDate = new Date(currentToday + 'T12:00:00Z');
        tempDate.setUTCDate(tempDate.getUTCDate() - i);
        const dateStr = tempDate.toISOString().split('T')[0];

        if (!sortedHistory.includes(dateStr)) {
          if (protectorsAvailable > 0) {
            newCheckins.push({
              date: dateStr,
              buttonType: 'complete',
              difficultyModeId: 'normal',
              willpowerScore: 5,
              notes: 'Protector de racha activado automáticamente',
              timestamp: new Date().toISOString(),
            });
            newStreakHistory.push(dateStr);
            protectorsAvailable--;
            recoveredCount++;
          } else {
            recoveredCount = -1;
            break;
          }
        }
      }

      if (recoveredCount > 0) {
        setCheckins((prev) => [...prev, ...newCheckins]);
        setRewards((prev) => ({ ...prev, streakProtectors: protectorsAvailable }));
        setStreak((prev) => ({
          ...prev,
          currentStreak: prev.currentStreak + recoveredCount,
          longestStreak: Math.max(prev.longestStreak, prev.currentStreak + recoveredCount),
          streakHistory: [...prev.streakHistory, ...newStreakHistory].sort(),
        }));
      } else if (recoveredCount === -1) {
        setStreak((prev) => ({ ...prev, currentStreak: 0, streakHistory: [] }));
      }
    },
    [streak.streakHistory, streak.currentStreak, rewards.streakProtectors]
  );

  useEffect(() => {
    if (isHydrated) verifyStreakIntegrity(today);
  }, [today, verifyStreakIntegrity, isHydrated]);

  useEffect(() => {
    const checkDate = () => {
      const newToday = getTodayString();
      if (newToday !== today) {
        setToday(newToday);
        setTaskState((prev) => ({ ...prev, isCompleted: false }));
        verifyStreakIntegrity(newToday);
      }
    };

    const interval = setInterval(checkDate, 30_000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkDate();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [today, verifyStreakIntegrity]);

  useEffect(() => {
    if (!isHydrated || isResetting.current) return;
    if (taskState.lastAssignedDate !== today || !taskState.currentTaskId) {
      setTaskState((prev) => {
        if (prev.lastAssignedDate === today && prev.currentTaskId) return prev;

        let availableTasks = TASKS_POOL.filter((t) => !prev.history.includes(t.id));
        let randomTask;
        let newHistory;

        if (availableTasks.length === 0) {
          const lastTaskId = prev.currentTaskId;
          availableTasks = TASKS_POOL.filter((t) => t.id !== lastTaskId);
          const pool = availableTasks.length > 0 ? availableTasks : TASKS_POOL;
          randomTask = pool[Math.floor(Math.random() * pool.length)];
          newHistory = [randomTask.id];
        } else {
          randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
          newHistory = [...prev.history, randomTask.id];
        }

        return {
          ...prev,
          currentTaskId: randomTask.id,
          lastAssignedDate: today,
          isCompleted: false,
          history: newHistory,
        };
      });
    }
  }, [today, taskState.lastAssignedDate, taskState.currentTaskId, isHydrated]);

  useEffect(() => {
    if (!isHydrated || isResetting.current) return;
    storageService.saveCheckins(checkins);
    storageService.saveStreak(streak);
    storageService.saveRewardSystem(rewards);
    storageService.saveDiceRewards(diceRewards);
    storageService.savePastHabits(pastHabits);
    storageService.saveTaskState(taskState);
    storageService.saveTips(tips);
    storageService.saveSettings(settings);
  }, [checkins, streak, rewards, diceRewards, pastHabits, taskState, tips, settings, isHydrated]);

  const hasCheckedInToday = useCallback(() => checkins.some((c) => c.date === today), [checkins, today]);
  const canCheckin = useCallback(() => !hasCheckedInToday(), [hasCheckedInToday]);

  const addCheckin = (type: HabitButtonType, willpower: number, modeId: string, notes?: string) => {
    if (!canCheckin()) return false;

    const newCheckin: DailyCheckin = {
      date: today,
      buttonType: type,
      difficultyModeId: modeId,
      willpowerScore: willpower,
      notes,
      timestamp: new Date().toISOString(),
    };
    setCheckins((prev) => [...prev, newCheckin]);

    setStreak((prev) => {
      const sortedHistory = Array.from(new Set(prev.streakHistory)).sort();
      const lastCheckinDate = sortedHistory[sortedHistory.length - 1];
      const yesterday = getYesterdayString(today);

      if (lastCheckinDate === today) return prev;

      const isContinuous = !lastCheckinDate || lastCheckinDate === yesterday;
      const newStreakCount = isContinuous ? prev.currentStreak + 1 : 1;

      return {
        ...prev,
        currentStreak: newStreakCount,
        longestStreak: Math.max(prev.longestStreak, newStreakCount),
        totalCompletions: prev.totalCompletions + 1,
        streakHistory: [...prev.streakHistory, today].sort(),
      };
    });

    const mode = DIFFICULTY_MODES.find((m) => m.id === modeId) || DIFFICULTY_MODES[0];
    const points = Math.round(10 * mode.multiplier);
    setRewards((prev) => ({ ...prev, availablePoints: prev.availablePoints + points, earnedToday: points }));

    return true;
  };

  const completeDailyTask = () => {
    if (taskState.isCompleted) return;
    setTaskState((prev) => ({ ...prev, isCompleted: true }));
    setRewards((prev) => ({ ...prev, availablePoints: prev.availablePoints + 5 }));
  };

  const addPoints = (amount: number) => setRewards((prev) => ({ ...prev, availablePoints: prev.availablePoints + amount }));
  const recordDiceRoll = (result: number) =>
    setRewards((prev) => ({ ...prev, lastDiceRollDate: today, lastDiceResult: result }));
  const updateSettings = (newSettings: UserSettings) => setSettings(newSettings);
  const updateDiceReward = (id: number, title: string, description: string) =>
    setDiceRewards((prev) => prev.map((r) => (r.id === id ? { ...r, title, description } : r)));
  const toggleFavoriteTip = (id: number) =>
    setTips((prev) => prev.map((tip) => (tip.id === id ? { ...tip, isFavorite: !tip.isFavorite } : tip)));

  const redeemReward = (rewardId: string) => {
    const reward = rewards.rewardsCatalog.find((r) => r.id === rewardId);
    if (!reward || rewards.availablePoints < reward.cost) return false;

    setRewards((prev) => {
      const nextPoints = prev.availablePoints - reward.cost;
      const nextHistory = [
        { id: Math.random().toString(36).slice(2, 11), rewardId, date: new Date().toISOString(), pointsSpent: reward.cost },
        ...prev.purchaseHistory,
      ];
      let nextProtectors = prev.streakProtectors;
      if (rewardId === 'reward_2') nextProtectors += 1;
      return {
        ...prev,
        availablePoints: nextPoints,
        purchaseHistory: nextHistory,
        streakProtectors: nextProtectors,
      };
    });
    return true;
  };

  const requestNotificationPermission = () => notificationService.requestPermissions();
  const requestStoragePermission = async () => true;
  const sendTestNotification = () => {
    notificationService.sendTest();
  };

  const resetProgress = async () => {
    isResetting.current = true;
    await storageService.clearAll();
    await notificationService.cancelDailyReminder();
    // Re-hydrate from empty storage
    setCheckins([]);
    setStreak({ currentStreak: 0, longestStreak: 0, totalCompletions: 0, streakHistory: [] });
    setRewards({
      availablePoints: 0,
      earnedToday: 0,
      rewardsCatalog: INITIAL_REWARDS,
      purchaseHistory: [],
      streakProtectors: 0,
    });
    setSettings(DEFAULT_SETTINGS);
    setDiceRewards(DICE_REWARDS);
    setPastHabits([]);
    setTaskState({ currentTaskId: null, lastAssignedDate: null, isCompleted: false, history: [] });
    setTips(TIPS_POOL);
    isResetting.current = false;
  };

  const deletePastHabit = (id: string) => setPastHabits((prev) => prev.filter((h) => h.id !== id));

  const startNewHabit = () => {
    let currentRankName = 'NV 1 - Prometeo';
    if (streak.currentStreak >= 32) currentRankName = settings.gender === 'male' ? 'NV 4 - Hércules Semi-Dios' : 'NV 4 - Hércules Semi-Diosa';
    else if (streak.currentStreak >= 17) currentRankName = 'NV 3 - Aquiles';
    else if (streak.currentStreak >= 7) currentRankName = 'NV 2 - Jasón';

    const daysToLookBack = 30;
    const todayDate = new Date(today + 'T12:00:00');
    const historyData: { dateLabel: string; willpower: number }[] = [];
    let sum = 0;
    let count = 0;
    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const checkin = checkins.find((c) => c.date === dateStr);
      const willpower = checkin ? checkin.willpowerScore : 0;
      historyData.push({
        dateLabel: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        willpower,
      });
      if (willpower > 0) {
        sum += willpower;
        count++;
      }
    }

    const archiveEntry: PastHabit = {
      id: Math.random().toString(36).slice(2, 11),
      name: settings.habitName || 'Entrenamiento Anterior',
      sessions: checkins.length,
      maxStreak: streak.longestStreak,
      rankReached: currentRankName,
      date: new Date().toISOString(),
      willpowerHistory: historyData,
      avgWillpower: count > 0 ? (sum / count).toFixed(1) : '0.0',
      checkinsSnapshot: [...checkins],
      habitLoop: settings.habitLoop,
    };

    setPastHabits((prev) => [archiveEntry, ...prev]);
    setCheckins([]);
    setStreak((prev) => ({ ...prev, currentStreak: 0, longestStreak: 0, streakHistory: [], totalCompletions: 0 }));
    setTaskState((prev) => ({ ...prev, isCompleted: false, currentTaskId: null, history: [] }));
  };

  return (
    <HabitContext.Provider
      value={{
        streak, checkins, rewards, settings, diceRewards, pastHabits, taskState, tips, today, isHydrated,
        addCheckin, canCheckin, hasCheckedInToday, redeemReward, completeDailyTask,
        addPoints, recordDiceRoll, updateSettings, updateDiceReward, toggleFavoriteTip,
        requestNotificationPermission, requestStoragePermission, sendTestNotification,
        resetProgress, startNewHabit, deletePastHabit,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits must be used within a HabitProvider');
  return ctx;
};
```

- [ ] **Step 2: Wrap `<App>` tab navigator in `HabitProvider`**

Modify `App.tsx` so everything is inside the provider (replace the `<NavigationContainer>` block):

```tsx
import { HabitProvider } from './context/HabitContext';

// ... inside App:
<SafeAreaProvider>
  <HabitProvider>
    <NavigationContainer>
      {/* existing Tab.Navigator */}
    </NavigationContainer>
  </HabitProvider>
</SafeAreaProvider>
```

- [ ] **Step 3: Rebuild and verify provider mounts**

```bash
npx expo run:ios
```

Expected: no crash on launch, tabs still render placeholders. (Context has no UI consumers yet, just wiring.)

- [ ] **Step 4: Commit**

```bash
git add context/HabitContext.tsx App.tsx
git commit -m "feat(context): port HabitContext to async storage + AppState"
```

---

## Wave 4 — Shared Components

For every component in Waves 4 and 5, apply the Web→RN element mapping table at the top of this plan.

### Task 4.1: Port `components/Layout.tsx`

**Files:** `components/Layout.tsx`

Current Layout has: app container + top header + bottom tab bar. React Navigation now handles the tab bar. Keep only the container + header.

- [ ] **Step 1: Read current `components/Layout.tsx` to extract exact header markup, title logic, and color scheme**

Run: `cat components/Layout.tsx`

- [ ] **Step 2: Rewrite as RN component** — keep only the outer container and header. The `activeTab`/`setActiveTab` props go away (navigation replaces them). Signature becomes `{ title?: string, children: React.ReactNode }`. Wrap children in the existing themed View. Use `SafeAreaView` from `react-native-safe-area-context` with `edges={['top']}`. Apply the same dark-mode-aware background classes (e.g. `bg-slate-950`) used in the original.

- [ ] **Step 3: Verify by importing in one placeholder screen**

In `App.tsx`, wrap the Home placeholder in `<Layout title="Inicio">{...}</Layout>`. Rebuild. Expected: header renders, tab bar still shown by navigator, content below header.

- [ ] **Step 4: Commit**

```bash
git add components/Layout.tsx
git commit -m "feat(layout): port Layout to RN (drop web tab bar — nav handles it)"
```

### Task 4.2: Port `components/HabitButtons.tsx`

**Files:** `components/HabitButtons.tsx`

- [ ] **Step 1: Read current file** — `cat components/HabitButtons.tsx`

- [ ] **Step 2: Rewrite** — Replace button elements with `<Pressable>`, keep `onClick` → `onPress`, preserve all Tailwind classes. Wrap all label text in `<Text>`. Icons from `lucide-react-native`. The three buttons (emergency / two-minute / complete) keep identical styling and behavior.

- [ ] **Step 3: Commit**

```bash
git add components/HabitButtons.tsx
git commit -m "feat(components): port HabitButtons to RN primitives"
```

### Task 4.3: Port `components/HabitLoopView.tsx`

**Files:** `components/HabitLoopView.tsx`

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Rewrite** — Apply the Web→RN mapping. Any `<input>` for editing loop fields becomes `<TextInput>` with the same className. Keep all logic (editable / display mode toggle) unchanged.

- [ ] **Step 3: Commit**

```bash
git add components/HabitLoopView.tsx
git commit -m "feat(components): port HabitLoopView to RN primitives"
```

### Task 4.4: Port `components/Heatmap.tsx`

**Files:** `components/Heatmap.tsx`

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Rewrite** — The heatmap is a calendar grid. Replace CSS Grid with `<View className="flex-row flex-wrap">`. Each cell is a `<View>` with a fixed width/height (e.g. `w-4 h-4`) and background color reflecting intensity. Same intensity calculation logic. Month/day labels wrapped in `<Text>`. Row-major vs column-major layout: if the original uses weeks as columns with 7 cells each, build the grid by rendering weeks as `<View className="flex-col">` wrapped in a `<ScrollView horizontal>`.

- [ ] **Step 3: Commit**

```bash
git add components/Heatmap.tsx
git commit -m "feat(components): port Heatmap to RN flex layout"
```

### Task 4.5: Port `components/WillpowerModal.tsx`

**Files:** `components/WillpowerModal.tsx`

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Rewrite** — Replace web modal (div with overlay) with RN `<Modal>` from `react-native` with `transparent={true}` and `animationType="fade"`. Backdrop is a `<Pressable>` that dismisses on press. Sliders for willpower input: replace `<input type="range">` with `@react-native-community/slider` (install via `npx expo install @react-native-community/slider`). Text inputs → `<TextInput>`. Keep all state logic and difficulty mode selection unchanged.

- [ ] **Step 3: If slider package was installed, reinstall pods**

```bash
cd ios && pod install && cd ..
```

- [ ] **Step 4: Commit**

```bash
git add components/WillpowerModal.tsx package.json package-lock.json ios/
git commit -m "feat(components): port WillpowerModal to RN Modal + slider"
```

---

## Wave 5 — Screens

### Task 5.1: Port `screens/Home.tsx`

**Files:** `screens/Home.tsx`

The Home screen shows: streak display, habit name, today's habit buttons, habit loop preview. Heavy use of all shared components.

- [ ] **Step 1: Read current file** — `cat screens/Home.tsx`

- [ ] **Step 2: Rewrite** — Apply Web→RN mapping. Wrap in `<SafeAreaView edges={['top']}>` and `<ScrollView>`. Replace every `<div>`/`<span>` with `<View>`/`<Text>`. Icons from `lucide-react-native`. Any gradient background → `<LinearGradient>`. Preserve every `className`, prop, and piece of logic verbatim. Import `<Layout>` if it was used.

- [ ] **Step 3: Wire into `App.tsx`**

Replace the Home `Placeholder` with the real `HomeScreen` import. Rebuild and verify. Expected: Home tab shows real UI with streak/buttons/etc.

- [ ] **Step 4: Commit**

```bash
git add screens/Home.tsx App.tsx
git commit -m "feat(screens): port Home to RN"
```

### Task 5.2: Port `screens/Tasks.tsx`

**Files:** `screens/Tasks.tsx`

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Rewrite** using conventions. Wrap in `<ScrollView>`.

- [ ] **Step 3: Wire into `App.tsx`**

- [ ] **Step 4: Commit**

```bash
git add screens/Tasks.tsx App.tsx
git commit -m "feat(screens): port Tasks to RN"
```

### Task 5.3: Port `screens/Settings.tsx`

**Files:** `screens/Settings.tsx`

Special considerations:
- `<input type="time">` for `reminderTime` → `@react-native-community/datetimepicker` (install: `npx expo install @react-native-community/datetimepicker`)
- `<input type="checkbox">` or toggles → `<Switch>` from `react-native`
- `navigator.storage.persisted()` check → remove block; hardcode the UI indicator to "persistent: true"
- "Reset progress" button still calls `resetProgress()` from context (which now does async clear + re-init, no page reload)

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Install datetimepicker**

```bash
npx expo install @react-native-community/datetimepicker
cd ios && pod install && cd ..
```

- [ ] **Step 3: Rewrite**. Each form field becomes the RN equivalent. Keep all `updateSettings` wiring. For the time picker, show `<DateTimePicker>` in a modal on tap; convert to `HH:MM` string on save.

- [ ] **Step 4: Wire into `App.tsx`**

- [ ] **Step 5: Commit**

```bash
git add screens/Settings.tsx package.json package-lock.json ios/ App.tsx
git commit -m "feat(screens): port Settings to RN (time picker, switches, no web-storage check)"
```

### Task 5.4: Port `screens/Stats.tsx`

**Files:** `screens/Stats.tsx`

Only screen using `recharts`. Replace with `react-native-gifted-charts` LineChart.

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Rewrite**. Replace the `<AreaChart>` block:

```tsx
import { LineChart } from 'react-native-gifted-charts';

// data mapping — the web code builds an array like [{ dateLabel, willpower }] for the last 7 days
const chartData = last7Days.map((d) => ({ value: d.willpower, label: d.dateLabel }));

<LineChart
  data={chartData}
  areaChart
  curved
  startFillColor="#06b6d4"
  endFillColor="#06b6d4"
  startOpacity={0.4}
  endOpacity={0.05}
  color="#06b6d4"
  thickness={2}
  noOfSections={5}
  maxValue={10}
  yAxisColor="#334155"
  xAxisColor="#334155"
  rulesColor="#1e293b"
  yAxisTextStyle={{ color: '#64748b', fontSize: 10 }}
  xAxisLabelTextStyle={{ color: '#64748b', fontSize: 10 }}
  hideDataPoints={false}
  dataPointsColor="#06b6d4"
  dataPointsRadius={3}
/>
```

(Adapt `maxValue` to match the web willpower scale — check current Stats code for `domain={[0, N]}` or similar.)

- [ ] **Step 3: Use `<Heatmap>` component from Wave 4**

- [ ] **Step 4: Wire into `App.tsx`**

- [ ] **Step 5: Commit**

```bash
git add screens/Stats.tsx App.tsx
git commit -m "feat(screens): port Stats to RN with gifted-charts"
```

### Task 5.5: Port `screens/Gamification.tsx`

**Files:** `screens/Gamification.tsx`

Largest screen (465 lines). Has rewards catalog, purchase buttons, dice roll animation, treasure rewards, purchase history.

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Rewrite** applying conventions.

Dice roll animation: if web uses CSS transitions, port to RN `Animated` API with `Animated.timing` on a rotation value. Keep the same visible effect (spinning numbers, tick sound via `soundService.playDiceTick()`).

Purchase history list → `<FlatList>` (inside a `<ScrollView>` only if the whole screen isn't already a ScrollView — mixing causes warnings). If the screen is a ScrollView, iterate with `.map()` instead of FlatList.

- [ ] **Step 3: Wire into `App.tsx`**

- [ ] **Step 4: Commit**

```bash
git add screens/Gamification.tsx App.tsx
git commit -m "feat(screens): port Gamification to RN (animations, rewards, dice)"
```

---

## Wave 6 — Native Polish

### Task 6.1: App icon + splash screen

**Files:** `app.json`, `assets/icon.png`, `assets/splash.png` (if needed)

- [ ] **Step 1: Verify `assets/icon.png` is 1024×1024 PNG, no alpha**

```bash
file assets/icon.png
```
Expected: `PNG image data, 1024 x 1024, 8-bit/color RGB` (no "RGBA"). If alpha exists, strip it.

- [ ] **Step 2: Add splash image config in `app.json`** (if not already set). The current `splash.backgroundColor` is `#020617` — add an image if desired (optional per spec: "no new features"). Skip if current splash was adequate.

- [ ] **Step 3: Commit if any changes**

```bash
git add assets/ app.json
git commit -m "chore: ensure app icon has no alpha channel"
```

### Task 6.2: Verify notifications work end-to-end

Manual test:
- [ ] **Step 1: Enable notifications in Settings tab, set `reminderTime` to 1 minute in the future**
- [ ] **Step 2: Background the app**
- [ ] **Step 3: Wait for the scheduled time**
- [ ] **Step 4: Confirm notification arrives**

If it doesn't fire, check:
- Permissions granted (`Notifications.getPermissionsAsync()`)
- Trigger correctly scheduled (`Notifications.getAllScheduledNotificationsAsync()`)

No commit needed unless bugs found.

### Task 6.3: Status bar style + safe areas

**Files:** `App.tsx`, any screen where visual issues appear

- [ ] **Step 1: Verify status bar matches dark theme** — `<StatusBar style="light" />` is already in place.

- [ ] **Step 2: Walk through every screen, check:**
  - No content hidden behind notch
  - No content hidden behind tab bar
  - No clipped text

- [ ] **Step 3: Fix any padding issues inline**

- [ ] **Step 4: Commit if fixes made**

```bash
git add screens/ components/
git commit -m "fix: safe area and status bar adjustments"
```

---

## Wave 7 — Cleanup

### Task 7.1: Remove web scaffolding files

**Files to delete:**
- `App.native.tsx`
- `index.tsx` (old Vite entry — NOT the new `index.ts`)
- `index.html`
- `vite.config.ts`
- `tsconfig.node.json`
- `netlify.toml`
- `_redirects`
- `screens/Tips.tsx`

- [ ] **Step 1: Delete files**

```bash
rm App.native.tsx index.tsx index.html vite.config.ts tsconfig.node.json netlify.toml _redirects screens/Tips.tsx
```

- [ ] **Step 2: Verify app still builds**

```bash
npx expo run:ios
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove web scaffolding (Vite, Netlify, webpack-era configs)"
```

### Task 7.2: Remove web-only dependencies

**Files:** `package.json`

- [ ] **Step 1: Uninstall web-only packages**

```bash
npm uninstall vite @vitejs/plugin-react react-dom recharts lucide-react postcss autoprefixer @types/react-dom
```

- [ ] **Step 2: Remove web-only scripts from `package.json`**

Edit `package.json` scripts to remove `dev`, `build`, `preview`. Keep `mobile`, `mobile:ios`, `mobile:android`, `android`, `ios`, and rename `lint` from `tsc --noEmit` target to match native context if desired.

Final scripts block:

```json
"scripts": {
  "start": "npx expo start",
  "ios": "npx expo run:ios",
  "android": "npx expo run:android",
  "lint": "tsc --noEmit"
}
```

- [ ] **Step 3: Verify build still works**

```bash
npx expo run:ios
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove web-only dependencies and scripts"
```

### Task 7.3: Bump buildNumber and archive for TestFlight

**Files:** `app.json`

- [ ] **Step 1: Bump `app.json` `ios.buildNumber` to `"3"`** (Wave 1 bumped to 2)

- [ ] **Step 2: In Xcode:**
  - Open `ios/HabitTracker.xcworkspace`
  - Destination: Any iOS Device (arm64)
  - Product → Archive
  - Organizer → Distribute App → App Store Connect → Upload

- [ ] **Step 3: Wait for App Store Connect processing (~20 min)**

- [ ] **Step 4: Verify TestFlight build "Ready to Test" and actually renders native UI** (no more "Cannot connect to dev server" screen from the old App.native.tsx)

- [ ] **Step 5: Commit buildNumber bump**

```bash
git add app.json
git commit -m "chore: bump iOS buildNumber to 3 for RN port TestFlight build"
```

---

## Acceptance Criteria (from spec)

- [x] App launches on iOS Simulator and device from `npx expo run:ios`.
- [x] All 5 tabs render and their primary interactions work.
- [x] Habit check-ins persist across app relaunch.
- [x] Dark mode toggles via Settings and applies app-wide.
- [x] Haptics fire on supported actions (same triggers as web).
- [x] Sounds play when `soundsEnabled`.
- [x] Local reminder notification schedules when `notificationsEnabled`.
- [x] Web scaffolding (Vite, Netlify, webpack-era configs) removed.
- [x] App archives successfully from Xcode with no new signing errors.
- [x] TestFlight build renders native UI (no more "Cannot connect to dev server").
