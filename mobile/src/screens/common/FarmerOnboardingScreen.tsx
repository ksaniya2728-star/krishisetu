import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { AppMap } from '../../components/common/AppMap';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentLocation, type LatLng } from '../../hooks/useCurrentLocation';
import { colors, radii, spacing } from '../../theme';

const produceTypeOptions = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Dairy',
  'Flowers',
  'Organic Produce',
  'Others',
] as const;

type FormValues = {
  farmName: string;
  produceTypes: string[];
  farmAddress: string;
  landSize: string;
  landUnit: 'acres' | 'hectares';
  pickupFullAddress: string;
  pickupVillage: string;
  pickupCity: string;
  pickupState: string;
  pickupPincode: string;
  pickupLandmark: string;
  pickupLocation: LatLng | null;
  village: string;
  city: string;
  state: string;
  pincode: string;
};

export function FarmerOnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { location, permissionStatus, refresh: refreshLocation, loading: locationLoading } = useCurrentLocation();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      farmName: '',
      produceTypes: [] as string[],
      farmAddress: '',
      landSize: '',
      landUnit: 'acres',
      pickupFullAddress: '',
      pickupVillage: '',
      pickupCity: '',
      pickupState: '',
      pickupPincode: '',
      pickupLandmark: '',
      pickupLocation: null,
      village: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);

      await completeOnboarding({
        role: 'farmer',
        farmName: values.farmName,
        produceTypes: values.produceTypes,
        farmAddress: values.farmAddress,
        landSize: values.landSize ? Number(values.landSize) : null,
        landUnit: values.landUnit,
        pickupAddress: {
          fullAddress: values.pickupFullAddress,
          village: values.pickupVillage,
          city: values.pickupCity,
          state: values.pickupState,
          pincode: values.pickupPincode,
          landmark: values.pickupLandmark,
        },
        pickupLocation: values.pickupLocation || location || null,
        location: {
          village: values.village,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
        },
      });
    } catch (error: any) {
      Alert.alert('Onboarding failed', error?.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  });

  const mapInitialRegion = useMemo(() => {
    const lat = location?.latitude ?? 23.0225;
    const lng = location?.longitude ?? 72.5714;
    return { latitude: lat, longitude: lng, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  }, [location]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Farmer onboarding</Text>
      <Text style={styles.subtitle}>Tell us about your farm so your dashboard and produce listings are ready.</Text>
      <View style={styles.card}>
        <Controller
          control={control}
          name="farmName"
          render={({ field: { onChange, value } }) => (
            <FormInput label="Farm name" value={value} onChangeText={onChange} />
          )}
        />

        <Text style={styles.sectionTitle}>Produce types</Text>
        <Controller
          control={control}
          name="produceTypes"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pills}>
              {produceTypeOptions.map((opt) => {
                const selected = value.includes(opt);
                return (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      const next = selected ? value.filter((v) => v !== opt) : [...value, opt];
                      onChange(next);
                    }}
                    style={[styles.pill, selected && styles.pillSelected]}
                  >
                    <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        <Controller
          control={control}
          name="farmAddress"
          render={({ field: { onChange, value } }) => (
            <FormInput label="Farm address" value={value} onChangeText={onChange} />
          )}
        />

        <Text style={styles.sectionTitle}>Land size</Text>
        <Controller
          control={control}
          name="landSize"
          render={({ field: { onChange, value } }) => (
            <FormInput label="How much land do you own? (number)" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={control}
          name="landUnit"
          render={({ field: { onChange, value } }) => (
            <View style={styles.unitRow}>
              {[
                { label: 'Acres', val: 'acres' },
                { label: 'Hectares', val: 'hectares' },
              ].map((u) => (
                <Pressable
                  key={u.val}
                  onPress={() => onChange(u.val)}
                  style={[styles.unitButton, value === u.val && styles.unitButtonSelected]}
                >
                  <Text style={[styles.unitText, value === u.val && styles.unitTextSelected]}>{u.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        />

        <Text style={styles.sectionTitle}>Main selling point / pickup address</Text>
        <Controller
          control={control}
          name="pickupFullAddress"
          render={({ field: { onChange, value } }) => (
            <FormInput label="Full address" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={control}
          name="pickupLandmark"
          render={({ field: { onChange, value } }) => (
            <FormInput label="Landmark" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={control}
          name="pickupVillage"
          render={({ field: { onChange, value } }) => (
            <FormInput label="Village" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={control}
          name="pickupCity"
          render={({ field: { onChange, value } }) => (
            <FormInput label="City" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={control}
          name="pickupState"
          render={({ field: { onChange, value } }) => (
            <FormInput label="State" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={control}
          name="pickupPincode"
          render={({ field: { onChange, value } }) => (
            <FormInput label="Pincode" value={value} onChangeText={onChange} />
          )}
        />

        <Text style={styles.sectionTitle}>Map pin location</Text>
        <Controller
          control={control}
          name="pickupLocation"
          render={({ field: { onChange, value } }) => (
            <>
              <AppMap
                loading={locationLoading}
                permissionDenied={permissionStatus === 'denied'}
                onRetry={() => void refreshLocation()}
                initialRegion={mapInitialRegion}
                markers={
                  value
                    ? [{ id: 'pickup', coordinate: value, title: 'Pickup point', pinColor: colors.primary }]
                    : location
                      ? [{ id: 'pickup', coordinate: location, title: 'Pickup point', pinColor: colors.primary }]
                      : []
                }
                onPressCoordinate={(c) => onChange(c)}
              />
              <PrimaryButton
                title="Use current location"
                variant="light"
                onPress={() => {
                  if (location) onChange(location);
                  else void refreshLocation();
                }}
              />
            </>
          )}
        />

        <Text style={styles.sectionTitle}>Farm location</Text>
        {[
          ['village', 'Village'],
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
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 10, marginTop: spacing.md },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.md },
  pill: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pillSelected: { backgroundColor: colors.lightGreen, borderColor: colors.primary },
  pillText: { color: colors.muted, fontWeight: '700' },
  pillTextSelected: { color: colors.primary },
  unitRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.md },
  unitButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  unitButtonSelected: { backgroundColor: colors.lightGreen, borderColor: colors.primary },
  unitText: { textAlign: 'center', color: colors.muted, fontWeight: '800' },
  unitTextSelected: { color: colors.primary },
});

