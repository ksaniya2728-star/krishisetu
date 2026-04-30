import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { colors, radii, spacing } from '../../theme';

const schema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Enter a valid email').optional(),
  phoneNumber: yup.string().min(10, 'Enter a valid phone').required('Phone is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm password'),
  role: yup.mixed<'farmer' | 'consumer' | 'distributor'>().oneOf(['farmer', 'consumer', 'distributor']).required(),
});

export function SignupScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { signup } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: (route.params?.initialRole || 'farmer') as 'farmer' | 'consumer' | 'distributor',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await signup({
        fullName: values.fullName,
        email: values.email || undefined,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: values.role,
      });
    } catch (error: any) {
      Alert.alert('Signup failed', error?.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Join as a farmer or consumer and continue to onboarding.</Text>

      <View style={styles.card}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <FormInput label="Full name" value={value} onChangeText={onChange} error={errors.fullName?.message} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <FormInput label="Email" value={value} onChangeText={onChange} error={errors.email?.message} />
          )}
        />
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, value } }) => (
            <FormInput label="Phone" value={value} onChangeText={onChange} error={errors.phoneNumber?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Confirm password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <Text style={styles.roleLabel}>Choose role</Text>
        <View style={styles.roleRow}>
          {[
            { label: 'I am a Farmer', value: 'farmer' },
            { label: 'I am a Consumer', value: 'consumer' },
            { label: 'I am a Distributor', value: 'distributor' },
          ].map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setValue('role', option.value as 'farmer' | 'consumer' | 'distributor')}
              style={[
                styles.roleCard,
                selectedRole === option.value && styles.roleCardSelected,
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  selectedRole === option.value && styles.roleTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton title="Sign Up" onPress={onSubmit} loading={submitting} />
      </View>

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </Pressable>
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
    paddingTop: 72,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  roleLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  roleCard: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  roleCardSelected: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.primary,
  },
  roleText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  roleTextSelected: {
    color: colors.primary,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginVertical: spacing.lg,
    textAlign: 'center',
  },
});

