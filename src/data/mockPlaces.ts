import type {CategoryItem, PlaceItem} from '@twinmatrix/rn-ui-sdk';

/**
 * Demo PlaceItem catalog for custom-data / offline demos.
 * Default map browse lists now come from MapBridge (`getAllMapObjects`).
 * Use `setCustomPlaces(MOCK_PLACES)` when you want a full host override.
 */
export const MOCK_PLACES: PlaceItem[] = [
  {
    id: 'mock-1',
    name: 'Adventure Cove Waterpark',
    subtitle: 'Sentosa',
    distanceLabel: '3 min walk away',
    address: '14 Sentosa Gateway 098132',
    hoursLabel: '10:00 AM – 10:00 PM',
    priceLabel: 'From S$350',
    badgeLabel: 'Earn up to 10 RWR Points',
  },
  {
    id: 'mock-2',
    name: 'Jewel Changi Airport',
    subtitle: 'Terminal Jewel · L1',
    distanceLabel: '5 min walk away',
    address: '78 Airport Blvd',
    hoursLabel: 'Open 24 hours',
    priceLabel: 'Free entry',
    badgeLabel: 'Earn up to 5 RWR Points',
  },
  {
    id: 'mock-3',
    name: 'T3 Departure Hall',
    subtitle: 'Terminal 3 · L2',
    distanceLabel: '2 min walk away',
    hoursLabel: 'Open 24 hours',
  },
];

export const MOCK_CATEGORIES: CategoryItem[] = [
  {id: 'all', label: 'All', selected: true},
  {id: 'open', label: 'Open Now'},
  {id: 'points', label: 'RWR Points'},
  {id: 'food', label: 'Food'},
  {id: 'shops', label: 'Shops'},
];

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
