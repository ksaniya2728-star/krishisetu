import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { colors, radii, spacing, shadows } from '../../theme';
import { Picker } from '@react-native-picker/picker';
import { Switch } from 'react-native';

const schema = yup.object({
  vehicleType: yup.string().required('Vehicle type is required'),
  vehicleNumber: yup.string().required('Vehicle number is required'),
  licenseNumber: yup.string().optional(),
  deliveryRadiusKm: yup.number().typeError('Must be a number').positive().integer().required('Delivery radius is required'),
  availabilityStatus: yup.boolean().default(true),
});

export function DistributorOnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vehicleType: 'bike',
      vehicleNumber: '',
      licenseNumber: '',
      deliveryRadiusKm: 5,
      availabilityStatus: true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await authService.completeOnboarding(values);
      await refreshProfile();
    } catch (error: any) {
      Alert.alert(
        'Onboarding failed',
        error?.response?.data?.message || 'There was an error completing your onboarding.'
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome, {user?.fullName?.split(' ')[0]}!</Text>
      <Text style={styles.subtitle}>Let's set up your distributor profile to start receiving delivery tasks.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        
        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.pickerContainer}>
          <Controller
            control={control}
            name="vehicleType"
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                <Picker.Item label="Bicycle" value="cycle" />
                <Picker.Item label="Bike" value="bike" />
                <Picker.Item label="Scooter" value="scooter" />
                <Picker.Item label="Auto Rickshaw" value="auto" />
                <Picker.Item label="Mini Truck" value="mini_truck" />
              </Picker>
            )}
          />
        </View>
        {errors.vehicleType && <Text style={styles.errorText}>{errors.vehicleType.message}</Text>}

        <Controller
          control={control}
          name="vehicleNumber"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Vehicle Number"
              placeholder="e.g. MH 12 AB 1234"
              value={value}
              onChangeText={onChange}
              error={errors.vehicleNumber?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="licenseNumber"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Driving License Number (Optional)"
              placeholder="e.g. MH12 20110012345"
              value={value}
              onChangeText={onChange}
              error={errors.licenseNumber?.message}
            />
          )}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Work Preferences</Text>
        
        <Controller
          control={control}
          name="deliveryRadiusKm"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Delivery Radius (in km)"
              keyboardType="numeric"
              value={value.toString()}
              onChangeText={onChange}
              error={errors.deliveryRadiusKm?.message}
            />
          )}
        />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Available for Deliveries</Text>
            <Text style={styles.switchSubtext}>You can change this later in your dashboard</Text>
          </View>
          <Controller
            control={control}
            name="availabilityStatus"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            )}
          />
        </View>
      </View>

      <PrimaryButton
        title="Complete Profile"
        onPress={onSubmit}
        loading={submitting}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -8,
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  switchSubtext: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});
