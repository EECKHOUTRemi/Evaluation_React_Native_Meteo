import * as Location from 'expo-location';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Requests location permission and returns the device's current
 * latitude and longitude.
 *
 * @throws if the user denies the location permission.
 */
export async function getCurrentCoordinates(): Promise<Coordinates> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Veuillez autoriser l\'accès à votre localisation.');
  }

  const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 });
  const coords =
    lastKnown?.coords ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).coords;

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}

export type Place = {
  city: string | null;
  region: string | null;
  country: string | null;
};

/**
 * Create an unique id for a city from their coordinates
 */
export function coordinatesId({ latitude, longitude }: Coordinates): number {
  return Math.round(latitude * 100) * 100000 + Math.round(longitude * 100);
}

/**
 * Reverse-geocodes coordinates into a place (city, region, country).
 */
export async function getPlace({ latitude, longitude }: Coordinates): Promise<Place> {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('localityLanguage', 'fr');

  const response = await fetch(url.toString());
  if (!response.ok) {
    return { city: null, region: null, country: null };
  }

  const data = (await response.json()) as {
    city?: string;
    locality?: string;
    principalSubdivision?: string;
    countryName?: string;
  };

  return {
    city: data.city || data.locality || null,
    region: data.principalSubdivision || null,
    // Remove the parenthesis from country name
    country: data.countryName?.replace(/\s*\([^)]*\)\s*$/, '') || null,
  };
}
