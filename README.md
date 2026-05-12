# MyStatApp

MyStatApp is a React Native habit and self-stat tracking app built around a three-level model:

- `Core` -> high-level life domain
- `Skill` -> capability inside a core
- `Habit` -> daily action that earns points

The app tracks score accumulation, streaks, target progress, analytics views, local backups, and Android home screen widgets.

## Project Snapshot

| Item | Value |
| --- | --- |
| App name | `MyStatApp` |
| Package / bundle id | `com.dimascorp.mystat` |
| Version | npm `0.0.1`, Android `1.0 (code 1)` |
| Framework | React Native CLI |
| React Native | `0.82.1` |
| React | `19.1.1` |
| Node.js | `>=20` |
| Android SDK | min `24`, compile `36`, target `36` |
| iOS | Native iOS project included in `ios/` |

## What The App Does

### Core product flow

1. Create or edit `cores`
2. Create `skills` under each core
3. Create `habits` under each skill
4. Log habit activity with a metric amount
5. Convert the logged amount into points using the habit `scale`
6. Roll points upward into habit, skill, and core totals

### Current implemented features

- Persistent local data with AsyncStorage
- Seeded default cores and skills on first launch
- Home dashboard with total score, average score, editable score targets, and radar chart
- Quick Log screen for fast daily logging across all habits
- Core, skill, and habit CRUD flows
- Streak tracking with current streak, best streak, completed day counts, and core streak calendar
- Analytics screen with:
  - radar chart
  - score distribution bars
  - total score bars
  - balance breakdown
  - per-core streak summaries
- Compact number formatting toggle (`10K`, `1.2M`, etc.)
- Export/import progress backup as MyStat JSON
- Generated 21-day analytics sample mode with restore path back to real data
- Deep link support for `mystat://`
- Android home screen widgets with multiple layouts

## Data Model

### Core

- `id`
- `name`
- `color`
- `totalScore`
- timestamps

### Skill

- `id`
- `coreId`
- `name`
- `totalScore`
- timestamps

### Habit

- `id`
- `skillId`
- `name`
- `description`
- `metric`
- `scale`
- `countDays`
- `streak`
- `bestStreak`
- `totalScore`
- `lastDoneDate`
- timestamps

### Event

Each log entry stores:

- `habitId`
- `skillId`
- `coreId`
- `rawAmount`
- `scaled`
- `points`
- `at`
- `day`

## Scoring And Streak Rules

- Logged points are computed from `ceil(rawAmount * scale)`
- Negative or non-numeric amounts are rejected
- `countDays` increases only once per habit per day
- Logging multiple times on the same day adds points, but does not double-count the day
- Streaks increment only when the next completion lands on the next calendar day
- If a day gap is missed, the streak resets to `1`

## Navigation Structure

Bottom tabs:

- `Home`
- `Analytics`
- `Settings`

Main stack screens currently present in the app:

- `HomeMain`
- `AddCore`
- `EditCore`
- `AddSkill`
- `EditSkill`
- `Habits`
- `AddHabit`
- `EditHabit`
- `QuickLog`
- `HabitDetail`
- `CoreDetail`
- `Skills`
- `SkillDetail`
- `AnalyticsMain`
- `CoreStreakCalendar`
- `SettingsMain`

## Android Widget Support

MyStatApp includes a native Android widget package under `android/app/src/main/java/com/dimascorp/mystat/widget`.

### Widget variants currently in the project

- `Radar 2x2`
- `Pie 2x2`
- `Scores 4x2`
- `Quick 4x2`
- `Quick 4x3`
- `Target 4x4`
- `Totals 4x4`

Widget payloads are built from app state in `src/utils/widgetPayload.js` and synced through the React Native bridge when core totals or display settings change.

## Deep Links

The app registers the `mystat://` scheme.

Examples:

- `mystat://home`
- `mystat://analytics`
- `mystat://settings`
- `mystat://app/quick-log`

## Tech Stack

- React Native CLI
- React Navigation
- AsyncStorage
- `react-native-chart-kit`
- `react-native-svg`
- Native Android widget code in Kotlin
- Jest for tests

## Repository Layout

```text
MyStatApp/
├── android/                 Android native app and widgets
├── ios/                     iOS native app
├── docs/
│   └── RUN_ANDROID.md       Android setup guide
├── src/
│   ├── components/          Charts and UI building blocks
│   ├── context/             App state and business logic
│   ├── screens/             Screen-level UI
│   ├── utils/               Storage, widgets, backup, formatting, streak logic
│   └── data/                Sample seed/support data
├── __tests__/               Jest coverage for core logic
├── App.tsx                  RN entry wrapper
├── src/App.js               App root
└── run-mystatapp.sh         Local Android dev helper script
```

## Local Development

### Prerequisites

- Node.js `>=20`
- npm
- Android Studio for Android development
- Java 17
- CocoaPods for iOS dependency installation

### Install dependencies

```sh
npm ci
```

### Start Metro

```sh
npm start
```

### Run on Android

```sh
npm run android
```

For a more detailed Android flow, see [docs/RUN_ANDROID.md](./docs/RUN_ANDROID.md).

### Run on iOS

```sh
bundle install
bundle exec pod install
npm run ios
```

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start Metro bundler |
| `npm run android` | Build and launch Android app |
| `npm run ios` | Build and launch iOS app |
| `npm test` | Run Jest test suite |
| `npm run lint` | Run ESLint |

### Helper script

`run-mystatapp.sh` is a local Android-focused helper that:

- sets Java 17
- restarts `adb`
- re-applies port reverse
- kills an old Metro instance on `8081`
- starts Metro with reset cache
- relaunches the installed Android app

## Testing

Current tests cover the most important business logic:

- `StatContext` state seeding, logging, cascaded deletes, reset, sample data, and settings persistence
- widget payload formatting and top-core limiting
- day helpers
- number formatting helpers
- core streak helpers

Run:

```sh
npm test
```

## Backup Format

Progress export writes a JSON file with this top-level shape:

```json
{
  "app": "MyStatApp",
  "backupVersion": 1,
  "exportedAt": "2026-05-12T00:00:00.000Z",
  "data": {
    "cores": [],
    "skills": [],
    "habits": [],
    "events": [],
    "settings": {}
  }
}
```

The import path validates:

- app identity
- backup version
- JSON structure
- required progress arrays

## Default App Settings

The app currently initializes with:

- `theme: light`
- `totalScoreTarget: 10000`
- `averageScoreTarget: 1000`
- `compactNumbers: true`

## Notes On Current Scope

- The app is local-first; no backend or account sync is implemented in this repository.
- Data storage is device-local.
- Analytics already includes a placeholder section for future trend expansion.
- Android widget support is implemented; there is no equivalent iOS widget implementation in this repo.

## Key Files

- [src/context/StatContext.js](./src/context/StatContext.js)
- [src/navigation.js](./src/navigation.js)
- [src/screens/HomeScreen.js](./src/screens/HomeScreen.js)
- [src/screens/AnalyticsScreen.js](./src/screens/AnalyticsScreen.js)
- [src/screens/QuickLogScreen.js](./src/screens/QuickLogScreen.js)
- [src/screens/SettingsScreen.js](./src/screens/SettingsScreen.js)
- [src/utils/widgetPayload.js](./src/utils/widgetPayload.js)
- [docs/RUN_ANDROID.md](./docs/RUN_ANDROID.md)

## Status

This README reflects the current codebase in this repository as inspected on `2026-05-12`.
