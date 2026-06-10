import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CitySearch } from '@/components/city-search';
import { CurrentWeatherCard } from '@/components/current-weather-card';
import { FavoriteCityCard } from '@/components/favorite-city-card';
import { getFavorites, type FavoriteCity } from '@/lib/favorites';
import { type CityResult } from '@/lib/location/geocoding';
import { getCurrentCoordinates, type Place } from '@/lib/location/location';
import { resolveMyCity } from '@/lib/location/my-city';
import { getHomeWeather, type HomeWeather } from '@/lib/weather/weather';
import { theme } from '@/theme';

export default function Index() {
  const [place, setPlace] = useState<Place | null>(null);
  const [myCity, setMyCity] = useState<CityResult | null>(null);
  const [weather, setWeather] = useState<HomeWeather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  useFocusEffect(
    useCallback(() => {
      getFavorites().then(setFavorites);
    }, [])
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const position = await getCurrentCoordinates();
      const { place: resolvedPlace, city: resolvedCity } = await resolveMyCity(position);
      const forecast = await getHomeWeather(resolvedCity);
      setMyCity(resolvedCity);
      setPlace(resolvedPlace);
      setWeather(forecast);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger la météo.');
      setMyCity(null);
      setPlace(null);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const placeName = useMemo(() => {
    if (!place) return 'Position inconnue';
    return [place.city, place.country].filter(Boolean).join(', ') || 'Position inconnue';
  }, [place]);

  const openCity = useCallback((city: CityResult) => {
    router.push({
      pathname: '/city/[id]',
      params: {
        id: String(city.id),
        name: city.name,
        country: city.country ?? '',
        region: city.region ?? '',
        latitude: String(city.latitude),
        longitude: String(city.longitude),
      },
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Météo</Text>
          <Text style={styles.subtitle}>Vos villes en un coup d&apos;œil</Text>
        </View>

        <CitySearch onSelectCity={openCity} />

        {loading && (
          <View style={styles.placeholder}>
            <ActivityIndicator color={theme.colors.text} />
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={load} style={styles.retry}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </View>
        )}

        {weather && !loading && (
          <CurrentWeatherCard
            placeName={placeName}
            weather={weather}
            onPress={myCity ? () => openCity(myCity) : undefined}
          />
        )}

        <View style={styles.favoritesSection}>
          <Text style={styles.sectionTitle}>VILLES FAVORITES</Text>
          {favorites.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Aucune ville favorite pour le moment.
              </Text>
              <Text style={styles.emptyHint}>
                Recherchez une ville pour l&apos;ajouter à vos favoris.
              </Text>
            </View>
          ) : (
            <View style={styles.favoritesGrid}>
              {favorites.map((city) => (
                <FavoriteCityCard key={city.id} city={city} onPress={openCity} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  titleBlock: {
    gap: 2,
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
  placeholder: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  errorCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
  retry: {
    backgroundColor: theme.colors.cardAlt,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  retryText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  favoritesSection: {
    gap: theme.spacing.md,
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  emptyHint: {
    color: theme.colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
});
