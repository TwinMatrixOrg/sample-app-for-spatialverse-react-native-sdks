/**
 * MapExperienceLayout
 *
 * Sticky search + category chips stay on top in both map and list modes.
 * Chrome insets / safe area are owned by MapLayout inside MapExperience.Root.
 * Carousel height / bottomOffset are SDK-dynamic (measure + theme) unless overridden.
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  MapExperience,
  ListView,
  SearchBar,
  CategoryChips,
  GpsControlButton,
  FocusControl,
  PlaceSummaryCard,
  setCustomTheme,
  useAppTheme,
  useMapBridge,
  type PlaceItem,
} from '@twinmatrix/rn-ui-sdk';
import {
  LocationType,
  NavigationStartError,
  RouteMode,
  type CoordinateLocation,
  type GPSPosition,
  type MetaAtlasSDKHandle,
  type NavigationUIHandlers,
} from '@twinmatrix/spatialverse-sdk-rn';
import appConfig from '../../config/app.config';
import {ALPHABET} from '../../data/mockPlaces';

/**
 * Phase 1 theme test overrides — exaggerate spacing/type so token wiring is obvious.
 *
 * Font note: the UI SDK does **not** load `.ttf` / `.otf` files. It only sets
 * `Text` `fontFamily` to the string you pass here. The **host app** must link
 * custom fonts first; until then, use a platform system face for a visible test.
 *
 * Custom font later:
 *   1. Put files in e.g. `assets/fonts/Inter-Regular.ttf`
 *   2. Add `react-native.config.js` → `assets: ['./assets/fonts']`
 *   3. `npx react-native-asset` (or rebuild native) so Android/iOS pick them up
 *   4. Pass the **postscript / family name** RN expects, e.g.
 *      `typography: { fontFamily: { sans: 'Inter' } }`
 *      (Android often needs the file-stem name; iOS the font's PostScript name)
 */
// setCustomTheme('light', {
//   accent: {primary: '#0B7A75', secondary: '#6D5AD0'},
//   surface: {topbar: '#FFFFFF', sheet: '#FFFFFF'},
//   spacing: {md: 20, sm: 12, lg: 24},
//   radius: {md: 20, lg: 24},
//   typography: {
//     // System face — SearchBar / chips / list titles should look mono after reload.
//     // Swap to your linked custom name when ready, e.g. { sans: 'Inter' }.
//     fontFamily: PHASE1_TEST_FONT ? {sans: PHASE1_TEST_FONT} : undefined,
//     sizes: {md: 15, lg: 18, xl: 20},
//   },
// });

setCustomTheme('light', {
  components: {
    SearchBar: { styles: { field: { minHeight: 88 } } },
    Chip: { styles: { label: { fontSize: 20 } } },
  },
});

const SAMPLE_DEAD_ZONE_DELTA = 0.00012;

type HarnessStatus = {
  kind: 'idle' | 'success' | 'error' | 'info';
  title: string;
  detail?: string;
};

type ProgressState = {
  remainingDistance?: number;
  remainingTime?: number;
  segmentRemainingDistance?: number;
};

function formatCoord(value?: number): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(6)
    : 'n/a';
}

function formatMeters(value?: number): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value.toFixed(1)} m`
    : 'n/a';
}

function formatSeconds(value?: number): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value.toFixed(0)} s`
    : 'n/a';
}

function coerceNumber(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function summarizeError(error: unknown): {title: string; detail: string} {
  if (error instanceof NavigationStartError) {
    return {
      title: `${error.code} (${error.mode})`,
      detail: error.message,
    };
  }
  if (error instanceof Error) {
    return {
      title: error.name || 'Error',
      detail: error.message,
    };
  }
  return {
    title: 'Unknown error',
    detail: String(error),
  };
}

function buildSampleDeadZone(
  center: [number, number],
  whereDimension?: string,
) {
  const [lng, lat] = center;
  return {
    id: `sample-zone-${Date.now()}`,
    whereDimension: whereDimension ?? null,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[
        [lng - SAMPLE_DEAD_ZONE_DELTA, lat - SAMPLE_DEAD_ZONE_DELTA],
        [lng + SAMPLE_DEAD_ZONE_DELTA, lat - SAMPLE_DEAD_ZONE_DELTA],
        [lng + SAMPLE_DEAD_ZONE_DELTA, lat + SAMPLE_DEAD_ZONE_DELTA],
        [lng - SAMPLE_DEAD_ZONE_DELTA, lat + SAMPLE_DEAD_ZONE_DELTA],
        [lng - SAMPLE_DEAD_ZONE_DELTA, lat - SAMPLE_DEAD_ZONE_DELTA],
      ]],
    },
  };
}

function ThrowawayNavHarness({
  sdkRef,
  sdkHandle,
  onClose,
}: {
  sdkRef: React.MutableRefObject<MetaAtlasSDKHandle | null>;
  sdkHandle: MetaAtlasSDKHandle | null;
  onClose?: () => void;
}) {
  const theme = useAppTheme();
  const {
    selected,
    selectedFocusLevel,
    focusLevels,
  } = useMapBridge();
  const [expanded, setExpanded] = useState(false);
  const [routeMode, setRouteMode] = useState<RouteMode>(RouteMode.WithinTerminal);
  const [startWhereDimension, setStartWhereDimension] = useState('');
  const [useInternalGps, setUseInternalGps] = useState(true);
  const [pdrAllowed, setPdrAllowed] = useState(true);
  const [deadZoneVisible, setDeadZoneVisible] = useState(false);
  const [locMode, setLocMode] = useState('idle');
  const [overlayState, setOverlayState] = useState(
    'hidden | mode=n/a | deadZone=n/a',
  );
  const [progress, setProgress] = useState<ProgressState>({});
  const [status, setStatus] = useState<HarnessStatus>({
    kind: 'info',
    title: 'Throwaway QA harness',
    detail: 'Select a place, confirm the start floor, then run start* or debug actions.',
  });
  const [debugSnapshot, setDebugSnapshot] = useState('n/a');
  const [destinationLng, setDestinationLng] = useState('');
  const [destinationLat, setDestinationLat] = useState('');
  const [destinationWhereDimension, setDestinationWhereDimension] = useState('');
  const [syntheticLng, setSyntheticLng] = useState('');
  const [syntheticLat, setSyntheticLat] = useState('');
  const [syntheticAccuracy, setSyntheticAccuracy] = useState('5');
  const [syntheticHeading, setSyntheticHeading] = useState('0');
  const [syntheticSpeed, setSyntheticSpeed] = useState('0');

  useEffect(() => {
    const preferredFloor =
      selectedFocusLevel?.id ?? selected?.whereDimension ?? focusLevels[0]?.id ?? '';
    setStartWhereDimension(current => current || preferredFloor);
  }, [focusLevels, selected?.whereDimension, selectedFocusLevel?.id]);

  useEffect(() => {
    if (!selected?.coordinates) {
      return;
    }
    setDestinationLng(current => current || String(selected.coordinates?.[0] ?? ''));
    setDestinationLat(current => current || String(selected.coordinates?.[1] ?? ''));
    setDestinationWhereDimension(current => current || selected.whereDimension || '');
  }, [selected]);

  useEffect(() => {
    const sdk = sdkHandle;
    sdk?.onLocModeDebug?.(mode => {
      setLocMode(mode);
    });
    sdk?.onDeadZoneOverlayDebug?.(payload => {
      setOverlayState(
        `${payload.visible ? 'visible' : 'hidden'} | mode=${payload.mode ?? 'n/a'} | deadZone=${payload.deadZoneId ?? 'n/a'}`,
      );
    });
  }, [sdkHandle]);

  const withSdk = useCallback(
    <T,>(action: (sdk: MetaAtlasSDKHandle) => T): T | null => {
      const sdk = sdkRef.current;
      if (!sdk) {
        setStatus({
          kind: 'error',
          title: 'Map ref unavailable',
          detail: 'Wait for the map to finish loading before using the harness.',
        });
        return null;
      }
      return action(sdk);
    },
    [sdkRef],
  );

  const makeHandlers = useCallback((): NavigationUIHandlers => ({
    onProgressUpdate: data => {
      setProgress({
        remainingDistance: data.remainingDistance,
        remainingTime: data.remainingTime,
        segmentRemainingDistance: data.segmentRemainingDistance,
      });
    },
    onNavigationComplete: () => {
      setStatus({
        kind: 'success',
        title: 'Navigation complete',
        detail: 'The engine reported arrival.',
      });
    },
    onReroute: route => {
      setStatus({
        kind: 'info',
        title: 'Reroute triggered',
        detail: `${route.segments?.length ?? 0} segment(s) in the refreshed route.`,
      });
    },
    onLocModeChange: (mode, deadZoneId) => {
      setLocMode(mode);
      setStatus({
        kind: 'info',
        title: `Loc-mode changed to ${mode}`,
        detail: deadZoneId ? `Dead zone: ${deadZoneId}` : 'No active dead zone.',
      });
    },
    onSnap: payload => {
      setDebugSnapshot(JSON.stringify(payload ?? null, null, 2));
    },
  }), []);

  const applyRouteMode = useCallback(() => {
    return withSdk(sdk => {
      sdk.setRoutingMode(routeMode);
    });
  }, [routeMode, withSdk]);

  const startToPlace = useCallback(async () => {
    if (!selected) {
      setStatus({
        kind: 'error',
        title: 'Select a destination first',
        detail: 'Pick a map object from search, the map, or the browse list.',
      });
      return;
    }
    applyRouteMode();
    const sdk = sdkRef.current;
    if (!sdk) {
      return;
    }
    try {
      const route = await sdk.startNavigation(
        selected.id,
        undefined,
        makeHandlers(),
        {
          userWhereDimension: startWhereDimension.trim(),
          useInternalGPS: useInternalGps,
        },
      );
      setStatus({
        kind: 'success',
        title: 'startNavigation succeeded',
        detail: `${route.segments?.length ?? 0} segment(s) returned for ${selected.name}.`,
      });
    } catch (error) {
      const summary = summarizeError(error);
      setStatus({
        kind: 'error',
        title: summary.title,
        detail: summary.detail,
      });
    }
  }, [
    applyRouteMode,
    makeHandlers,
    sdkRef,
    selected,
    startWhereDimension,
    useInternalGps,
  ]);

  const startToCoordinates = useCallback(async () => {
    const lng = coerceNumber(destinationLng);
    const lat = coerceNumber(destinationLat);
    const whereDimension = destinationWhereDimension.trim();
    if (lng == null || lat == null || !whereDimension) {
      setStatus({
        kind: 'error',
        title: 'Coordinate destination is incomplete',
        detail: 'Provide destination lng, lat, and destination floor before using startNavigationFromCoordinates.',
      });
      return;
    }
    applyRouteMode();
    const sdk = sdkRef.current;
    if (!sdk) {
      return;
    }
    const endLocation: CoordinateLocation = {
      type: LocationType.Coordinate,
      coordinates: [lng, lat],
      whereDimension,
    };
    try {
      const route = await sdk.startNavigationFromCoordinates(
        endLocation,
        undefined,
        makeHandlers(),
        {
          startWhereDimension: startWhereDimension.trim(),
          useInternalGPS: useInternalGps,
        },
      );
      setStatus({
        kind: 'success',
        title: 'startNavigationFromCoordinates succeeded',
        detail: `${route.segments?.length ?? 0} segment(s) returned for [lng, lat] destination.`,
      });
    } catch (error) {
      const summary = summarizeError(error);
      setStatus({
        kind: 'error',
        title: summary.title,
        detail: summary.detail,
      });
    }
  }, [
    applyRouteMode,
    destinationLat,
    destinationLng,
    destinationWhereDimension,
    makeHandlers,
    sdkRef,
    startWhereDimension,
    useInternalGps,
  ]);

  const stopNavigation = useCallback(() => {
    withSdk(sdk => {
      sdk.stopNavigation();
      setStatus({
        kind: 'info',
        title: 'Navigation stopped',
        detail: 'Normal GPS mode should be restored by the SDK.',
      });
    });
  }, [withSdk]);

  const recenterCamera = useCallback(() => {
    withSdk(async sdk => {
      await sdk.recenterCamera?.();
      setStatus({
        kind: 'info',
        title: 'Recenter requested',
        detail: 'During nav this should follow the engine; otherwise it should follow GPS.',
      });
    });
  }, [withSdk]);

  const configureSampleDeadZone = useCallback(() => {
    const center = selected?.coordinates;
    if (!center) {
      setStatus({
        kind: 'error',
        title: 'No coordinates available for dead-zone sample',
        detail: 'Select a place with coordinates first.',
      });
      return;
    }
    withSdk(sdk => {
      sdk.configureNavigationPdr({
        deadZones: [
          buildSampleDeadZone(center, selected.whereDimension ?? startWhereDimension),
        ],
      });
      setStatus({
        kind: 'success',
        title: 'Sample dead-zone configured',
        detail: 'The inline polygon is centered on the selected destination for QA only.',
      });
    });
  }, [selected, startWhereDimension, withSdk]);

  const clearDeadZones = useCallback(() => {
    withSdk(sdk => {
      sdk.configureNavigationPdr({deadZones: []});
      setStatus({
        kind: 'info',
        title: 'Dead-zone config cleared',
        detail: 'The debug dead-zone list is now empty.',
      });
    });
  }, [withSdk]);

  const togglePdrAllowed = useCallback(() => {
    const next = !pdrAllowed;
    withSdk(sdk => {
      sdk.setPdrNavigationAllowed(next);
      setPdrAllowed(next);
      setStatus({
        kind: 'info',
        title: `PDR ${next ? 'enabled' : 'blocked'}`,
        detail: 'This toggle is debug-only and should not be treated as product UI.',
      });
    });
  }, [pdrAllowed, withSdk]);

  const toggleDeadZoneOverlay = useCallback(() => {
    const next = !deadZoneVisible;
    withSdk(sdk => {
      sdk.setNavigationDeadZoneDebugVisible(next);
      setDeadZoneVisible(next);
      setStatus({
        kind: 'info',
        title: `Dead-zone overlay ${next ? 'shown' : 'hidden'}`,
        detail: 'Use this with the sample dead-zone polygon to verify QA overlays quickly.',
      });
    });
  }, [deadZoneVisible, withSdk]);

  const loadSyntheticFromSelection = useCallback(() => {
    if (!selected?.coordinates) {
      setStatus({
        kind: 'error',
        title: 'Selected place has no coordinates',
        detail: 'Pick a destination with coordinates before copying into the synthetic GPS form.',
      });
      return;
    }
    setSyntheticLng(String(selected.coordinates[0]));
    setSyntheticLat(String(selected.coordinates[1]));
    setStatus({
      kind: 'info',
      title: 'Synthetic GPS seed copied',
      detail: 'The form now contains the selected place coordinates in [lng, lat] order.',
    });
  }, [selected]);

  const loadCoordinateDestinationFromSelection = useCallback(() => {
    if (!selected?.coordinates || !selected.whereDimension) {
      setStatus({
        kind: 'error',
        title: 'Selected place cannot seed coordinate destination',
        detail: 'Pick a place with both coordinates and a destination floor first.',
      });
      return;
    }
    setDestinationLng(String(selected.coordinates[0]));
    setDestinationLat(String(selected.coordinates[1]));
    setDestinationWhereDimension(selected.whereDimension);
    setStatus({
      kind: 'info',
      title: 'Coordinate destination seeded',
      detail: 'Destination lng, lat, and floor were copied from the selected place.',
    });
  }, [selected]);

  const emitSyntheticGps = useCallback(() => {
    const lng = coerceNumber(syntheticLng);
    const lat = coerceNumber(syntheticLat);
    const accuracy = coerceNumber(syntheticAccuracy);
    const heading = coerceNumber(syntheticHeading);
    const speed = coerceNumber(syntheticSpeed);
    if (lng == null || lat == null || accuracy == null) {
      setStatus({
        kind: 'error',
        title: 'Synthetic GPS values are invalid',
        detail: 'Lng, lat, and accuracy must be valid numbers.',
      });
      return;
    }
    const sample: GPSPosition = {
      coordinates: [lng, lat],
      accuracy,
      timestamp: Date.now(),
      heading: heading ?? undefined,
      speed: speed ?? undefined,
    };
    withSdk(sdk => {
      sdk.emitSyntheticGpsSampleForTesting(sample);
      setStatus({
        kind: 'success',
        title: 'Synthetic GPS emitted',
        detail: `Sent [${formatCoord(lng)}, ${formatCoord(lat)}] with accuracy ${accuracy.toFixed(1)} m.`,
      });
    });
  }, [
    syntheticAccuracy,
    syntheticHeading,
    syntheticLat,
    syntheticLng,
    syntheticSpeed,
    withSdk,
  ]);

  const captureDebugSnapshot = useCallback(() => {
    withSdk(sdk => {
      const snapshot = sdk.getRouteFollowingDebug();
      setDebugSnapshot(JSON.stringify(snapshot ?? null, null, 2));
      setStatus({
        kind: 'info',
        title: 'Debug snapshot refreshed',
        detail: 'Route-following debug JSON was captured from the imperative ref.',
      });
    });
  }, [withSdk]);

  const handleStartToPlacePress = useCallback(() => {
    startToPlace().catch(error => {
      const summary = summarizeError(error);
      setStatus({
        kind: 'error',
        title: summary.title,
        detail: summary.detail,
      });
    });
  }, [startToPlace]);

  const handleStartToCoordinatesPress = useCallback(() => {
    startToCoordinates().catch(error => {
      const summary = summarizeError(error);
      setStatus({
        kind: 'error',
        title: summary.title,
        detail: summary.detail,
      });
    });
  }, [startToCoordinates]);

  const statusColors =
    status.kind === 'error'
      ? {background: '#fef2f2', border: '#fca5a5', text: '#991b1b'}
      : status.kind === 'success'
        ? {background: '#ecfdf5', border: '#86efac', text: '#166534'}
        : {background: '#eff6ff', border: '#93c5fd', text: '#1d4ed8'};

  return (
    <MapExperience.BottomRegion>
      <View
        style={[
          styles.harnessCard,
          expanded && styles.harnessCardExpanded,
          {
            backgroundColor: theme.surface.sheet,
            borderColor: theme.border.subtle,
          },
        ]}
      >
        <View style={styles.inlineRow}>
          <Pressable
            onPress={handleStartToPlacePress}
            style={[styles.primaryButton, {backgroundColor: theme.accent.primary}]}
          >
            <Text style={styles.primaryButtonText}>startNavigation</Text>
          </Pressable>
          <Pressable
            onPress={stopNavigation}
            style={[
              styles.smallButton,
              {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
            ]}
          >
            <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>stopNavigation</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse debug controls' : 'Expand debug controls'}
            onPress={() => setExpanded(prev => !prev)}
            style={[
              styles.smallButton,
              {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
            ]}
          >
            <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
              {expanded ? 'Collapse' : 'Expand'}
            </Text>
          </Pressable>
          {onClose ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close directions"
              onPress={onClose}
              style={[
                styles.smallButton,
                {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
              ]}
            >
              <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>Back</Text>
            </Pressable>
          ) : null}
        </View>

        {expanded ? (
          <>
        <Text style={[styles.harnessEyebrow, {color: theme.semantic.warning}]}>
          Throwaway QA Harness
        </Text>
        <Text style={[styles.harnessTitle, {color: theme.text.primary}]}>
          Device-only nav debug chrome. Delete when real nav UI lands.
        </Text>
        <Text style={[styles.harnessSubtle, {color: theme.text.muted}]}>
          This is intentionally not product chrome and not a NavBridge.
        </Text>

        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: statusColors.background,
              borderColor: statusColors.border,
            },
          ]}
        >
          <Text style={[styles.statusTitle, {color: statusColors.text}]}>
            {status.title}
          </Text>
          {status.detail ? (
            <Text style={[styles.statusDetail, {color: statusColors.text}]}>
              {status.detail}
            </Text>
          ) : null}
        </View>

        <ScrollView style={styles.harnessScroll} contentContainerStyle={styles.harnessContent}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text.primary}]}>
              Destination
            </Text>
            <Text style={[styles.detailLine, {color: theme.text.primary}]}>
              Selected: {selected?.name ?? 'none'}
            </Text>
            <Text style={[styles.detailLine, {color: theme.text.muted}]}>
              Map object id: {selected?.id ?? 'n/a'}
            </Text>
            <Text style={[styles.detailLine, {color: theme.text.muted}]}>
              Destination floor: {selected?.whereDimension ?? 'n/a'}
            </Text>
            <Text style={[styles.detailLine, {color: theme.text.muted}]}>
              Destination coords [lng, lat]: {formatCoord(selected?.coordinates?.[0])},{' '}
              {formatCoord(selected?.coordinates?.[1])}
            </Text>
            <Text style={[styles.inputLabel, {color: theme.text.muted}]}>
              Coordinate destination override
            </Text>
            <View style={styles.inputGrid}>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                value={destinationLng}
                onChangeText={setDestinationLng}
                placeholder="dest lng"
                placeholderTextColor={theme.text.muted}
                style={[
                  styles.input,
                  styles.gridInput,
                  {
                    color: theme.text.primary,
                    borderColor: theme.border.subtle,
                    backgroundColor: theme.surface.card,
                  },
                ]}
              />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                value={destinationLat}
                onChangeText={setDestinationLat}
                placeholder="dest lat"
                placeholderTextColor={theme.text.muted}
                style={[
                  styles.input,
                  styles.gridInput,
                  {
                    color: theme.text.primary,
                    borderColor: theme.border.subtle,
                    backgroundColor: theme.surface.card,
                  },
                ]}
              />
            </View>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              value={destinationWhereDimension}
              onChangeText={setDestinationWhereDimension}
              placeholder="destination whereDimension"
              placeholderTextColor={theme.text.muted}
              style={[
                styles.input,
                {
                  color: theme.text.primary,
                  borderColor: theme.border.subtle,
                  backgroundColor: theme.surface.card,
                },
              ]}
            />
            <Pressable
              onPress={loadCoordinateDestinationFromSelection}
              style={[
                styles.smallButton,
                {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
              ]}
            >
              <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
                Copy selected destination
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text.primary}]}>
              Live Start
            </Text>
            <Text style={[styles.inputLabel, {color: theme.text.muted}]}>
              Required host start floor
            </Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              value={startWhereDimension}
              onChangeText={setStartWhereDimension}
              placeholder="where.example.building.floor"
              placeholderTextColor={theme.text.muted}
              style={[
                styles.input,
                {
                  color: theme.text.primary,
                  borderColor: theme.border.subtle,
                  backgroundColor: theme.surface.card,
                },
              ]}
            />
            <View style={styles.inlineRow}>
              <Pressable
                onPress={() => setStartWhereDimension(selectedFocusLevel?.id ?? '')}
                style={[
                  styles.smallButton,
                  {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
                ]}
              >
                <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
                  Use selected floor
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setUseInternalGps(prev => !prev)}
                style={[
                  styles.smallButton,
                  {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
                ]}
              >
                <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
                  Internal GPS: {useInternalGps ? 'on' : 'off'}
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, {color: theme.text.muted}]}>
              Route mode
            </Text>
            <View style={styles.inlineRowWrap}>
              {[
                RouteMode.WithinTerminal,
                RouteMode.ToTerminal,
                RouteMode.FromTerminal,
                RouteMode.Airside,
              ].map(mode => {
                const active = routeMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setRouteMode(mode)}
                    style={[
                      styles.modeButton,
                      {
                        backgroundColor: active ? theme.accent.primary : theme.surface.card,
                        borderColor: active ? theme.accent.primary : theme.border.subtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.buttonLabel,
                        {
                          color: active ? theme.text.onAccent : theme.text.primary,
                        },
                      ]}
                    >
                      {mode}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.inlineRowWrap}>
              <Pressable
                onPress={handleStartToCoordinatesPress}
                style={[styles.primaryButton, {backgroundColor: theme.accent.secondary}]}
              >
                <Text style={styles.primaryButtonText}>
                  startNavigationFromCoordinates
                </Text>
              </Pressable>
              <Pressable
                onPress={recenterCamera}
                style={[
                  styles.smallButton,
                  {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
                ]}
              >
                <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>recenterCamera</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text.primary}]}>
              Debug PDR / Overlay
            </Text>
            <View style={styles.inlineRow}>
              <Pressable
                onPress={togglePdrAllowed}
                style={[
                  styles.smallButton,
                  {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
                ]}
              >
                <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
                  PDR allowed: {pdrAllowed ? 'yes' : 'no'}
                </Text>
              </Pressable>
              <Pressable
                onPress={toggleDeadZoneOverlay}
                style={[
                  styles.smallButton,
                  {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
                ]}
              >
                <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
                  Overlay: {deadZoneVisible ? 'visible' : 'hidden'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inlineRow}>
              <Pressable
                onPress={configureSampleDeadZone}
                style={[
                  styles.smallButton,
                  {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
                ]}
              >
                <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
                  Configure sample dead zone
                </Text>
              </Pressable>
              <Pressable
                onPress={clearDeadZones}
                style={[
                  styles.smallButton,
                  {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
                ]}
              >
                <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
                  Clear dead zones
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.detailLine, {color: theme.text.primary}]}>
              Loc-mode: {locMode}
            </Text>
            <Text style={[styles.detailLine, {color: theme.text.muted}]}>
              Overlay callback: {overlayState}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text.primary}]}>
              Synthetic GPS
            </Text>
            <Text style={[styles.harnessSubtle, {color: theme.text.muted}]}>
              Public coordinate order stays [lng, lat].
            </Text>
            <View style={styles.inputGrid}>
              <TextInput
                value={syntheticLng}
                onChangeText={setSyntheticLng}
                placeholder="lng"
                placeholderTextColor={theme.text.muted}
                style={[
                  styles.input,
                  styles.gridInput,
                  {
                    color: theme.text.primary,
                    borderColor: theme.border.subtle,
                    backgroundColor: theme.surface.card,
                  },
                ]}
              />
              <TextInput
                value={syntheticLat}
                onChangeText={setSyntheticLat}
                placeholder="lat"
                placeholderTextColor={theme.text.muted}
                style={[
                  styles.input,
                  styles.gridInput,
                  {
                    color: theme.text.primary,
                    borderColor: theme.border.subtle,
                    backgroundColor: theme.surface.card,
                  },
                ]}
              />
              <TextInput
                value={syntheticAccuracy}
                onChangeText={setSyntheticAccuracy}
                placeholder="accuracy m"
                placeholderTextColor={theme.text.muted}
                style={[
                  styles.input,
                  styles.gridInput,
                  {
                    color: theme.text.primary,
                    borderColor: theme.border.subtle,
                    backgroundColor: theme.surface.card,
                  },
                ]}
              />
              <TextInput
                value={syntheticHeading}
                onChangeText={setSyntheticHeading}
                placeholder="heading"
                placeholderTextColor={theme.text.muted}
                style={[
                  styles.input,
                  styles.gridInput,
                  {
                    color: theme.text.primary,
                    borderColor: theme.border.subtle,
                    backgroundColor: theme.surface.card,
                  },
                ]}
              />
              <TextInput
                value={syntheticSpeed}
                onChangeText={setSyntheticSpeed}
                placeholder="speed"
                placeholderTextColor={theme.text.muted}
                style={[
                  styles.input,
                  styles.gridInput,
                  {
                    color: theme.text.primary,
                    borderColor: theme.border.subtle,
                    backgroundColor: theme.surface.card,
                  },
                ]}
              />
            </View>
            <View style={styles.inlineRow}>
              <Pressable
                onPress={loadSyntheticFromSelection}
                style={[
                  styles.smallButton,
                  {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
                ]}
              >
                <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
                  Copy selected coords
                </Text>
              </Pressable>
              <Pressable
                onPress={emitSyntheticGps}
                style={[styles.primaryButton, {backgroundColor: theme.accent.primary}]}
              >
                <Text style={styles.primaryButtonText}>Emit synthetic GPS</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text.primary}]}>
              Runtime Readout
            </Text>
            <Text style={[styles.detailLine, {color: theme.text.primary}]}>
              Remaining distance: {formatMeters(progress.remainingDistance)}
            </Text>
            <Text style={[styles.detailLine, {color: theme.text.primary}]}>
              Segment remaining: {formatMeters(progress.segmentRemainingDistance)}
            </Text>
            <Text style={[styles.detailLine, {color: theme.text.primary}]}>
              Remaining time: {formatSeconds(progress.remainingTime)}
            </Text>
            <Pressable
              onPress={captureDebugSnapshot}
              style={[
                styles.smallButton,
                {backgroundColor: theme.surface.card, borderColor: theme.border.subtle},
              ]}
            >
              <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
                Refresh route-following debug
              </Text>
            </Pressable>
            <ScrollView
              horizontal
              style={[
                styles.debugBox,
                {
                  backgroundColor: theme.surface.card,
                  borderColor: theme.border.subtle,
                },
              ]}
            >
              <Text style={[styles.debugText, {color: theme.text.primary}]}>
                {debugSnapshot}
              </Text>
            </ScrollView>
          </View>
        </ScrollView>
          </>
        ) : null}
      </View>
    </MapExperience.BottomRegion>
  );
}

function MapChrome() {
  const theme = useAppTheme();
  const safeInsets = useSafeAreaInsets();
  const sdkRef = useRef<MetaAtlasSDKHandle | null>(null);
  const [sdkHandle, setSdkHandle] = useState<MetaAtlasSDKHandle | null>(null);
  const pendingRef = useRef(false);
  useEffect(() => {
    if (pendingRef.current) {
      pendingRef.current = false;
      setSdkHandle(sdkRef.current);
    }
  });
  const handleMapRefChange = useCallback((instance: MetaAtlasSDKHandle | null) => {
    if (sdkRef.current !== instance) {
      sdkRef.current = instance;
      pendingRef.current = true;
    }
  }, []);
  const {selected, select, onPlaceSelect, onPlaceDeselect} = useMapBridge();

  const [listOpen, setListOpen] = useState(false);
  const [directionsOpen, setDirectionsOpen] = useState(false);

  useEffect(() => {
    setDirectionsOpen(false);
  }, [selected?.id]);

  useEffect(() => {
    const offSelect = onPlaceSelect(place => {
      console.log('place selected', place.id);
    });
    const offDeselect = onPlaceDeselect(() => {
      console.log('place deselected');
    });
    return () => {
      offSelect();
      offDeselect();
    };
  }, [onPlaceSelect, onPlaceDeselect]);

  // Run custom logic on place select here.
  // Providing onItemPress fully replaces the SDK default (MapBridge.select).
  const onSelectPlace = useCallback(
    (place: PlaceItem) => {
      select(place);
      setListOpen(false);
    },
    [select],
  );

  return (
    <>
      <MapExperience.Canvas
        tileserverRoleName={appConfig.metaAtlas.role}
        accessToken={appConfig.metaAtlas.accessToken}
        secretKey={appConfig.metaAtlas.secretKey}
        onMapRefChange={handleMapRefChange}
        onLoad={() => {
          console.log('map loaded');
        }}
        onLoadFail={(message: string) => {
          console.warn('map load failed', message);
        }}
      />

      <MapExperience.Chrome>
        <MapExperience.TopRegion>
          <View
            style={[
              styles.stickyHeader,
              {
                paddingTop: safeInsets.top + 8,
                backgroundColor: theme.surface.topbar,
                borderBottomColor: theme.border.subtle,
              },
            ]}
          >
            <SearchBar
              showResults={!listOpen}
              resultsProps={{
                onItemPress: onSelectPlace,
              }}
            />
            {/* items/onItemPress omitted → PlaceCatalog what-taxonomies */}
            <CategoryChips />
          </View>
        </MapExperience.TopRegion>

        {!listOpen ? (
          <MapExperience.ControlsRegion>
            <FocusControl />
            <GpsControlButton layout="stack" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open list view"
              onPress={() => setListOpen(true)}
              style={[
                styles.listToggle,
                {
                  backgroundColor: theme.surface.card,
                  borderColor: theme.border.subtle,
                },
              ]}
            >
              <Text style={[styles.buttonLabel, {color: theme.text.primary}]}>
                List
              </Text>
            </Pressable>
          </MapExperience.ControlsRegion>
        ) : null}

        {!listOpen && selected && !directionsOpen ? (
          <MapExperience.OverlayRegion>
            {/* Close always clears selection via MapBridge.select(null) */}
            <PlaceSummaryCard
              place={selected}
              onDirections={() => setDirectionsOpen(true)}
            />
          </MapExperience.OverlayRegion>
        ) : null}

        {/* <ListView.Carousel
          open={!listOpen && !selected}
          onItemPress={onSelectPlace}
          onFavoritePress={(place, favorited) => {
            console.log('favorite', place.id, favorited);
          }}
        /> */}

        {/* <ListView.Browse
          open={listOpen}
          onClose={() => setListOpen(false)}
          onItemPress={onSelectPlace}
          alphabetLetters={ALPHABET}
          onLetterPress={letter => {
            console.log('jump to', letter);
          }}
        /> */}

        {directionsOpen ? (
          <ThrowawayNavHarness
            sdkRef={sdkRef}
            sdkHandle={sdkHandle}
            onClose={() => setDirectionsOpen(false)}
          />
        ) : null}
      </MapExperience.Chrome>
    </>
  );
}

export default function MapExperienceLayout() {
  return (
    <MapExperience.Root themeMode="light">
      <MapChrome />
    </MapExperience.Root>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  canvas: {
    flex: 1,
  },
  listToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  harnessCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  harnessCardExpanded: {
    maxHeight: 360,
  },
  harnessEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  harnessTitle: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
  },
  harnessSubtle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
  harnessScroll: {
    marginTop: 12,
  },
  harnessContent: {
    gap: 16,
    paddingBottom: 4,
  },
  statusBanner: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusDetail: {
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  detailLine: {
    fontSize: 12,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  inlineRowWrap: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  smallButton: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  modeButton: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  primaryButton: {
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  buttonLabel: {
    fontWeight: '700',
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridInput: {
    minWidth: 88,
    flexGrow: 1,
  },
  debugBox: {
    marginTop: 4,
    maxHeight: 120,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  debugText: {
    fontSize: 11,
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
  },
});
