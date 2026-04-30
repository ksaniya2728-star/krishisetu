import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { FormInput } from '../../components/FormInput';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { farmerService } from '../../services/farmerService';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { colors, radii, spacing, shadows } from '../../theme';

export function AddProduceScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { location, permissionStatus, loading: locationLoading, refresh: refreshLocation } = useCurrentLocation();
  
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      productName: '',
      category: 'Vegetables',
      stockQuantity: '',
      unit: 'kg',
      pricePerKg: '',
      harvestDate: new Date().toISOString().slice(0, 10),
      description: '',
    },
  });

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need camera roll permissions to upload crop images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6, // Lower quality for faster upload
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to pick image');
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!imageUri) {
      Alert.alert('Image required', 'Please add an image of your crop.');
      return;
    }

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

      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      // @ts-ignore
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });

      await farmerService.addProduce(formData);

      Alert.alert('Success', 'Produce posted for sale successfully.');
      reset();
      setImageUri(null);
    } catch (error: any) {
      console.error('Add Produce Error:', error?.response?.data || error.message);
      Alert.alert('Unable to add produce', error?.response?.data?.message || 'Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Post New Crop</Text>
      <Text style={styles.subtitle}>List your fresh harvest for consumers and bulk buyers.</Text>

      <View style={styles.imageSection}>
        <Pressable style={styles.imageBox} onPress={pickImage}>
          {imageUri ? (
            <View style={{ width: '100%', height: '100%' }}>
              <Image source={{ uri: imageUri }} style={styles.preview} />
              <Pressable style={styles.removeBadge} onPress={() => setImageUri(null)}>
                <Ionicons name="close" size={20} color={colors.white} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.placeholderBox}>
              <View style={styles.iconCircle}>
                <Ionicons name="camera" size={32} color={colors.primary} />
              </View>
              <Text style={styles.imageText}>Add Crop Image</Text>
              <Text style={styles.imageSubtext}>JPG or PNG (max 5MB)</Text>
            </View>
          )}
        </Pressable>
      </View>

      {permissionStatus === 'denied' ? (
        <View style={styles.locationAlert}>
          <Ionicons name="location-outline" size={20} color={colors.danger} />
          <Text style={styles.locationErrorText} onPress={() => void refreshLocation()}>
            Location access denied. Tap to retry.
          </Text>
        </View>
      ) : locationLoading ? (
        <View style={styles.locationLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.locationHint}>Tagging farm location…</Text>
        </View>
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
  content: { padding: spacing.xl, paddingTop: 72, paddingBottom: 100 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.muted, marginTop: 8, fontSize: 14, lineHeight: 20 },
  
  imageSection: { marginTop: spacing.xl },
  imageBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    height: 220,
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
  placeholderBox: { alignItems: 'center' },
  iconCircle: { width: 64, height: 64, backgroundColor: colors.lightGreen, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  imageText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  imageSubtext: { color: colors.muted, fontSize: 12, marginTop: 4 },
  preview: { height: '100%', width: '100%' },
  removeBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  voiceCard: { backgroundColor: colors.white, borderRadius: radii.lg, marginTop: spacing.md, padding: spacing.lg },
  voiceTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  voiceText: { color: colors.muted, marginTop: 8 },
  formCard: { backgroundColor: colors.white, borderRadius: radii.lg, marginTop: spacing.md, padding: spacing.lg },
  aiPrice: { color: colors.secondary, fontSize: 14, fontWeight: '700', marginBottom: spacing.lg },
  
  locationAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F0', padding: 12, borderRadius: radii.md, marginTop: spacing.md, gap: 8 },
  locationErrorText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  locationLoading: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: 8, justifyContent: 'center' },
  locationHint: { color: colors.muted, fontSize: 13 },
});

