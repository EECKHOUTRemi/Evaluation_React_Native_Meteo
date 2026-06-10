export type CityResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string | null;
  region: string | null;
};

type GeocodingResponse = {
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }[];
};

/**
 * Searches cities by name using the Open-Meteo geocoding API.
 *
 * Returns an empty array when nothing matches or the query is too short.
 */
export async function searchCities(query: string): Promise<CityResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', trimmed);
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'fr');
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`City search failed (${response.status}).`);
  }

  const data = (await response.json()) as GeocodingResponse;

  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country ?? null,
    region: result.admin1 ?? null,
  }));
}
