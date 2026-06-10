import AsyncStorage from '@react-native-async-storage/async-storage';

import { findNearestCity, type CityResult } from '@/lib/location/geocoding';
import { coordinatesId, getPlace, type Coordinates, type Place } from '@/lib/location/location';

const STORAGE_KEY = 'my-city-cache';

export type MyCity = {
  place: Place;
  city: CityResult;
};

type CachedMyCity = MyCity & { gridId: number };

/**
 * Resolves the current position to a place and its canonical geocoding city.
 *
 * The result is cached per ~1km grid cell: as long as the user stays in the
 * same cell, later loads skip both geocoding round trips and only the weather
 * itself needs fetching.
 */
export async function resolveMyCity(position: Coordinates): Promise<MyCity> {
  const gridId = coordinatesId(position);

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as CachedMyCity;
      if (cached.gridId === gridId) {
        return { place: cached.place, city: cached.city };
      }
    }
  } catch {
    // Unreadable cache — fall through to a full resolution.
  }

  const place = await getPlace(position);

  // Resolve the position to the canonical geocoding city so the weather
  // matches what a search for the same city returns. Falls back to the
  // raw GPS point when the city cannot be resolved.
  let city: CityResult | null = null;
  if (place.city) {
    city = await findNearestCity(place.city, position).catch(() => null);
  }
  const resolved: CityResult = city ?? {
    id: gridId,
    name: place.city ?? 'Ma position',
    country: place.country,
    region: place.region,
    latitude: position.latitude,
    longitude: position.longitude,
  };

  const result: MyCity = { place, city: resolved };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...result, gridId })).catch(() => {});
  return result;
}
