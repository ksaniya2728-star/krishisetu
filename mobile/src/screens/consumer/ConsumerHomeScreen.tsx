import React, { useCallback, useState, useEffect } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ProductCard } from '../../components/product/ProductCard';
import { produceCategories } from '../../constants/mock';
import { consumerService } from '../../services/consumerService';
import { socketService } from '../../services/socketService';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { colors, radii, spacing, shadows } from '../../theme';

export function ConsumerHomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [produce, setProduce] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { location, permissionStatus, loading: locationLoading, error: locationError, refresh: refreshLocation } =
    useCurrentLocation({ auto: true });

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      let params: Record<string, unknown> = {};

      if (location) {
        params = {
          lat: location.latitude,
          lng: location.longitude,
          sort: 'nearest',
        };
      }

      const result = await consumerService.getNearbyProduce(params);
      setProduce(result.produce || []);
    } finally {
      setRefreshing(false);
    }
  }, [location]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  useEffect(() => {
    const unsubscribe = socketService.subscribe('produce:new', () => {
      void loadData();
    });
    return unsubscribe;
  }, [loadData]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.location}>Surat, Gujarat</Text>
      <Text style={styles.title}>{t('dashboard.freshToday')}</Text>

      <TextInput style={styles.search} placeholder={t('dashboard.search')} placeholderTextColor={colors.muted} />

      <View style={styles.promo}>
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Text style={styles.promoTitle}>Harvest fresh today</Text>
          <Text style={styles.promoText}>Shop directly from nearby farmers and save with community baskets.</Text>
        </View>
        <Pressable 
          style={styles.mapBtn} 
          onPress={() => navigation.navigate('NearbyFarmersMap')}
        >
          <Ionicons name="map" size={24} color={colors.primary} />
          <Text style={styles.mapBtnText}>{t('dashboard.map')}</Text>
        </Pressable>
      </View>
      {permissionStatus === 'denied' ? (
        <Text style={styles.locationHint} onPress={() => void refreshLocation()}>
          Location permission denied. Tap to retry for nearby farms.
        </Text>
      ) : locationLoading ? (
        <Text style={styles.locationHint}>Finding farms near you…</Text>
      ) : locationError ? (
        <Text style={styles.locationHint}>{locationError}</Text>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        {produceCategories.map((category) => (
          <Pressable key={category} style={styles.category}>
            <Text style={styles.categoryText}>{category}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {produce.map((item, index) => (
        <ProductCard
          key={item._id}
          image={item.images?.[0] || 'https://via.placeholder.com/150?text=No+Image'}
          title={item.productName}
          subtitle={`${item.farmerId?.farmName || item.farmerId?.fullName} • ${item.category}`}
          price={`₹${item.pricePerKg}/${item.unit}`}
          tag="Fresh today"
          onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
          onAdd={async () => {
            try {
              await consumerService.addToCart(item._id, 1);
              Alert.alert(t('common.success'), 'Item added to cart.');
            } catch (e: any) {
              Alert.alert(t('common.error'), e?.response?.data?.message || 'Please try again.');
            }
          }}
        />
      ))}

      <PrimaryBasketLink onPress={() => navigation.navigate('CommunityBasket')} />
    </ScrollView>
  );
}

function PrimaryBasketLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.basketCard}>
      <Text style={styles.basketTitle}>Community basket</Text>
      <Text style={styles.basketText}>Join neighbours to unlock better prices and a shared delivery slot.</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 72 },
  location: { color: colors.primary, fontWeight: '700' },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 8 },
  search: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  promo: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    marginVertical: spacing.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.soft,
  },
  promoTitle: { color: colors.white, fontSize: 20, fontWeight: '800' },
  promoText: { color: '#D6F2D9', lineHeight: 20, marginTop: 8 },
  mapBtn: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBtnText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  category: {
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryText: { color: colors.text, fontWeight: '700' },
  basketCard: {
    backgroundColor: colors.lightGreen,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
    marginTop: 6,
    padding: spacing.lg,
  },
  basketTitle: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  basketText: { color: colors.primary, marginTop: 8 },
  locationHint: { color: colors.muted, marginBottom: spacing.md, textAlign: 'center' },
});


