/**
 * MapExperienceLayout
 *
 * Sticky search + category chips stay on top in both map and list modes.
 * Chrome insets / safe area are owned by MapLayout inside MapExperience.Root.
 * Carousel height / bottomOffset are SDK-dynamic (measure + theme) unless overridden.
 *
 * Onboarding + Wayfinding are always-mounted Chrome siblings (omit-by-not-mounting).
 * Credentials stay on Canvas; theme on Root / setCustomTheme. Directions opens via
 * NavBridge when PlaceSummaryCard omits onDirections — no host directionsOpen.
 */

import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  MapExperience,
  ListView,
  SearchBar,
  CategoryChips,
  GpsControlButton,
  FocusControl,
  PlaceSummaryCard,
  FloorChangeBanner,
  setCustomTheme,
  useAppTheme,
  useMapBridge,
  useNavBridgeOptional,
  isListMapToggleVisible,
  type PlaceItem,
} from '@twinmatrix/rn-ui-sdk';
import appConfig from '../../config/app.config';
import {renderRwsWelcome} from './RwsWelcome';
import {ALPHABET} from '../../data/mockPlaces';

/**
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

// Custom theme test code only
setCustomTheme('light', {
  components: {
    SearchBar: {styles: {field: {minHeight: 88}}},
    Chip: {styles: {label: {fontSize: 20}}},
  },
});

function MapChrome() {
  const theme = useAppTheme();
  const safeInsets = useSafeAreaInsets();
  const {selected, select} = useMapBridge();
  const nav = useNavBridgeOptional();
  const showListMapToggle = isListMapToggleVisible(nav?.phase);

  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    if (!showListMapToggle) {
      setListOpen(false);
    }
  }, [showListMapToggle]);

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
        onLoad={() => {
          console.log('map loaded');
        }}
        onLoadFail={(message: string) => {
          console.warn('map load failed', message);
        }}
      />

      <MapExperience.Chrome>
        {/*
          Only welcome is overridden here (RWS brand).
          Same pattern works for renderPrompt / renderFinding / renderOutside /
          renderError — omit those to keep portable SDK defaults.
        */}
        <MapExperience.Onboarding renderWelcome={renderRwsWelcome} />

        <MapExperience.Wayfinding />

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
                onPress: onSelectPlace,
              }}
              styles={{
                // Custom style override test code only
                results: {backgroundColor: 'skyblue'}, 
                field: {
                  borderCurve: 'continuous',
                  borderWidth: 2,
                  borderColor: 'skyblue',
                },
              }}
            />
            {/* categories/onPress omitted → PlaceCatalog what-taxonomies */}
            <CategoryChips/>
          </View>
        </MapExperience.TopRegion>

        {!listOpen ? (
          <MapExperience.ControlsRegion>
            <FocusControl />
            <GpsControlButton layout="stack" />
            {showListMapToggle && !listOpen ? (
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
            ) : null}
          </MapExperience.ControlsRegion>
        ) : null}

        <MapExperience.OverlayRegion>
          <FloorChangeBanner />
        </MapExperience.OverlayRegion>

        {/*
          Chrome sibling so the sheet snaps against the map, not OverlayRegion.
          Omit onDirections → NavBridge startRoutingForPlace.
          PlaceSummaryCard yields for the whole routing session (draft → arrived).
        */}
        {!listOpen && selected ? (
          <PlaceSummaryCard place={selected} />
        ) : null}

        {/*
          open is discover-side only; ListView.Carousel also yields during
          route preview/live (web startClicked equivalent).
        */}
        <ListView.Carousel
          open={!listOpen && !selected}
          onItemPress={onSelectPlace}
          onFavoritePress={(place, favorited) => {
            console.log('favorite', place.id, favorited);
          }}
        />

        <ListView.Browse
          open={listOpen}
          onClose={() => setListOpen(false)}
          onItemPress={onSelectPlace}
          alphabetLetters={ALPHABET}
          onLetterPress={letter => {
            console.log('jump to', letter);
          }}
        />
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
  buttonLabel: {
    fontWeight: '700',
  },
});
