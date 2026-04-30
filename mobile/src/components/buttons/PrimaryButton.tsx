import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import { colors, radii } from '../../theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'solid' | 'light';
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ title, onPress, loading, variant = 'solid', style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, variant === 'light' ? styles.lightButton : styles.solidButton, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'light' ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, variant === 'light' ? styles.lightText : styles.solidText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radii.lg,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  solidButton: {
    backgroundColor: colors.primary,
  },
  lightButton: {
    backgroundColor: colors.lightGreen,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  solidText: {
    color: colors.white,
  },
  lightText: {
    color: colors.primary,
  },
});

