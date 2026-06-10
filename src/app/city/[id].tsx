import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';

/**
 * City detail page — placeholder for now.
 *
 * Receives the selected city through route params: name, country, latitude
 * and longitude.
 */
export default function CityDetail() {
  const { name, country, latitude, longitude } = useLocalSearchParams<{
    name: string;
    country: string;
    latitude: string;
    longitude: string;
  }>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Retour</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>{name}</Text>
        {country && <Text style={styles.subtitle}>{country}</Text>}
        <Text style={styles.coords}>
          {latitude} / {longitude}
        </Text>
        <Text style={styles.placeholder}>Page de détail à venir…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  back: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backText: {
    color: theme.colors.muted,
    fontSize: 15,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 16,
  },
  coords: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  placeholder: {
    color: theme.colors.muted,
    fontSize: 14,
    marginTop: theme.spacing.lg,
  },
});
