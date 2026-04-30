import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { consumerService } from '../../services/consumerService';
import { colors, radii, spacing, shadows } from '../../theme';

export function ConsumerOrdersScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await consumerService.getOrderHistory();
      setOrders(result.orders || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return colors.primary;
      case 'cancelled': return colors.danger;
      case 'in_transit': return colors.warning;
      case 'picked_up': return colors.secondary || '#4CAF50';
      case 'accepted': return '#2196F3';
      default: return colors.muted;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.title}>{t('orders.title')}</Text>

      {orders.length === 0 && !refreshing ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color={colors.border} />
          <Text style={styles.emptyText}>{t('orders.empty')}</Text>
          <Text style={styles.emptySubtext}>Your fresh produce orders will appear here.</Text>
        </View>
      ) : null}

      {orders.map((order) => {
        const statusColor = getStatusColor(order.status);
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        });

        return (
          <Pressable 
            key={order._id} 
            style={styles.card}
            onPress={() => navigation.navigate('OrderTracking', { orderId: order._id })}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderId}>{order.orderId}</Text>
                <Text style={styles.orderDate}>{orderDate}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{order.status?.replace('_', ' ').toUpperCase() || 'PENDING'}</Text>
              </View>
            </View>

            <View style={styles.farmerInfo}>
              <Ionicons name="leaf-outline" size={16} color={colors.primary} />
              <Text style={styles.farmerName}>{order.farmerId?.farmName || order.farmerId?.fullName || 'Local Farmer'}</Text>
            </View>

            <View style={styles.itemsContainer}>
              {order.items?.map((item: any, idx: number) => (
                <View key={idx} style={styles.itemRow}>
                  <Image 
                    source={{ uri: item.produceId?.images?.[0] || 'https://via.placeholder.com/100' }} 
                    style={styles.itemImage} 
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle}>{item.produceId?.productName || 'Fresh Produce'}</Text>
                    <Text style={styles.itemMeta}>{item.quantity} {item.produceId?.unit || 'kg'} • ₹{item.price}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.totalLabel}>{t('orders.total')}</Text>
                <Text style={styles.totalValue}>₹{order.totalAmount || order.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0}</Text>
              </View>
              <View style={styles.trackBtn}>
                <Text style={styles.trackBtnText}>{t('orders.track')}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 72, paddingBottom: 100 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginBottom: spacing.xl },
  
  card: { 
    backgroundColor: colors.white, 
    borderRadius: radii.xl, 
    marginBottom: spacing.lg, 
    padding: spacing.lg,
    ...shadows.soft
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderId: { color: colors.text, fontSize: 16, fontWeight: '800' },
  orderDate: { color: colors.muted, fontSize: 13, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
    alignSelf: 'flex-start',
  },
  farmerName: { color: colors.primary, fontSize: 12, fontWeight: '700', marginLeft: 4 },

  itemsContainer: {
    marginTop: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: radii.md,
    backgroundColor: colors.lightGreen,
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  itemMeta: { color: colors.muted, fontSize: 14, marginTop: 2 },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { color: colors.muted, fontSize: 12 },
  totalValue: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 2 },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: spacing.md },
  emptySubtext: { color: colors.muted, marginTop: spacing.sm, textAlign: 'center' },
});


