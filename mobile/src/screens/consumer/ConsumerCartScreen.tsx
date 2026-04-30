import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { consumerService } from '../../services/consumerService';
import { communityAvatars } from '../../constants/mock';
import { colors, radii, spacing, shadows } from '../../theme';

export function ConsumerCartScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
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

  const updateQuantity = async (produceId: string, delta: number) => {
    try {
      await consumerService.addToCart(produceId, delta);
      await loadData();
    } catch (error: any) {
      Alert.alert(t('common.error'), error?.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (produceId: string) => {
    try {
      await consumerService.removeFromCart(produceId);
      await loadData();
    } catch (error: any) {
      Alert.alert(t('common.error'), error?.response?.data?.message || 'Failed to remove item');
    }
  };

  const placeOrder = async () => {
    if (!cart?.items?.length) {
      Alert.alert('Empty Cart', 'Please add items to your cart first.');
      return;
    }
    try {
      const cartItems = (cart?.items || []).map((item: any) => ({
        produceId: item.produceId._id || item.produceId,
        quantity: item.quantity,
      }));
      
      await consumerService.placeOrder({
        cartItems,
        deliveryAddress: 'Green Valley Apartments, Surat',
        paymentMethod: 'COD',
        deliverySlot: 'Tomorrow 9:00 AM - 12:00 PM',
      });
      Alert.alert(t('common.success'), 'Your order has been confirmed.');
      navigation.navigate('ConsumerOrders');
    } catch (error: any) {
      console.error("Payment Error:", error.response?.data || error.message);
      Alert.alert('Order failed', error?.response?.data?.message || 'Please try again.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.title}>{t('cart.title')}</Text>

      {(!cart?.items || cart.items.length === 0) && !refreshing ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color={colors.border} />
          <Text style={styles.emptyText}>{t('cart.empty')}</Text>
          <PrimaryButton 
            title={t('cart.browse')} 
            onPress={() => navigation.navigate('ConsumerHome')} 
            style={{ marginTop: spacing.xl }}
          />
        </View>
      ) : (
        <>
          {(cart?.items || []).map((item: any) => (
            <View key={item._id || item.produceId?._id} style={styles.card}>
              <View style={styles.itemInfo}>
                <Image 
                  source={{ uri: item.produceId?.images?.[0] || 'https://via.placeholder.com/100' }} 
                  style={styles.itemImage} 
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>{item.produceId?.productName || 'Produce'}</Text>
                  <Text style={styles.itemSubtitle}>{item.produceId?.farmerId?.farmName || 'Local Farm'}</Text>
                  <Text style={styles.itemPrice}>₹{item.priceSnapshot} per {item.produceId?.unit || 'kg'}</Text>
                </View>
                <Pressable onPress={() => removeItem(item.produceId._id)} style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>

              <View style={styles.quantityRow}>
                <View style={styles.quantityControls}>
                  <Pressable 
                    onPress={() => updateQuantity(item.produceId._id, -1)} 
                    style={styles.qtyBtn}
                    disabled={item.quantity <= 1}
                  >
                    <Ionicons name="remove" size={20} color={item.quantity <= 1 ? colors.border : colors.primary} />
                  </Pressable>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <Pressable 
                    onPress={() => updateQuantity(item.produceId._id, 1)} 
                    style={styles.qtyBtn}
                  >
                    <Ionicons name="add" size={20} color={colors.primary} />
                  </Pressable>
                </View>
                <Text style={styles.itemTotal}>₹{item.quantity * item.priceSnapshot}</Text>
              </View>
            </View>
          ))}

          <View style={styles.communityCard}>
            <View style={styles.communityHeader}>
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={styles.communityTitle}>Community Basket</Text>
            </View>
            <Text style={styles.communityText}>Join neighbours to reduce delivery cost and unlock bulk pricing.</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progress}>34 kg / 50 kg</Text>
              <Text style={styles.savings}>Save ₹25</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '68%' }]} />
            </View>
            <View style={styles.avatarRow}>
              {communityAvatars.map((uri, i) => (
                <Image key={i} source={{ uri }} style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10 }]} />
              ))}
              <Text style={styles.members}>+ {communityAvatars.length} others</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
              <Text style={styles.summaryValue}>₹{Math.round(cart?.totalAmount || 0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.delivery')}</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>FREE</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('cart.total')}</Text>
              <Text style={styles.totalValue}>₹{Math.round(cart?.totalAmount || 0)}</Text>
            </View>
          </View>

          <PrimaryButton title={t('cart.checkout')} onPress={placeOrder} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 72, paddingBottom: 100 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginBottom: spacing.xl },
  
  card: { backgroundColor: colors.white, borderRadius: radii.xl, marginBottom: spacing.md, padding: spacing.lg, ...shadows.soft },
  itemInfo: { flexDirection: 'row', alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: radii.md, backgroundColor: colors.lightGreen },
  itemDetails: { flex: 1, marginLeft: spacing.md },
  itemTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  itemSubtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
  itemPrice: { color: colors.primary, fontSize: 14, fontWeight: '600', marginTop: 4 },
  removeBtn: { padding: 4 },
  
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGreen, borderRadius: radii.md, padding: 4 },
  qtyBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  quantityText: { color: colors.text, fontSize: 16, fontWeight: '700', marginHorizontal: 12 },
  itemTotal: { color: colors.text, fontSize: 18, fontWeight: '800' },

  communityCard: { backgroundColor: colors.white, borderRadius: radii.xl, marginBottom: spacing.lg, padding: spacing.lg, ...shadows.soft },
  communityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  communityTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginLeft: spacing.sm },
  communityText: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  progress: { color: colors.primary, fontWeight: '700' },
  savings: { color: colors.primary, fontWeight: '700', backgroundColor: colors.lightGreen, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill, fontSize: 12 },
  barTrack: { backgroundColor: colors.lightGreen, borderRadius: radii.pill, height: 8, marginTop: 8, overflow: 'hidden' },
  barFill: { backgroundColor: colors.primary, height: '100%' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  avatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.white },
  members: { color: colors.muted, fontSize: 12, marginLeft: spacing.sm },

  summaryCard: { backgroundColor: colors.white, borderRadius: radii.xl, marginBottom: spacing.xl, padding: spacing.lg, ...shadows.soft },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { color: colors.muted, fontSize: 15 },
  summaryValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  totalLabel: { color: colors.text, fontSize: 18, fontWeight: '800' },
  totalValue: { color: colors.primary, fontSize: 24, fontWeight: '800' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { color: colors.muted, fontSize: 18, fontWeight: '600', marginTop: spacing.md },
});


