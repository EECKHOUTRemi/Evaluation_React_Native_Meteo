import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  CloudRain,
  Compass,
  Droplets,
  Gauge,
  Star,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { formatHour, formatUpdatedAt, windDirectionLabel } from '@/lib/format';
import { getWeather, type WeatherResponse } from '@/lib/weather/weather';
import { describeWeather } from '@/lib/weather/weather-codes';
import { theme } from '@/theme';

function DetailRow({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: LucideIcon;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelRow}>
        <Icon size={16} color={color} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function CityDetail() {
  const { id, name, country, region, latitude, longitude } = useLocalSearchParams<{
    id: string;
    name: string;
    country: string;
    region: string;
    latitude: string;
    longitude: string;
  }>();

  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    isFavorite(Number(id)).then(setFavorite);
  }, [id]);

  const handleToggleFavorite = useCallback(async () => {
    setFavorite(
      await toggleFavorite({
        id: Number(id),
        name: name ?? '',
        country: country || null,
        region: region || null,
        latitude: Number(latitude),
        longitude: Number(longitude),
      })
    );
  }, [id, name, country, region, latitude, longitude]);

  const load = useCallback(async () => {
    setError(null);
    setWeather(null);
    try {
      setWeather(
        await getWeather({ latitude: Number(latitude), longitude: Number(longitude) })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger la météo.');
    }
  }, [latitude, longitude]);

  useEffect(() => {
    load();
  }, [load]);

  const subtitle = [region, country].filter(Boolean).join(', ');
  const current = weather?.current;
  const units = weather?.current_units;
  const info = current ? describeWeather(current.weather_code) : null;
  const WeatherIcon = info?.icon;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <ChevronLeft size={18} color={theme.colors.muted} />
        <Text style={styles.backText}>Retour</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        {!weather && !error && <ActivityIndicator style={styles.loader} color={theme.colors.muted} />}

        {error && (
          <View style={styles.errorBlock}>
            <Text style={styles.error}>{error}</Text>
            <Pressable onPress={load} style={styles.retry}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </View>
        )}

        {weather && current && units && info && (
          <>
            <View style={styles.headerCard}>
              <Text style={styles.title}>{name}</Text>
              {subtitle.length > 0 && <Text style={styles.subtitle}>{subtitle}</Text>}
              {WeatherIcon && info && (
                <View style={styles.icon}>
                  <WeatherIcon size={56} color={info.color} strokeWidth={1.5} />
                </View>
              )}
              <Text style={styles.temp}>{Math.round(current.temperature_2m)}°</Text>
              <Text style={styles.description}>{info.label}</Text>
              <Text style={styles.feels}>
                Ressenti : {Math.round(current.apparent_temperature)}°
              </Text>
            </View>

            <Text style={styles.sectionTitle}>DÉTAILS MÉTÉO</Text>

            <View style={styles.detailsCard}>
              <DetailRow
                icon={Thermometer}
                color="#FF8A65"
                label="Min / Max"
                value={`${Math.round(weather.daily.temperature_2m_min[0])}° / ${Math.round(weather.daily.temperature_2m_max[0])}°`}
              />
              <DetailRow
                icon={Droplets}
                color="#4FC3F7"
                label="Humidité"
                value={`${current.relative_humidity_2m}${units.relative_humidity_2m}`}
              />
              <DetailRow
                icon={Wind}
                color="#80DEEA"
                label="Vent"
                value={`${Math.round(current.wind_speed_10m)} ${units.wind_speed_10m}`}
              />
              <DetailRow
                icon={Compass}
                color="#A5D6A7"
                label="Direction"
                value={windDirectionLabel(current.wind_direction_10m)}
              />
              <DetailRow
                icon={Gauge}
                color="#CE93D8"
                label="Pression"
                value={`${Math.round(current.surface_pressure)} ${units.surface_pressure}`}
              />
              <DetailRow
                icon={CloudRain}
                color="#4FC3F7"
                label="Pluie"
                value={`${current.precipitation} ${units.precipitation}`}
              />
              <DetailRow
                icon={Sunrise}
                color="#FFB74D"
                label="Lever du soleil"
                value={formatHour(weather.daily.sunrise[0])}
              />
              <DetailRow
                icon={Sunset}
                color="#FF8A65"
                label="Coucher du soleil"
                value={formatHour(weather.daily.sunset[0])}
              />
            </View>

            <Text style={styles.updatedAt}>
              Dernière mise à jour : {formatUpdatedAt(current.time)}
            </Text>

            <Pressable
              onPress={handleToggleFavorite}
              style={({ pressed }) => [styles.favoriteButton, pressed && styles.favoriteButtonPressed]}
            >
              <Star
                size={16}
                color={theme.colors.accent}
                fill={favorite ? theme.colors.accent : 'transparent'}
              />
              <Text style={styles.favoriteText}>
                {favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backText: {
    color: theme.colors.muted,
    fontSize: 15,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: 0,
    gap: theme.spacing.md,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  errorBlock: {
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 15,
    textAlign: 'center',
  },
  retry: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  retryText: {
    color: theme.colors.text,
    fontSize: 15,
  },
  headerCard: {
    backgroundColor: theme.colors.cardAlt,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  icon: {
    marginVertical: theme.spacing.sm,
  },
  temp: {
    color: theme.colors.text,
    fontSize: 56,
    fontWeight: '200',
    lineHeight: 62,
  },
  description: {
    color: theme.colors.text,
    fontSize: 16,
  },
  feels: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  sectionTitle: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: theme.spacing.sm,
  },
  detailsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailLabel: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  updatedAt: {
    color: theme.colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  favoriteButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  favoriteButtonPressed: {
    backgroundColor: theme.colors.cardAlt,
  },
  favoriteText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
