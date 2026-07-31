/**
 * MapExperienceLayout
 *
 * Sticky search + category chips stay on top in both map and list modes.
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
  setCustomTheme,
  useAppTheme,
  useMapBridge,
  type ChromeInsets,
  type PlaceItem,
} from '@twinmatrix/rn-ui-sdk';
import appConfig from '../../config/app.config';
import {ALPHABET} from '../../data/mockPlaces';

setCustomTheme('light', {
  accent: {primary: '#0B7A75', secondary: '#6D5AD0'},
  surface: {topbar: '#FFFFFF', sheet: '#FFFFFF'},
});

const CAROUSEL_HEIGHT = 140;
const CAROUSEL_BOTTOM_OFFSET = 16;

function MapChrome({chromeInsets}: {chromeInsets: ChromeInsets}) {
  const theme = useAppTheme();
  const safeInsets = useSafeAreaInsets();
  const {selected, select, onPlaceSelect, onPlaceDeselect} = useMapBridge();

  const [listOpen, setListOpen] = useState(false);

  const stickyTopOffset = Math.max(chromeInsets.top - safeInsets.top, 0);

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
          <MapExperience.ControlsRegion
            style={{top: Math.max(chromeInsets.top + 12, 120)}}
          >
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
              <Text style={{fontWeight: '700', color: theme.text.primary}}>
                List
              </Text>
            </Pressable>
          </MapExperience.ControlsRegion>
        ) : null}

        {!listOpen && selected ? (
          <MapExperience.OverlayRegion
            style={{bottom: CAROUSEL_HEIGHT + CAROUSEL_BOTTOM_OFFSET + 24}}
          >
            {/* Close always clears selection via MapBridge.select(null) */}
            <PlaceSummaryCard
              place={selected}
              onDirections={() => select(selected)}
            />
          </MapExperience.OverlayRegion>
        ) : null}

        <ListView.Carousel
          open={!listOpen}
          height={CAROUSEL_HEIGHT}
          bottomOffset={CAROUSEL_BOTTOM_OFFSET}
          onItemPress={onSelectPlace}
          onFavoritePress={place => {
            console.log('favorite', place.id);
          }}
          isFavorited={place => selected?.id === place.id}
        />

        <ListView.Browse
          open={listOpen}
          topOffset={stickyTopOffset}
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
  const [chromeInsets, setChromeInsets] = useState<ChromeInsets>({
    top: 0,
    bottom: 0,
  });

  return (
    <MapExperience.Root
      themeMode="light"
      onChromeInsetsChange={setChromeInsets}
    >
      <MapChrome chromeInsets={chromeInsets} />
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
});
