import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { colors, radii, spacing } from '../../theme';

export function SplashScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Login'), 1800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoEmoji}>🌱</Text>
      </View>
      <Text style={styles.title}>KrishiSetu</Text>
      <Text style={styles.subtitle}>Bridging farmers, families, and fresh produce.</Text>

      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
        }}
        style={styles.hero}
      />

      <View style={styles.ctaContainer}>
        <PrimaryButton title="Get Started" onPress={() => navigation.replace('RoleSelection')} />
        <View style={{ height: 12 }} />
        <PrimaryButton title="I am a Consumer" onPress={() => navigation.replace('Login')} variant="light" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoCircle: {
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    borderRadius: 44,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  logoEmoji: {
    fontSize: 42,
  },
  title: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  hero: {
    borderRadius: radii.lg,
    height: 280,
    marginTop: spacing.xl,
    width: '100%',
  },
  ctaContainer: {
    marginTop: spacing.xl,
    width: '100%',
  },
});

