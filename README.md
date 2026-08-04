# Sample App — SpatialVerse React Native SDKs

Reference React Native host for:

- **`@twinmatrix/rn-ui-sdk`** — map experience layout, widgets, theme, MapBridge
- **`@twinmatrix/spatialverse-sdk-rn`** — MetaAtlas map engine

RN counterpart to [sample-app-for-spatialverse-web-sdks](https://github.com/TwinMatrixOrg/sample-app-for-spatialverse-web-sdks).

## What this demo shows

Convenient drop-in setup: pass MetaAtlas credentials to `MapExperience.Canvas`, then compose widgets. MapBridge (on by default) wires search, lists, GPS, floors, and selection — no manual `registerMap` / search plumbing in the host.

- Sticky `SearchBar` + `CategoryChips`
- `FocusControl` + `GpsControlButton` in `ControlsRegion`
- `ListView.Carousel` / `Browse` (map stays mounted)
- `PlaceSummaryCard` for the selected place

Matches the **Basic Setup — Embed in a Tab** example in the hub RN UI SDK docs (`for-rn-ui-developers`).

## Prerequisites

- Node.js 18+
- Android Studio and/or Xcode
- JDK 17 (`JAVA_HOME`)
- Android SDK + emulator or device (for Android)

## Install

```bash
npm install
```

Set MetaAtlas credentials in [`src/config/app.config.ts`](src/config/app.config.ts).

### iOS

```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

## Run

```bash
# Terminal 1
npm start

# Terminal 2
npm run android
# or
npm run ios
```

If the Android emulator cannot load the JS bundle:

```bash
adb reverse tcp:8081 tcp:8081
```

## Project layout

```text
App.tsx
src/
  config/app.config.ts
  features/map-experience/MapExperienceLayout.tsx
sdk/
  ui-sdk/   # @twinmatrix/rn-ui-sdk (local)
  map-sdk/  # @twinmatrix/spatialverse-sdk-rn (local)
```

## Docs

- Hub: RN UI SDK (`for-rn-ui-developers`)
- Hub: React Native map SDK (`for-react-native-developers`)
