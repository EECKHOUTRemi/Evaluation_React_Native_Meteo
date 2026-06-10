import { StyleSheet, Text, View } from 'react-native';

import { describeWeather } from '@/lib/weather-codes';
import type { HomeWeather } from '@/lib/weather';
import { theme } from '@/theme';

type CurrentWeatherCardProps = {
  placeName: string;
  weather: HomeWeather;
};

/**
 * Formats an Open-Meteo local timestamp ("2026-06-10T10:30") as
 * "Aujourd'hui 10:30" when the date is today, "10/06/2026 10:30" otherwise.
 */
function formatUpdatedAt(isoTime: string): string {
  const [date, time] = isoTime.split('T');
  if (!time) {
    return isoTime;
  }

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  if (date === today) {
    return `Aujourd'hui ${time}`;
  }

  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time}`;
}

export function CurrentWeatherCard({ placeName, weather }: CurrentWeatherCardProps) {
  const { current, current_units, daily } = weather;
  const { label, icon } = describeWeather(current.weather_code);

  const tempUnit = current_units.temperature_2m;
  const max = Math.round(daily.temperature_2m_max[0]);
  const min = Math.round(daily.temperature_2m_min[0]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.pin}>📍 Ma position</Text>
        <Text style={styles.place}>{placeName}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.tempBlock}>
          <Text style={styles.temp}>
            {Math.round(current.temperature_2m)}°
          </Text>
          <Text style={styles.description}>{label}</Text>
          <Text style={styles.feels}>
            Ressenti : {Math.round(current.apparent_temperature)}°
          </Text>
        </View>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.minMax}>
          Min {min}{tempUnit}   |   Max {max}{tempUnit}
        </Text>
        <Text style={styles.updatedAt}>
          Dernière mise à jour : {formatUpdatedAt(current.time)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardAlt,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: {
    gap: 2,
  },
  pin: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  place: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tempBlock: {
    gap: 2,
  },
  temp: {
    color: theme.colors.text,
    fontSize: 64,
    fontWeight: '200',
    lineHeight: 70,
  },
  description: {
    color: theme.colors.text,
    fontSize: 16,
  },
  feels: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  icon: {
    fontSize: 64,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  minMax: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  updatedAt: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
});
