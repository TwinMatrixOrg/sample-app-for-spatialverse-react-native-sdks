# Sample App — SpatialVerse React Native SDKs

Reference React Native host for:

- **`@twinmatrix/rn-ui-sdk`** — map experience layout, sheets, list overlay, widgets, theme
- **MetaAtlas RN map SDK** — map engine (vendored under `./sdk`, same pattern as `rn-u`)

This is the RN counterpart to `sample-app-for-spatialverse-web-sdks`.

## What this demo shows

- `MapExperience` shell with MetaAtlas always mounted in `Canvas`
- Top bar + search + `CategoryChips` + `SearchResultsList`
- `GpsControlButton` (presentation state sample)
- Bottom `Sheet` with `PlaceSummaryCard` + mock `RoutePreviewCard`
- `ListView` overlay with `ListingCard` (does not unmount the map)
- Adapter: MetaAtlas feature → `PlaceItem`

## Prerequisites

- Node.js 18+
- Android Studio / Xcode (for device or emulator)
- Sibling package built: [`twinmatrix-ui-sdk`](../twinmatrix-ui-sdk)
- JDK 17 at `~/.local/jdk-17` (or set `JAVA_HOME`). `npm run android` loads this via `scripts/with-android-env.sh`.
- Windows Android SDK at `C:\Users\hamza\AppData\Local\Android\Sdk` (WSL path used automatically)

## Install

```bash
# 1) Build the RN UI SDK
cd ../twinmatrix-ui-sdk
npm install
npm run build

# 2) Install this sample + MetaAtlas SDK deps
cd ../sample-app-for-spatialverse-react-native-sdks
npm install
cd sdk && npm install --legacy-peer-deps && cd ..
```

### MetaAtlas SDK (`./sdk`)

This repo includes a local copy of the MetaAtlas React Native SDK under `sdk/` (sourced from `external-system-mockup/rn-u/sdk`). Metro watches that folder and resolves its `node_modules`.

Update credentials in [`src/config/app.config.ts`](src/config/app.config.ts).

### iOS pods

```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

## Run

```bash
# Terminal 1 — Metro (binds 0.0.0.0 so the Windows emulator can reach it via adb reverse)
npm start

# Terminal 2 — build + install + launch (uses Linux SDK + Windows adb)
npm run android
```

`npm run android` builds with Gradle, then installs via `adb` (more reliable under WSL than Gradle’s device installer).

If the emulator can’t load JS, ensure Metro is up and run:

```bash
adb reverse tcp:8081 tcp:8081
```

### WSL notes

- JDK: `~/.local/jdk-17` (set by `scripts/with-android-env.sh`)
- Android SDK (Linux, for NDK/CMake): `~/Android/Sdk`
- Emulator / `adb`: Windows SDK under `/mnt/c/Users/hamza/AppData/Local/Android/Sdk`
## Project layout

```text
App.tsx
src/
  config/app.config.ts
  adapters/placeAdapter.ts
  data/mockPlaces.ts
  features/map-experience/MapExperienceLayout.tsx
sdk/                          # MetaAtlas RN map SDK
```

## Versions

Aligned with `external-system-mockup/rn-u`:

- `react` 19.1.0
- `react-native` 0.81.5
- `@maplibre/maplibre-react-native` 11.0.0-alpha.25

Plus RN UI SDK peers: Reanimated, Safe Area, Gorhom Bottom Sheet, FlashList, SVG, Zustand.

## Docs

- Hub: RN UI SDK (`for-rn-ui-developers`)
- Hub: React Native map SDK (`for-react-native-developers`)
