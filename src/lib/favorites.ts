import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CityResult } from '@/lib/location/geocoding';

const STORAGE_KEY = 'favorite-cities';

export type FavoriteCity = CityResult;

export async function getFavorites(): Promise<FavoriteCity[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteCity[]) : [];
  } catch {
    return [];
  }
}

export async function isFavorite(cityId: number): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((city) => city.id === cityId);
}

/**
 * Adds the city to favorites if absent, removes it otherwise.
 *
 * @returns true when the city is now a favorite, false when it was removed.
 */
export async function toggleFavorite(city: FavoriteCity): Promise<boolean> {
  const favorites = await getFavorites();
  const exists = favorites.some((c) => c.id === city.id);
  const next = exists ? favorites.filter((c) => c.id !== city.id) : [...favorites, city];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return !exists;
}
