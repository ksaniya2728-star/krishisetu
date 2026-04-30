import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '../../theme';

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  accent?: string;
};

export function SummaryCard({ title, value, subtitle, accent = colors.primary }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: accent }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  title: {
    color: '#EAF6EA',
    fontSize: 14,
    marginBottom: 8,
  },
  value: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#D5EFD8',
    fontSize: 13,
    marginTop: 8,
  },
});

