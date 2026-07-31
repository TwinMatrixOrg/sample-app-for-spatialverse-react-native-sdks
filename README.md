# Sample App — SpatialVerse React Native SDKs

Reference React Native host for:

- **`@twinmatrix/rn-ui-sdk`** — map experience layout, sheets, list overlay, widgets, theme
- **`@twinmatrix/spatialverse-sdk-rn`** — map engine

This is the RN counterpart to `sample-app-for-spatialverse-web-sdks`.

## What this demo shows

- `MapExperience` shell with MetaAtlas always mounted in `Canvas`
- **MapBridge** wires search, place lists, GPS, and selection to the map SDK
- Top bar + search + host-driven `CategoryChips` + bridged `SearchResultsList`
- `GpsControlButton` via MapBridge (enable / follow / off)
- Sticky search + `CategoryChips` in both map and list modes
- `FocusControl` floor rail (MetaAtlas focus tree) stacked with GPS in `ControlsRegion`
- Horizontal `ListView` carousel from `getAllMapObjects` + enrichment stub
- Vertical `ListView` browse overlay; map stays mounted under both overlays
- `PlaceSummaryCard` for map/list selection

## Prerequisites

- Node.js 18+
- Android Studio / Xcode (for device or emulator)
- JDK 17 at `~/.local/jdk-17` (or set `JAVA_HOME`). `npm run android` loads this via `scripts/with-android-env.sh`.
- Windows Android SDK at `C:\Users\hamza\AppData\Local\Android\Sdk` (WSL path used automatically)

## Install

```bash
npm install
```

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

## Project layout

```text
App.tsx
src/
  config/app.config.ts
  adapters/placeAdapter.ts
  data/mockPlaces.ts
  features/map-experience/MapExperienceLayout.tsx
```

## Versions

Aligned with `external-system-mockup/rn-u`:

- `react` 19.1.0
- `react-native` 0.81.5
- `@maplibre/maplibre-react-native` 11.0.0-alpha.25
- `@twinmatrix/rn-ui-sdk` 0.1.0
- `@twinmatrix/spatialverse-sdk-rn` 0.1.0

Plus RN UI SDK peers: Reanimated, Safe Area, Gorhom Bottom Sheet, FlashList, SVG, Zustand.

## Docs

- Hub: RN UI SDK (`for-rn-ui-developers`)
- Hub: React Native map SDK (`for-react-native-developers`)
