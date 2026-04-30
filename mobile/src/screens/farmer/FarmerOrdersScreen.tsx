import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { farmerService } from '../../services/farmerService';
import { colors, radii, spacing } from '../../theme';

const tabs = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Confirmed' },
  { key: 'picked_up', label: 'Picked' },
  { key: 'delivered', label: 'Completed' },
];

export function FarmerOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await farmerService.getOrders();
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

  const filtered = useMemo(
    () => orders.filter((order) => (activeTab === 'accepted' ? order.status === 'accepted' : order.status === activeTab)),
    [orders, activeTab]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.title}>My Orders</Text>
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Text
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          >
            {tab.label}
          </Text>
        ))}
      </View>

      {filtered.map((order) => (
        <View key={order._id} style={styles.card}>
          <Text style={styles.orderId}>{order.orderId}</Text>
          <Text style={styles.meta}>{order.consumerId?.fullName}</Text>
          <Text style={styles.meta}>{order.deliveryAddress}</Text>
          <Text style={styles.status}>{order.status.replace('_', ' ')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 72 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: spacing.lg },
  tab: {
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    color: colors.muted,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  activeTab: { backgroundColor: colors.primary, color: colors.white, fontWeight: '700' },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, marginBottom: spacing.md, padding: spacing.lg },
  orderId: { color: colors.text, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.muted, marginTop: 6 },
  status: { color: colors.secondary, fontWeight: '700', marginTop: 10, textTransform: 'capitalize' },
});

