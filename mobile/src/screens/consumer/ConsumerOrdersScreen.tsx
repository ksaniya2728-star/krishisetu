import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { consumerService } from '../../services/consumerService';
import { colors, radii, spacing, shadows } from '../../theme';

export function ConsumerOrdersScreen() {
  const navigation = useNavigation<any>();
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
      default: return colors.muted;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.title}>My Orders</Text>

      {orders.length === 0 && !refreshing ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={colors.border} />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Your fresh produce orders will appear here.</Text>
        </View>
      ) : null}

      {orders.map((order) => {
        const statusColor = getStatusColor(order.status);
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        });

        // Calculate total items
        const totalItems = order.items?.reduce((acc: number, curr: any) => acc + curr.quantity, 0) || 0;
        
        // Get primary item image or fallback
        const primaryItem = order.items?.[0];
        const itemImage = primaryItem?.produceId?.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';

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
                <Text style={[styles.statusText, { color: statusColor }]}>{order.status?.toUpperCase() || 'PENDING'}</Text>
              </View>
            </View>

            <View style={styles.itemRow}>
              <Image source={{ uri: itemImage }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>
                  {primaryItem?.produceId?.productName || 'Fresh Produce'} 
                  {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}
                </Text>
                <Text style={styles.itemMeta}>{totalItems} items • ₹{order.totalAmount || '---'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 60, paddingBottom: 100 },
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  orderId: { color: colors.text, fontSize: 16, fontWeight: '800' },
  orderDate: { color: colors.muted, fontSize: 13, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.lightGreen,
    marginRight: spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  itemMeta: { color: colors.muted, fontSize: 13, marginTop: 4 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.md },
  emptySubtext: { color: colors.muted, marginTop: spacing.sm, textAlign: 'center' },
});

