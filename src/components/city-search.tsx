import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { SearchBar } from '@/components/search-bar';
import { searchCities, type CityResult } from '@/lib/location/geocoding';
import { theme } from '@/theme';

type CitySearchProps = {
  onSelectCity: (city: CityResult) => void;
};

const DEBOUNCE_MS = 300;

export function CitySearch({ onSelectCity }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const cities = await searchCities(query);
        if (!cancelled) {
          setResults(cities);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function handleSelect(city: CityResult) {
    setQuery('');
    setResults([]);
    onSelectCity(city);
  }

  return (
    <View>
      <SearchBar value={query} onChangeText={setQuery} />

      {(results.length > 0 || searching) && (
        <View style={styles.dropdown}>
          {searching && results.length === 0 && (
            <ActivityIndicator style={styles.spinner} color={theme.colors.muted} />
          )}
          {results.map((city, index) => (
            <Pressable
              key={city.id}
              onPress={() => handleSelect(city)}
              style={({ pressed }) => [
                styles.item,
                index < results.length - 1 && styles.itemBorder,
                pressed && styles.itemPressed,
              ]}
            >
              <Text style={styles.name}>{city.name}</Text>
              <Text style={styles.detail}>
                {[city.region, city.country].filter(Boolean).join(', ')}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
    overflow: 'hidden',
  },
  spinner: {
    paddingVertical: theme.spacing.md,
  },
  item: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: 2,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemPressed: {
    backgroundColor: theme.colors.cardAlt,
  },
  name: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  detail: {
    color: theme.colors.muted,
    fontSize: 13,
  },
});
