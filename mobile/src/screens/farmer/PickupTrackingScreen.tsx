import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { farmerService } from '../../services/farmerService';
import { colors, radii, spacing } from '../../theme';

const timeline = [
  { key: 'accepted', label: 'order confirmed' },
  { key: 'on_route', label: 'pickup on the way' },
  { key: 'picked_up', label: 'picked up' },
  { key: 'on_route_2', label: 'in transit' },
  { key: 'delivered', label: 'delivered' },
];

export function PickupTrackingScreen() {
  const [orders, setOrders] = useState<any[]>([]);
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

  const latestOrder = orders[0];
  const status = latestOrder?.status || 'pending';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.title}>Pickup Status</Text>
      <Text style={styles.subtitle}>Current order: {latestOrder?.orderId || 'No active order yet'}</Text>

      <View style={styles.card}>
        {timeline.map((item, index) => {
          const isActive =
            status === item.key ||
            (status === 'picked_up' && index < 3) ||
            (status === 'delivered' && index < 5) ||
            (status === 'accepted' && index < 1);

          return (
            <View key={item.key} style={styles.row}>
              <View style={[styles.dot, isActive && styles.activeDot]} />
              <Text style={[styles.label, isActive && styles.activeLabel]}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 72 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtitle: { color: colors.muted, marginTop: 8 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, marginTop: spacing.xl, padding: spacing.lg },
  row: { alignItems: 'center', flexDirection: 'row', marginBottom: 18 },
  dot: { backgroundColor: colors.border, borderRadius: 10, height: 20, marginRight: 14, width: 20 },
  activeDot: { backgroundColor: colors.primary },
  label: { color: colors.muted, fontSize: 15, textTransform: 'capitalize' },
  activeLabel: { color: colors.text, fontWeight: '700' },
});

