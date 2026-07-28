/**
 * MapExperienceLayout
 *
 * Sticky search + category chips stay on top in both map and list modes.
 * ListView fills the area below that chrome; map stays mounted underneath.
 */

import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  unstable_batchedUpdates,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  MapExperience,
  ListView,
  Sheet,
  SearchResultsList,
  PlaceSummaryCard,
  CategoryChips,
  GpsControlButton,
  ListingCard,
  setCustomTheme,
  useAppTheme,
  type ChromeInsets,
  type CategoryItem,
  type GpsControlState,
  type PlaceItem,
} from '@twinmatrix/rn-ui-sdk';
import {MetaAtlasSDK} from '../../../sdk/src/meta-atlas-sdk-rn/meta-atlas-sdk-rn';
import appConfig from '../../config/app.config';
import {toPlaceItem, toPlaceItems} from '../../adapters/placeAdapter';
import {ALPHABET, MOCK_CATEGORIES, MOCK_PLACES} from '../../data/mockPlaces';

setCustomTheme('light', {
  accent: {primary: '#0B7A75', secondary: '#6D5AD0'},
  surface: {topbar: '#FFFFFF', sheet: '#FFFFFF'},
});

const SEARCH_DEBOUNCE_MS = 280;

export default function MapExperienceLayout() {
  const theme = useAppTheme();
  const safeInsets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);

  const [mapHeight] = useState(Dimensions.get('window').height);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceItem[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>(MOCK_CATEGORIES);
  const [listOpen, setListOpen] = useState(false);
  const [gpsState, setGpsState] = useState<GpsControlState>('off');
  const [searchReady, setSearchReady] = useState(false);
  const [chromeInsets, setChromeInsets] = useState<ChromeInsets>({
    top: 0,
    bottom: 0,
  });
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const listPlaces = searchResults.length > 0 ? searchResults : MOCK_PLACES;
  const showSearchResults = searchQuery.trim().length > 0 && !listOpen;

  const runSearch = useCallback(
    (query: string) => {
      const sdk = mapRef.current;
      if (!sdk || !searchReady || !query.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        sdk.getMapObjectsByName(
          query.trim(),
          true,
          'Relevance',
          (features: any[]) => {
            unstable_batchedUpdates(() => {
              setSearchResults(toPlaceItems(features ?? []));
            });
          },
        );
      } catch (err) {
        console.warn('Search failed', err);
        setSearchResults([]);
      }
    },
    [searchReady],
  );

  const onSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => runSearch(text), SEARCH_DEBOUNCE_MS);
  };

  const onCategoryPress = (item: CategoryItem) => {
    setCategories(prev =>
      prev.map(c => ({...c, selected: c.id === item.id})),
    );
  };

  const onSelectPlace = (place: PlaceItem) => {
    setSelectedPlace(place);
    setListOpen(false);
    const sdk = mapRef.current;
    if (sdk && place.coordinates) {
      try {
        sdk.flyTo({center: place.coordinates});
      } catch (err) {
        console.warn('flyTo failed', err);
      }
    }
  };

  const onMapPress = (_data: any) => {
    const sdk = mapRef.current;
    if (!sdk) return;
    try {
      const feature = sdk.getLastClickedFeature?.();
      if (feature?.name) {
        unstable_batchedUpdates(() => {
          setSelectedPlace(toPlaceItem(feature));
        });
        const center = sdk.getMidPointOfFeature?.(feature);
        if (center) {
          sdk.flyTo?.({center});
        }
      }
    } catch (err) {
      console.warn('map press handler failed', err);
    }
  };

  const onGpsPress = () => {
    setGpsState(prev => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'following';
      return 'off';
    });
  };

  // TopRegion onLayout already includes safe-area padding inside the sticky header.
  // chromeInsets.top = safe.top + regionHeight, so subtract safe.top for ListView topOffset.
  const stickyTopOffset = Math.max(chromeInsets.top - safeInsets.top, 0);

  return (
    <MapExperience.Root
      themeMode="light"
      onChromeInsetsChange={setChromeInsets}
    >
      <MapExperience.Canvas>
        <MetaAtlasSDK
          ref={mapRef}
          tileserverRoleName={appConfig.metaAtlas.role}
          accessToken={appConfig.metaAtlas.accessToken}
          secretKey={appConfig.metaAtlas.secretKey}
          onPress={onMapPress}
          onLoad={() => {
            console.log('map loaded');
          }}
          onLoadFail={(message: string) => {
            console.warn('map load failed', message);
          }}
          onRoutingStatusUpdate={(loaded: boolean) => {
            console.log('routing ready:', loaded);
          }}
          onSearchStatusUpdate={(loaded: boolean) => {
            setSearchReady(Boolean(loaded));
            console.log('search ready:', loaded);
          }}
          onOfflineMapsStatusUpdate={() => {}}
          onNetworkModeUpdate={() => {}}
          onMoveEnd={() => {}}
          maxMapHeight={mapHeight}
          isFullHeight
        />
      </MapExperience.Canvas>

      <MapExperience.Chrome>
        {/* Sticky in both map and list modes */}
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
            <TextInput
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Find your perfect experience"
              placeholderTextColor={theme.text.muted}
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.surface.control,
                  color: theme.text.primary,
                  borderColor: theme.border.subtle,
                },
              ]}
            />
            <CategoryChips items={categories} onItemPress={onCategoryPress} />
            {showSearchResults ? (
              <SearchResultsList
                items={searchResults}
                onItemPress={onSelectPlace}
                empty={searchResults.length === 0}
                emptyMessage={
                  searchReady
                    ? 'No locations were found.'
                    : 'Search is still loading…'
                }
              />
            ) : null}
          </View>
        </MapExperience.TopRegion>

        {!listOpen ? (
          <MapExperience.ControlsRegion
            style={{top: Math.max(chromeInsets.top + 12, 120)}}
          >
            <GpsControlButton
              state={gpsState}
              onPress={onGpsPress}
              layout="stack"
            />
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

        <ListView.Root
          open={listOpen}
          onClose={() => setListOpen(false)}
          showBackdrop={false}
          topOffset={stickyTopOffset}
        >
          <ListView.Body
            data={listPlaces}
            keyExtractor={item => item.id}
            estimatedItemSize={120}
            renderItem={({item}) => (
              <ListingCard place={item} onPress={onSelectPlace} />
            )}
          />
          <ListView.AlphabetRail
            letters={ALPHABET}
            onLetterPress={letter => {
              console.log('jump to', letter);
            }}
          />
          <ListView.FloatingAction
            onPress={() => setListOpen(false)}
            accessibilityLabel="Show map"
          >
            <Text style={{fontWeight: '700', color: theme.text.primary}}>
              Map
            </Text>
          </ListView.FloatingAction>
        </ListView.Root>

        {!listOpen ? (
          <MapExperience.BottomRegion>
            <Sheet.Root
              index={selectedPlace ? 0 : -1}
              snapPoints={['28%', '50%']}
            >
              <Sheet.Handle />
              <Sheet.Body>
                {selectedPlace ? (
                  <PlaceSummaryCard
                    place={selectedPlace}
                    onDirections={() => {
                      console.log('start directions for', selectedPlace.id);
                    }}
                    onClose={() => setSelectedPlace(null)}
                  />
                ) : (
                  <Text style={{color: theme.text.muted, paddingVertical: 8}}>
                    Tap the map or search to select a place.
                  </Text>
                )}
              </Sheet.Body>
            </Sheet.Root>
          </MapExperience.BottomRegion>
        ) : null}
      </MapExperience.Chrome>
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
  searchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
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
