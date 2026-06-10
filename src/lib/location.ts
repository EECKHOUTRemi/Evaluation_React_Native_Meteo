import * as Location from 'expo-location';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Requests foreground location permission and returns the device's current
 * latitude and longitude.
 *
 * @throws if the user denies the location permission.
 */
export async function getCurrentCoordinates(): Promise<Coordinates> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Location permission was not granted.');
  }

  const { coords } = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

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
 * Reverse-geocodes coordinates into a place (city, region, country).
 *
 * Uses a free HTTP reverse-geocoder so it works on every platform (including
 * web, where `expo-location`'s native reverse geocoding is unavailable).
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
    country: data.countryName || null,
  };
}
