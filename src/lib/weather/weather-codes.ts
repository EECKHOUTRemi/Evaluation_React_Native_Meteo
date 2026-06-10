import {
  CircleHelp,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Snowflake,
  Sun,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Maps WMO weather interpretation codes (as returned by Open-Meteo) to a
 * human-readable French description, a Lucide icon and a display color.
 *
 * @see https://open-meteo.com/en/docs (WMO Weather interpretation codes)
 */
type WeatherInfo = {
  label: string;
  icon: LucideIcon;
  color: string;
};

const SUN = '#FBC02D';
const CLOUD = '#B0BEC5';
const RAIN = '#4FC3F7';
const SNOW = '#E1F5FE';
const STORM = '#FFB300';

const WEATHER_CODES: Record<number, WeatherInfo> = {
  0: { label: 'Ciel dégagé', icon: Sun, color: SUN },
  1: { label: 'Principalement clair', icon: CloudSun, color: SUN },
  2: { label: 'Partiellement nuageux', icon: CloudSun, color: CLOUD },
  3: { label: 'Couvert', icon: Cloud, color: CLOUD },
  45: { label: 'Brouillard', icon: CloudFog, color: CLOUD },
  48: { label: 'Brouillard givrant', icon: CloudFog, color: CLOUD },
  51: { label: 'Bruine légère', icon: CloudDrizzle, color: RAIN },
  53: { label: 'Bruine modérée', icon: CloudDrizzle, color: RAIN },
  55: { label: 'Bruine dense', icon: CloudDrizzle, color: RAIN },
  56: { label: 'Bruine verglaçante', icon: CloudDrizzle, color: RAIN },
  57: { label: 'Bruine verglaçante dense', icon: CloudDrizzle, color: RAIN },
  61: { label: 'Pluie légère', icon: CloudRain, color: RAIN },
  63: { label: 'Pluie modérée', icon: CloudRain, color: RAIN },
  65: { label: 'Pluie forte', icon: CloudRainWind, color: RAIN },
  66: { label: 'Pluie verglaçante', icon: CloudRain, color: RAIN },
  67: { label: 'Pluie verglaçante forte', icon: CloudRainWind, color: RAIN },
  71: { label: 'Neige légère', icon: CloudSnow, color: SNOW },
  73: { label: 'Neige modérée', icon: CloudSnow, color: SNOW },
  75: { label: 'Neige forte', icon: Snowflake, color: SNOW },
  77: { label: 'Grains de neige', icon: CloudSnow, color: SNOW },
  80: { label: 'Averses légères', icon: CloudDrizzle, color: RAIN },
  81: { label: 'Averses modérées', icon: CloudRain, color: RAIN },
  82: { label: 'Averses violentes', icon: CloudRainWind, color: RAIN },
  85: { label: 'Averses de neige', icon: CloudSnow, color: SNOW },
  86: { label: 'Averses de neige fortes', icon: Snowflake, color: SNOW },
  95: { label: 'Orage', icon: CloudLightning, color: STORM },
  96: { label: 'Orage avec grêle', icon: CloudHail, color: STORM },
  99: { label: 'Orage avec forte grêle', icon: CloudHail, color: STORM },
};

const UNKNOWN: WeatherInfo = { label: 'Inconnu', icon: CircleHelp, color: CLOUD };

export function describeWeather(code: number): WeatherInfo {
  return WEATHER_CODES[code] ?? UNKNOWN;
}
