/**
 * MapExperienceLayout
 *
 * Sticky search + category chips stay on top in both map and list modes.
 * Place data and search come from MapBridge (wired to MetaAtlasSDK).
 * CategoryChips remain host-driven.
 */

import React, {useCallback, useRef, useState} from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  MapExperience,
  ListView,
  SearchResultsList,
  CategoryChips,
  GpsControlButton,
  FocusControl,
  ListingCard,
  PlaceSummaryCard,
  setCustomTheme,
  useAppTheme,
  useMapBridge,
  type ChromeInsets,
  type CategoryItem,
  type PlaceItem,
} from '@twinmatrix/rn-ui-sdk';
import {MetaAtlasSDK} from '../../../sdk/map-sdk/src/meta-atlas-sdk-rn/meta-atlas-sdk-rn';
import appConfig from '../../config/app.config';
import {ALPHABET, MOCK_CATEGORIES} from '../../data/mockPlaces';

setCustomTheme('light', {
  accent: {primary: '#0B7A75', secondary: '#6D5AD0'},
  surface: {topbar: '#FFFFFF', sheet: '#FFFFFF'},
});

const CAROUSEL_HEIGHT = 140;
const CAROUSEL_BOTTOM_OFFSET = 16;

function MapChrome({chromeInsets}: {chromeInsets: ChromeInsets}) {
  const theme = useAppTheme();
  const safeInsets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);
  const {
    registerMap,
    setSearchReady,
    searchReady,
    searchQuery,
    setSearchQuery,
    places,
    selected,
    select,
    selectFromMapPress,
  } = useMapBridge();

  const [mapHeight] = useState(Dimensions.get('window').height);
  const [categories, setCategories] = useState<CategoryItem[]>(MOCK_CATEGORIES);
  const [listOpen, setListOpen] = useState(false);

  const showSearchResults = searchQuery.trim().length > 0 && !listOpen;
  const stickyTopOffset = Math.max(chromeInsets.top - safeInsets.top, 0);

  const onCategoryPress = (item: CategoryItem) => {
    setCategories(prev =>
      prev.map(c => ({...c, selected: c.id === item.id})),
    );
  };

  const onSelectPlace = useCallback(
    (place: PlaceItem) => {
      select(place);
      setListOpen(false);
    },
    [select],
  );

  const bindMapRef = useCallback(
    (instance: any) => {
      mapRef.current = instance;
      registerMap(instance);
    },
    [registerMap],
  );

  const renderRowCard = ({item}: {item: PlaceItem}) => (
    <ListingCard place={item} layout="row" onPress={onSelectPlace} />
  );

  const renderCarouselCard = ({item}: {item: PlaceItem}) => (
    <ListingCard
      place={item}
      layout="card"
      onPress={onSelectPlace}
      onFavoritePress={() => {
        console.log('favorite', item.id);
      }}
      favorited={selected?.id === item.id}
    />
  );

  return (
    <>
      <MapExperience.Canvas>
        <MetaAtlasSDK
          ref={bindMapRef}
          tileserverRoleName={appConfig.metaAtlas.role}
          accessToken={appConfig.metaAtlas.accessToken}
          secretKey={appConfig.metaAtlas.secretKey}
          onPress={() => selectFromMapPress()}
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
              onChangeText={setSearchQuery}
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
            <PlaceSummaryCard
              place={selected}
              onClose={() => select(null)}
              onDirections={() => select(selected)}
            />
          </MapExperience.OverlayRegion>
        ) : null}

        <ListView.Root
          open={!listOpen}
          orientation="horizontal"
          showBackdrop={false}
          height={CAROUSEL_HEIGHT}
          bottomOffset={CAROUSEL_BOTTOM_OFFSET}
        >
          <ListView.Body
            data={places}
            keyExtractor={item => item.id}
            estimatedItemSize={280}
            renderItem={renderCarouselCard}
          />
        </ListView.Root>

        <ListView.Root
          open={listOpen}
          orientation="vertical"
          onClose={() => setListOpen(false)}
          showBackdrop={false}
          topOffset={stickyTopOffset}
        >
          <ListView.Body
            data={places}
            keyExtractor={item => item.id}
            estimatedItemSize={120}
            renderItem={renderRowCard}
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
