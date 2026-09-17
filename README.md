# VALORANT Design Hub

A cross-platform, fully offline app for designing and cataloguing custom
VALORANT agents (with their abilities) and weapons. One codebase ships to
**web, Windows desktop, and Android/iOS** from a single Expo/React Native
project — no backend, no account: all data lives on-device and can be
exported/imported as JSON for backup or moving between devices.

Built as a personal project to explore shipping one React Native codebase to
every platform for real (not just "runs in Expo Go"), including packaging a
genuine Windows installer and a signed installable Android build.

## Live at a glance

- **Create & browse agents** — name, role, bio, hero image with a
  drag-to-reposition focal point, and four abilities (C/Q/E/X) each with
  their own icon, description, and sound.
- **Create & browse weapons** — category, cost, fire rate, magazine size,
  damage falloff.
- **Search, filter, and sort** both catalogs.
- **Export/import** the entire dataset as one JSON file — the only way data
  ever leaves the device.
- **Ambient background music + UI click sounds**, each independently
  toggleable with a volume slider.
- **Desktop-only Display settings** — windowed/fullscreen toggle, window
  size presets, state persisted across launches.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| UI framework | React Native + [react-native-web](https://necolas.github.io/react-native-web/) via Expo | One component tree renders natively on Android/iOS *and* compiles to a static web bundle — the actual mechanism that makes "one codebase, three platforms" true here, rather than three separate UIs. |
| Language | TypeScript | Shared entity types (`src/types/entities.ts`) are the single contract between the UI, the store, and both persistence backends — catches shape mismatches (see [Challenges](#challenges--how-they-were-solved)) at compile time. |
| State | [Zustand](https://github.com/pmndrs/zustand) | A single small store (`src/data/store.ts`) holds agents, weapons, and settings in memory and mirrors writes to disk; chosen over Redux/Context for its minimal boilerplate in a single-developer app. |
| Persistence | `expo-sqlite` (native) / `localStorage` (web) behind one repository interface | `src/data/persistenceImpl.native.ts` and `.web.ts` implement the same `persistenceTypes.ts` contract, so `repository.ts` and the store never know which backend they're talking to. |
| Desktop shell | [Electron](https://www.electronjs.org/) | Wraps the same web export in a native window (`electron/main.js` + `preload.js`) to produce a real `.exe`/NSIS installer, instead of just opening a browser tab. Chosen over Tauri specifically to avoid needing a Rust/MSVC toolchain in the dev environment. |
| Mobile builds | [EAS Build](https://docs.expo.dev/build/introduction/) | Produces installable `.apk`/`.ipa` binaries (via `eas.json` profiles) instead of relying on Expo Go for anything beyond day-to-day development. |
| Animation / gestures | `react-native-reanimated` + `react-native-gesture-handler`, `PanResponder` | Drives the hero panel's slide transition and the drag-to-reposition focal-point picker. |
| Testing | Jest + `ts-jest` | Unit coverage on the store, repository, persistence, and data-normalization logic — the layers most likely to silently corrupt user data. |

## Architecture

```
UI (screens/components)
        │  reads/writes
        ▼
Zustand store (src/data/store.ts)     ── single in-memory source of truth
        │  save/list/remove
        ▼
Repository (src/data/repository.ts)   ── platform-agnostic API
        │
   ┌────┴─────┐
   ▼          ▼
SQLite     localStorage
(native)      (web/desktop)
```

The store never touches SQLite or `localStorage` directly — it only calls
`repository.ts`, which dispatches to whichever `persistenceImpl.*.ts` Metro
resolves for the current platform. Adding a platform (or swapping storage
engines) means implementing one interface, not touching UI code.

## Challenges & how they were solved

**Electron couldn't load Expo's web export.**
Expo's static web export emits absolute asset paths (`/favicon.ico`,
`/_expo/...`), which don't resolve under Electron's `file://` protocol —
loading `index.html` directly produced a blank white window with 404s in
the console. Fixed by having `electron/main.js` spin up a tiny
loopback-only static file server (127.0.0.1, path-traversal-checked)
instead of calling `loadFile`, so the app is served over `http://` exactly
like a real deployment.

**A schema refactor crashed on old saved data.**
Abilities were originally stored as an `abilityIds` reference list, then
folded inline into each `Agent` as a full `abilities` object. Agents saved
under the old shape crashed with `Cannot read properties of undefined
(reading 'C')` the moment they were reopened — an optional-chaining bug
(`initial?.abilities.C`) only guarded against a missing agent, not a
missing/legacy `abilities` field. Fixed with a `normalizeAgentAbilities`
step applied in both persistence adapters' read path, so every consumer
downstream can always trust `agent.abilities` is fully populated,
regardless of when the record was originally saved.

**EAS Build failed in CI with a lockfile error that didn't reproduce
locally.** `npm ci` passed locally (npm 11) but failed on EAS's build
servers (npm 10) with `Missing: typescript from lock file` — a real
nested peer-dependency inconsistency that npm 11 tolerated silently but
npm 10 rejected under `ci`'s strict mode. Root-caused by reproducing with
`npx -y npm@10.9.8 ci` locally, then fixed by regenerating and committing
the lockfile with that same npm version.

**RN Web's `<Image onLoad>` silently broke the focal-point picker.**
The hero-image drag-to-reposition UI depends on knowing the image's
natural pixel dimensions. Reading them from `<Image onLoad>`'s
`nativeEvent.source` worked on native but returned nothing on
`react-native-web` — invisibly, because the browser's own CSS
`object-fit` masked the bug by cropping correctly anyway even while the
drag math was broken. Fixed by fetching dimensions explicitly via
`Image.getSize(uri, ...)` instead of trusting the load event.

**A global dev-machine env var made Electron silently not launch.**
`ELECTRON_RUN_AS_NODE=1` being set in the shell profile made
`npx electron .` silently run `main.js` under plain Node instead of
booting Electron (symptom: `Cannot read properties of undefined (reading
'whenReady')`, which looks like an app bug but isn't). Worked around per
invocation with `env -u ELECTRON_RUN_AS_NODE electron ...` rather than
chasing a phantom bug in application code.

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

Launches windowed by default; **Settings → Display** offers a fullscreen
toggle and a few standard window size presets, and F11 also toggles
fullscreen. Window size/fullscreen state persists across launches.

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

**Status:** Android — done (built via EAS, installed and verified on an
emulator). iOS — not yet attempted; needs either a Mac (free simulator
build) or a paid Apple Developer account (real device).

## Data & settings

- **Agents** — name, role, bio, hero image, and inline abilities (each with
  its own icon/description/sound). Abilities are edited one slot at a time
  behind C/Q/E/X podium tabs (`AgentForm.tsx`) rather than as four stacked
  blocks. The hero image supports a drag-to-reposition focal point
  (`HeroImagePositioner.tsx` + `CoverImage.tsx`) so cropping isn't locked to
  dead-center; when an agent is expanded on the Hub screen, its hero image
  shows as a right-docked panel (`HeroPanel.tsx`) that pushes the content
  column left, rather than a full-screen background.
- **Weapons** — category, cost, fire rate, magazine size, damage falloff.
- **Export/Import** (Settings → Data) — dumps/restores everything as a single
  JSON file.
- **Audio** — optional looping ambient track + UI click sounds, each with its
  own enable toggle and volume **slider** (never percentage-button chips —
  see `src/components/Slider.tsx`).
- **Display** (desktop only) — fullscreen toggle and window size presets.
- Forms (`AgentForm.tsx`, `WeaponForm.tsx`) use `FormSheetLayout.tsx` to keep
  Save/Cancel pinned to the bottom of the sheet instead of requiring a
  scroll to reach them.

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

## Roadmap

- [x] Fix a startup flash where the ambient-music player could briefly act
      on default audio settings before the store's async `hydrate()` loaded
      the real persisted values (`AmbientMusicController.tsx` now no-ops
      until hydration completes)
- [x] **Responsive layout spacing** — replaced a fixed `maxWidth: 640` /
      flush-left content column (which left a dead gutter on wide desktop
      windows) with `src/utils/layoutMetrics.ts`, a pure, unit-tested
      function mapping window width to a content max-width/gutter across a
      few bands, plus centering the column instead of pinning it left. Bands
      are loosely anchored to Electron's compact/standard/large presets but
      apply continuously to any width — not a fixed reference canvas (that
      approach was considered earlier and rejected as too brittle).
- [x] **Motion polish** — replaced several instant-cut interactions with
      `react-native-reanimated` transitions: a measured, sliding active-tab
      indicator in `SegmentedTabs.tsx`; a fade for `ExpandableCard.tsx`'s
      body reveal and for agent/weapon list rows on filter/sort/add/delete;
      a press-scale on `Button.tsx`; and a scale+fade entrance for
      `ConfirmDialog.tsx`. All reuse the animation primitives already
      established elsewhere in the app (`Sheet.tsx`, `HeroPanel.tsx`) rather
      than introducing a second animation approach.
- [ ] Revisit mobile layout/spacing with the same responsive approach, since
      the two are related
- [ ] iOS build — deferred indefinitely (needs a Mac simulator or an Apple
      Developer account; not currently a priority)

*Last updated 2026-09-17.*
