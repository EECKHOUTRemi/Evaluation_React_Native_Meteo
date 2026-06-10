import type { Coordinates } from '@/lib/location/location';

export type CurrentWeather = {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  surface_pressure: number;
};

export type WeatherResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current_units: Record<keyof CurrentWeather, string>;
  current: CurrentWeather;
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

/** Just what the home page's main weather card displays. */
export type HomeWeather = {
  current_units: {
    temperature_2m: string;
  };
  current: {
    /** Timestamp of the weather snapshot, always returned by the API. */
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

function buildForecastUrl(
  { latitude, longitude }: Coordinates,
  params: Record<string, string>
): string {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '1');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function fetchForecast<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather request failed (${response.status}).`);
  }
  return (await response.json()) as T;
}

/**
 * Fetches only the data shown in the home page's main weather card.
 */
export function getHomeWeather(coords: Coordinates): Promise<HomeWeather> {
  return fetchForecast<HomeWeather>(
    buildForecastUrl(coords, {
      current: 'temperature_2m,apparent_temperature,weather_code',
      daily: 'temperature_2m_max,temperature_2m_min',
    })
  );
}

/**
 * Fetches the full forecast from Open-Meteo, for the city detail page.
 */
export function getWeather(coords: Coordinates): Promise<WeatherResponse> {
  return fetchForecast<WeatherResponse>(
    buildForecastUrl(coords, {
      current:
        'precipitation,temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,surface_pressure,wind_direction_10m',
      daily: 'sunrise,sunset,temperature_2m_max,temperature_2m_min',
    })
  );
}
