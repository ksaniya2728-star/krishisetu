import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '../../theme';

type Props = {
  image: string;
  title: string;
  subtitle: string;
  price: string;
  tag?: string;
  onPress?: () => void;
  onAdd?: () => void;
};

export function ProductCard({ image, title, subtitle, price, tag, onPress, onAdd }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.title}>{title}</Text>
          {tag ? <Text style={styles.tag}>{tag}</Text> : null}
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{price}</Text>
          <Pressable onPress={onAdd} style={styles.addButton}>
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: {
    height: 130,
    width: '100%',
  },
  content: {
    padding: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  tag: {
    backgroundColor: colors.lightGreen,
    borderRadius: radii.pill,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  price: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addText: {
    color: colors.white,
    fontWeight: '700',
  },
});

