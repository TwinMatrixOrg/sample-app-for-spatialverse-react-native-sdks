/**
 * MapExperienceLayout
 *
 * Sticky search + category chips stay on top in both map and list modes.
 * Chrome insets / safe area are owned by MapLayout inside MapExperience.Root.
 * Carousel height / bottomOffset are SDK-dynamic (measure + theme) unless overridden.
 *
 * Onboarding + Wayfinding are always-mounted Chrome siblings (omit-by-not-mounting).
 * Credentials stay on Canvas; theme mode is set on Root. Directions opens via
 * NavBridge when PlaceSummaryCard omits onDirections — no host directionsOpen.
 */

import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  MapExperience,
  ListView,
  SearchBar,
  CategoryChips,
  GpsControlButton,
  FocusControl,
  PlaceSummaryCard,
  FloorChangeBanner,
  useAppTheme,
  useMapBridge,
  useMapBridgeActions,
  useMapLayout,
  useNavBridgeSelectorOptional,
  isListMapToggleVisible,
  type PlaceItem,
} from '@twinmatrix/rn-ui-sdk';
import appConfig from '../../config/app.config';
import {renderRwsWelcome} from './RwsWelcome';
import {ALPHABET} from '../../data/mockPlaces';

/** Reads layout insets here, not in MapChrome, so inset changes skip the map. */
function StickyHeader({
  listOpen,
  onSelectPlace,
}: {
  listOpen: boolean;
  onSelectPlace: (place: PlaceItem) => void;
}) {
  const theme = useAppTheme();
  const layout = useMapLayout();
  return (
    <View
      style={[
        styles.stickyHeader,
        {
          paddingTop: layout.safe.top + 8,
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
      />
      {/* categories/onPress omitted → PlaceCatalog what-taxonomies */}
      <CategoryChips/>
    </View>
  );
}

/** Reads `selected` here, not in MapChrome, so a selection skips the map. */
function SelectionSurfaces({
  listOpen,
  onSelectPlace,
}: {
  listOpen: boolean;
  onSelectPlace: (place: PlaceItem) => void;
}) {
  const {selected} = useMapBridge();
  return (
    <>
      {/*
        Chrome sibling so the sheet snaps against the map, not OverlayRegion.
        Omit onDirections → NavBridge startRoutingForPlace.
        PlaceSummaryCard yields for the whole routing session (draft → arrived).
      */}
      {!listOpen && selected ? (
        <PlaceSummaryCard
          place={selected}
          onViewDetails={() => {
            console.log('view details', selected.id);
          }}
          viewDetailsLabel='View Details'
          showExtendedDetails={true}
        />
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
    </>
  );
}

/**
 * Renders the map, so it reads only stable bridge actions and the nav phase.
 * Anything that reads bridge state or layout insets lives in a child above.
 */
function MapChrome() {
  const theme = useAppTheme();
  const {select} = useMapBridgeActions();
  // Select only `phase`: this component renders the map, so it must not re-render on live HUD ticks.
  const navPhase = useNavBridgeSelectorOptional(s => s.phase);
  const showListMapToggle = isListMapToggleVisible(navPhase);

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
          <StickyHeader listOpen={listOpen} onSelectPlace={onSelectPlace} />
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

        <SelectionSurfaces listOpen={listOpen} onSelectPlace={onSelectPlace} />

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
