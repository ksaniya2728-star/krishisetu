import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { consumerService } from '../../services/consumerService';
import { communityAvatars } from '../../constants/mock';
import { colors, radii, spacing } from '../../theme';

export function ConsumerCartScreen() {
  const navigation = useNavigation<any>();
  const [cart, setCart] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await consumerService.getCart();
      setCart(result);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const placeOrder = async () => {
    try {
      const cartItems = (cart?.items || []).map((item: any) => ({
        produceId: item.produceId._id || item.produceId,
        quantity: item.quantity,
      }));
      const firstItem = cart?.items?.[0];
      await consumerService.placeOrder({
        cartItems,
        deliveryAddress: 'Green Valley Apartments, Surat',
        paymentMethod: 'COD',
        deliverySlot: 'Tomorrow 9:00 AM - 12:00 PM',
      });
      Alert.alert('Order placed', 'Your order has been confirmed.');
      navigation.navigate('ConsumerOrders');
    } catch (error: any) {
      Alert.alert('Order failed', error?.response?.data?.message || 'Please try again.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.title}>Cart</Text>

      {(cart?.items || []).map((item: any) => (
        <View key={item._id || item.produceId?._id} style={styles.card}>
          <Text style={styles.itemTitle}>{item.produceId?.productName || 'Produce'}</Text>
          <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
          <Text style={styles.itemMeta}>₹{item.priceSnapshot}</Text>
        </View>
      ))}

      <View style={styles.communityCard}>
        <Text style={styles.communityTitle}>Community Basket</Text>
        <Text style={styles.communityText}>Join neighbours to reduce delivery cost and unlock bulk pricing.</Text>
        <Text style={styles.progress}>34 kg / 50 kg</Text>
        <View style={styles.barTrack}>
          <View style={styles.barFill} />
        </View>
        <Text style={styles.members}>Members: {communityAvatars.length}</Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{Math.round(cart?.totalAmount || 0)}</Text>
      </View>

      <PrimaryButton title="Proceed to Pay" onPress={placeOrder} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 72 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', marginBottom: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, marginBottom: spacing.md, padding: spacing.lg },
  itemTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  itemMeta: { color: colors.muted, marginTop: 6 },
  communityCard: { backgroundColor: colors.white, borderRadius: radii.lg, marginBottom: spacing.md, padding: spacing.lg },
  communityTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  communityText: { color: colors.muted, marginTop: 8 },
  progress: { color: colors.primary, fontWeight: '700', marginTop: 12 },
  barTrack: { backgroundColor: colors.lightGreen, borderRadius: radii.pill, height: 10, marginTop: 8, overflow: 'hidden' },
  barFill: { backgroundColor: colors.primary, height: '100%', width: '68%' },
  members: { color: colors.muted, marginTop: 10 },
  totalCard: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  totalLabel: { color: '#D3EFD4', fontSize: 14 },
  totalValue: { color: colors.white, fontSize: 28, fontWeight: '800', marginTop: 6 },
});

