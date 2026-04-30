import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing } from '../../theme';

const schema = yup.object({
  phoneOrEmail: yup.string().required('Email or phone is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      phoneOrEmail: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await login(values.phoneOrEmail, values.password);
    } catch (error: any) {
      Alert.alert(t('common.error'), error?.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Fresh harvest marketplace</Text>
      <Text style={styles.title}>{t('auth.welcome')}</Text>
      <Text style={styles.subtitle}>Track produce, orders, delivery, and community baskets.</Text>

      <View style={styles.card}>
        <Controller
          control={control}
          name="phoneOrEmail"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label={t('auth.phone')}
              placeholder="Enter email or phone"
              value={value}
              onChangeText={onChange}
              error={errors.phoneOrEmail?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label={t('auth.password')}
              placeholder="Enter password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />
        <PrimaryButton title={t('auth.loginBtn')} onPress={onSubmit} loading={submitting} />
      </View>

      <Pressable onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>{t('auth.noAccount')} {t('auth.signup')}</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  kicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});

