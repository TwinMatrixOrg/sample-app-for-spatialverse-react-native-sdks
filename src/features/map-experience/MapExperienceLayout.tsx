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
  type PlaceItem,
} from '@twinmatrix/rn-ui-sdk';
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
    SearchBar: {styles: {field: {minHeight: 88}}},
    Chip: {styles: {label: {fontSize: 20}}},
  },
});

/** Exact RWS web welcome / onboarding copy (sample host props — not SDK defaults). */
const RWS_ONBOARDING = {
  welcomeTitle: 'Welcome to\nResorts World Sentosa',
  welcomeContinueLabel: 'Continue',
  welcomeAllowLocationLabel: 'Allow using my location',
  promptTitle: 'Find your way',
  promptDescription: 'To get started, tap below to find your location',
  promptGpsAlreadyOnDescription:
    'Your location is already active. Tap to re-center the map on your position.',
  promptFindLabel: 'Find my location',
  promptRecenterLabel: 'Re-center on location',
  continueWithoutLabel: 'Continue without location',
  outsideTitle: 'Find your way',
  outsideMessage: 'Your Location is not in Resorts World Sentosa',
  outsideDetail:
    'Move inside Resorts World Sentosa or VivoCity to use in-venue navigation, or continue without location.',
  errorTitle: 'Location unavailable',
  findingLabel: 'Finding your location',
  floorConfirmTitle: 'Which floor in RWS are you on?',
  floorConfirmSubtitle:
    'Tap your floor. Labels use your GPS against venue zones when location is on.',
  floorConfirmLabel: 'OK',
} as const;

function RwsWelcomeBody() {
  const theme = useAppTheme();
  const paragraph = {
    color: theme.text.primary,
    textAlign: 'center' as const,
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  };
  return (
    <View style={{gap: theme.spacing.sm, marginBottom: theme.spacing.md}}>
      <Text style={paragraph}>
        This Digital Wayfinding App is currently in a test (beta) phase and may
        have limitations.
      </Text>
      <Text style={paragraph}>
        Thank you for helping us improve the experience.
      </Text>
    </View>
  );
}

function RwsWelcomeTerms() {
  const theme = useAppTheme();
  return (
    <Text
      style={{
        color: theme.text.primary,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: theme.spacing.md,
      }}
    >
      By clicking "Continue", you acknowledge and agree to our{' '}
      <Text style={{color: theme.accent.secondary, fontWeight: '600'}}>
        Terms of Use
      </Text>
      .
    </Text>
  );
}

function MapChrome() {
  const theme = useAppTheme();
  const safeInsets = useSafeAreaInsets();
  const {selected, select, onPlaceSelect, onPlaceDeselect} = useMapBridge();

  const [listOpen, setListOpen] = useState(false);

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
        onLoad={() => {
          console.log('map loaded');
        }}
        onLoadFail={(message: string) => {
          console.warn('map load failed', message);
        }}
      />

      <MapExperience.Chrome>
        <MapExperience.Onboarding
          welcomeTitle={RWS_ONBOARDING.welcomeTitle}
          welcomeBody={<RwsWelcomeBody />}
          welcomeContinueLabel={RWS_ONBOARDING.welcomeContinueLabel}
          welcomeAllowLocationLabel={RWS_ONBOARDING.welcomeAllowLocationLabel}
          renderWelcomeTerms={() => <RwsWelcomeTerms />}
          promptTitle={RWS_ONBOARDING.promptTitle}
          promptDescription={RWS_ONBOARDING.promptDescription}
          promptGpsAlreadyOnDescription={
            RWS_ONBOARDING.promptGpsAlreadyOnDescription
          }
          promptFindLabel={RWS_ONBOARDING.promptFindLabel}
          promptRecenterLabel={RWS_ONBOARDING.promptRecenterLabel}
          continueWithoutLabel={RWS_ONBOARDING.continueWithoutLabel}
          outsideTitle={RWS_ONBOARDING.outsideTitle}
          outsideMessage={RWS_ONBOARDING.outsideMessage}
          outsideDetail={RWS_ONBOARDING.outsideDetail}
          errorTitle={RWS_ONBOARDING.errorTitle}
          findingLabel={RWS_ONBOARDING.findingLabel}
          floorConfirmTitle={RWS_ONBOARDING.floorConfirmTitle}
          floorConfirmSubtitle={RWS_ONBOARDING.floorConfirmSubtitle}
          floorConfirmLabel={RWS_ONBOARDING.floorConfirmLabel}
        />

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
                results: {backgroundColor: 'red'},
                field: {
                  borderCurve: 'continuous',
                  borderWidth: 10,
                  borderColor: 'blue',
                },
              }}
            />
            {/* categories/onPress omitted → PlaceCatalog what-taxonomies */}
            <CategoryChips
              colors={{
                labelColor: 'green',
                selectedLabelColor: 'red',
                selectedBackgroundColor: 'blue',
              }}
            />
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

        <MapExperience.OverlayRegion>
          <FloorChangeBanner />
          {/*
            Omit onDirections → NavBridge startRoutingForPlace.
            Chrome coexistence hides the card while the routing session is visible.
          */}
          {!listOpen && selected ? (
            <PlaceSummaryCard place={selected} />
          ) : null}
        </MapExperience.OverlayRegion>

        {/*
          open is discover-side only; ListView.Carousel also yields while
          NavBridge sessionVisible (no host directionsOpen gate).
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
