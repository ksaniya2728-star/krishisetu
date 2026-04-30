import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { consumerService } from '../../services/consumerService';
import { colors, radii, spacing } from '../../theme';

export function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>(null);

  const loadData = useCallback(async () => {
    const result = await consumerService.getProductDetail(route.params.productId);
    setData(result);
  }, [route.params.productId]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const product = data?.product;
  const farmer = data?.farmer;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image
        source={{
          uri:
            product?.images?.[0] ||
            'https://images.unsplash.com/photo-1546470427-e5ac89cd0b71?auto=format&fit=crop&w=1000&q=80',
        }}
        style={styles.image}
      />
      <Text style={styles.title}>{product?.productName || 'Produce'}</Text>
      <Text style={styles.farmer}>{farmer?.farmName || farmer?.fullName}</Text>
      <Text style={styles.price}>₹{product?.pricePerKg || 0}/{product?.unit || 'kg'}</Text>

      <View style={styles.tagsRow}>
        <Text style={styles.tag}>Fresh harvest</Text>
        <Text style={styles.tag}>Near you</Text>
        <Text style={styles.tag}>Farm direct</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{product?.description || 'Fresh produce sourced directly from the farmer.'}</Text>
      </View>

      <PrimaryButton
        title="Add to Cart"
        onPress={async () => {
          try {
            await consumerService.addToCart(route.params.productId, 1);
            Alert.alert('Added', 'Item added to cart successfully.');
            navigation.navigate('ConsumerCart');
          } catch (error: any) {
            Alert.alert('Unable to add', error?.response?.data?.message || 'Please try again.');
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 48 },
  image: { borderRadius: radii.lg, height: 260, width: '100%' },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: spacing.lg },
  farmer: { color: colors.muted, marginTop: 8 },
  price: { color: colors.primary, fontSize: 28, fontWeight: '800', marginTop: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: spacing.lg },
  tag: {
    backgroundColor: colors.lightGreen,
    borderRadius: radii.pill,
    color: colors.primary,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, marginBottom: spacing.lg, padding: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  description: { color: colors.muted, lineHeight: 22 },
});

