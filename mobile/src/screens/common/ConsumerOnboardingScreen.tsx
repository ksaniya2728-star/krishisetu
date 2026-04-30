import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import * as Location from 'expo-location';
import { useAuth } from '../../hooks/useAuth';
import { colors, radii, spacing } from '../../theme';

export function ConsumerOnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      apartmentName: '',
      address: '',
      preferredDeliverySlot: 'Tomorrow 9:00 AM - 12:00 PM',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);

      // Fetch location coordinates safely
      let currentLocation = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          currentLocation = await Location.getCurrentPositionAsync({});
        }
      } catch (err) {
        console.warn('Error fetching location:', err);
      }

      await completeOnboarding({
        role: 'consumer',
        apartmentName: values.apartmentName,
        preferredDeliverySlot: values.preferredDeliverySlot,
        location: {
          village: "",
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          coordinates: {
            latitude: currentLocation?.coords?.latitude ?? null,
            longitude: currentLocation?.coords?.longitude ?? null,
          },
        },
      });
    } catch (error: any) {
      Alert.alert('Onboarding failed', error?.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Consumer onboarding</Text>
      <Text style={styles.subtitle}>Set your delivery preferences and community details.</Text>
      <View style={styles.card}>
        {[
          ['apartmentName', 'Apartment / community'],
          ['address', 'Delivery address'],
          ['preferredDeliverySlot', 'Preferred delivery slot'],
          ['city', 'City'],
          ['state', 'State'],
          ['pincode', 'Pincode'],
        ].map(([name, label]) => (
          <Controller
            key={name}
            control={control}
            name={name as any}
            render={({ field: { onChange, value } }) => (
              <FormInput label={label} value={value} onChangeText={onChange} />
            )}
          />
        ))}
        <PrimaryButton title="Finish onboarding" onPress={onSubmit} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 72 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.muted, marginTop: 8 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, marginTop: spacing.xl, padding: spacing.lg },
});

