import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing } from '../theme';

type Props = {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
};

export function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  multiline,
  error,
  keyboardType,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.multiline, error && styles.errorBorder]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  errorBorder: {
    borderColor: colors.danger,
  },
});

