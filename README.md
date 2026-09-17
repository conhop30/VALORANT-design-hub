# VALORANT Design Hub

A local-first tool for designing and cataloguing custom VALORANT agents (with
their abilities) and weapons. Fully offline — no account, no backend; your
data lives on-device (SQLite on mobile, `localStorage` on web/desktop) and
can be exported/imported as JSON for backup or moving between devices.

Runs on three platforms from one Expo/react-native-web codebase:

- **Web** — `expo start --web`, or any static host serving `npm run export:web`'s output
- **Desktop** — a real Windows app via Electron (see below)
- **Mobile** — Expo Go for development; real installable Android/iOS builds via EAS Build

## Getting started

```
npm install
npm start        # Metro bundler — press w/a/i, or scan the QR code with Expo Go
```

Other dev scripts:

- `npm run web` — launch straight into the web target
- `npm run android` / `npm run ios` — launch straight into a connected emulator/device
- `npm test` / `npm run test:watch` — Jest
- `npm run dev` — Metro + Jest watch mode side by side

## Desktop (Electron)

```
npm run electron        # build the web export, then launch it in an Electron window
npm run electron:build  # produces a real NSIS installer under release/ (gitignored)
```

The desktop app wraps the same web export in a small Electron shell
(`electron/main.js` + `electron/preload.js`). It launches windowed by
default; **Settings → Display** offers a fullscreen toggle and a few standard
window size presets, and F11 also toggles fullscreen. Window size/fullscreen
state persists across launches.

Expo's static web export emits absolute asset paths (`/favicon.ico`,
`/_expo/...`), which don't resolve under Electron's `file://` protocol —
`main.js` works around this with a tiny loopback-only static file server
instead of `loadFile`.

## Mobile (EAS Build)

Expo Go is fine for day-to-day development, but for a real installable
binary:

```
npx eas login            # one-time, needs a free expo.dev account
npm run build:android    # → installable .apk (EAS Build "preview" profile)
npm run build:ios        # → needs an Apple Developer account for a real device
```

Build profiles live in `eas.json`. The project is linked to the
`valorant-design-hub` Expo account (`app.json`'s `extra.eas.projectId`).

## Data & settings

- **Agents** — name, role, bio, hero image, and inline abilities (each with
  its own icon/description/sound).
- **Weapons** — category, cost, fire rate, magazine size, damage falloff.
- **Export/Import** (Settings → Data) — dumps/restores everything as a single
  JSON file.
- **Audio** — optional looping ambient track + UI click sounds, each with its
  own enable toggle and volume slider.
- **Display** (desktop only) — fullscreen toggle and window size presets.

## Project layout

```
src/
  components/   shared UI (forms, cards, Settings sheet, Slider, ...)
  screens/      top-level screens (Hub)
  data/         zustand store, repository, persistence (native SQLite / web localStorage)
  audio/        ambient music + click sound controllers
  platform/     platform-bridge hooks (e.g. Electron display IPC)
  types/        shared entity types
electron/       Electron main process + preload script (desktop only)
```
