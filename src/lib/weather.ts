import type { Coordinates } from '@/lib/location';

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
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
};

/**
 * Fetches the current forecast from Open-Meteo for the given coordinates.
 */
export async function getWeather({ latitude, longitude }: Coordinates): Promise<WeatherResponse> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('daily', 'sunrise,sunset,temperature_2m_max,temperature_2m_min');
  url.searchParams.set('hourly', 'temperature_2m');
  url.searchParams.set(
    'current',
    'precipitation,temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,surface_pressure,wind_direction_10m'
  );
  url.searchParams.set('timezone', 'Europe/London');
  url.searchParams.set('forecast_days', '1');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather request failed (${response.status}).`);
  }

  return (await response.json()) as WeatherResponse;
}
