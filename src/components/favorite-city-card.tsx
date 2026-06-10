import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FavoriteCity } from '@/lib/favorites';
import { getHomeWeather, type HomeWeather } from '@/lib/weather/weather';
import { describeWeather } from '@/lib/weather/weather-codes';
import { theme } from '@/theme';

type FavoriteCityCardProps = {
  city: FavoriteCity;
  onPress: (city: FavoriteCity) => void;
};

export function FavoriteCityCard({ city, onPress }: FavoriteCityCardProps) {
  const [weather, setWeather] = useState<HomeWeather | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHomeWeather(city)
      .then((forecast) => {
        if (!cancelled) setWeather(forecast);
      })
      .catch(() => {
        // The card still renders the city name; weather just stays blank.
      });
    return () => {
      cancelled = true;
    };
  }, [city]);

  const info = weather ? describeWeather(weather.current.weather_code) : null;
  const WeatherIcon = info?.icon;

  return (
    <Pressable
      onPress={() => onPress(city)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.header}>
        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>{city.name}</Text>
          <Text style={styles.description} numberOfLines={1}>
            {info ? info.label : '—'}
          </Text>
        </View>
        {WeatherIcon && info && <WeatherIcon size={22} color={info.color} strokeWidth={1.75} />}
      </View>
      <Text style={styles.temp}>
        {weather ? `${Math.round(weather.current.temperature_2m)}°` : ' '}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardPressed: {
    backgroundColor: theme.colors.cardAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  temp: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '300',
  },
});
