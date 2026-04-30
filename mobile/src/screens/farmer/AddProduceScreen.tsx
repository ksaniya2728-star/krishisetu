import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm } from 'react-hook-form';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { farmerService } from '../../services/farmerService';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { colors, radii, spacing } from '../../theme';

export function AddProduceScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { location, permissionStatus, loading: locationLoading, refresh: refreshLocation } = useCurrentLocation();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      productName: '',
      category: 'Vegetables',
      stockQuantity: '25',
      unit: 'kg',
      pricePerKg: '25',
      harvestDate: new Date().toISOString().slice(0, 10),
      description: '',
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);

      let latitude = 23.0225;
      let longitude = 72.5714;

      if (location) {
        latitude = location.latitude;
        longitude = location.longitude;
      }

      const formData = new FormData();
      formData.append('productName', values.productName);
      formData.append('category', values.category);
      formData.append('stockQuantity', values.stockQuantity);
      formData.append('unit', values.unit);
      formData.append('pricePerKg', values.pricePerKg);
      formData.append('harvestDate', values.harvestDate);
      formData.append('description', values.description);
      formData.append('organicCertified', 'true');
      formData.append('availableForBulkOrder', 'true');
      formData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: [longitude, latitude],
      }));

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('image', { uri: imageUri, name: filename, type } as any);
      }

      await farmerService.addProduce(formData);

      Alert.alert('Success', 'Produce posted for sale successfully.');
    } catch (error: any) {
      Alert.alert('Unable to add produce', error?.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Produce</Text>
      <Text style={styles.subtitle}>Upload fresh crop details with market-ready pricing.</Text>

      <Pressable style={styles.imageBox} onPress={pickImage}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : <Text style={styles.imageText}>Add crop image</Text>}
      </Pressable>

      <View style={styles.voiceCard}>
        <Text style={styles.voiceTitle}>Voice notes</Text>
        <Text style={styles.voiceText}>Describe the harvest quality, freshness, and quantity in a short note.</Text>
      </View>
      {permissionStatus === 'denied' ? (
        <Text style={styles.locationHint} onPress={() => void refreshLocation()}>
          Location permission denied. Tap to retry to tag your farm location.
        </Text>
      ) : locationLoading ? (
        <Text style={styles.locationHint}>Fetching farm location…</Text>
      ) : null}

      <View style={styles.formCard}>
        {[
          ['productName', 'Crop name'],
          ['category', 'Category'],
          ['stockQuantity', 'Quantity'],
          ['unit', 'Unit'],
          ['pricePerKg', 'Price per kg'],
          ['harvestDate', 'Harvest date (YYYY-MM-DD)'],
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

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Crop details"
              value={value}
              onChangeText={onChange}
              multiline
              placeholder="Freshly harvested, pesticide-free, ready for delivery..."
            />
          )}
        />
        <Text style={styles.aiPrice}>AI suggested price: ₹{Number(25).toFixed(0)} / kg</Text>
        <PrimaryButton title="Post for Sale" onPress={onSubmit} loading={submitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 72 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.muted, marginTop: 8 },
  imageBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 220,
    justifyContent: 'center',
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  imageText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  preview: { height: '100%', width: '100%' },
  voiceCard: { backgroundColor: colors.white, borderRadius: radii.lg, marginTop: spacing.md, padding: spacing.lg },
  voiceTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  voiceText: { color: colors.muted, marginTop: 8 },
  formCard: { backgroundColor: colors.white, borderRadius: radii.lg, marginTop: spacing.md, padding: spacing.lg },
  aiPrice: { color: colors.secondary, fontSize: 14, fontWeight: '700', marginBottom: spacing.lg },
  locationHint: { color: colors.muted, marginTop: spacing.md, textAlign: 'center' },
});

