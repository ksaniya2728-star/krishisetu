import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { socketService } from '../../services/socketService';
import { DeliveryMap } from '../../components/maps/DeliveryMap';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { colors, radii, spacing, shadows } from '../../theme';

// ---------- Incentive timer hook ----------
function useIncentiveTimer(delivery: any) {
  const [timeLeft, setTimeLeft] = useState('');
  const [incentive, setIncentive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!delivery?.acceptedAt || delivery.status === 'delivered') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const base = delivery.baseIncentive || 100;
    const decay = delivery.decayRatePerBlock || 10;
    const minimum = delivery.minimumIncentive || 20;
    const totalMinutes = delivery.deliveryTimeMinutes || 30;
    const acceptedAt = new Date(delivery.acceptedAt).getTime();
    const deadline = acceptedAt + totalMinutes * 60000;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, deadline - now);
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs.toString().padStart(2, '0')}s`);

      const elapsed = (now - acceptedAt) / 60000;
      if (elapsed <= 15) {
        setIncentive(base);
      } else {
        const blocks = Math.floor((elapsed - 15) / 5);
        setIncentive(Math.max(base - decay * blocks, minimum));
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [delivery?.acceptedAt, delivery?.status]);

  return { timeLeft, incentive };
}

// ---------- Delivery Card ----------
function DeliveryCard({ item, onAction, myLocation }: any) {
  const { timeLeft, incentive } = useIncentiveTimer(item);
  const isActive = item.status === 'accepted' || item.status === 'picked_up';
  
  const farmerLoc = item.orderId?.farmerId?.pickupLocation || item.orderId?.farmerId?.location?.coordinates || null;
  const consumerLoc = item.orderId?.consumerId?.location?.coordinates || null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>{item.orderId?.orderId || 'Order'}</Text>
          <Text style={styles.orderAmount}>₹{item.orderId?.totalAmount || '—'}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'delivered' && styles.completedBadge]}>
          <Text style={[styles.statusText, item.status === 'delivered' && styles.completedText]}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Route info */}
      <View style={styles.routeSection}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>PICKUP</Text>
            <Text style={styles.routeValue}>
              {item.orderId?.farmerId?.fullName || 'Farmer'} — {item.orderId?.farmerId?.farmAddress || 'Farm'}
            </Text>
          </View>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: '#F57C00' }]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>DROPOFF</Text>
            <Text style={styles.routeValue}>
              {item.orderId?.consumerId?.fullName || 'Consumer'} — {item.orderId?.deliveryAddress || 'Address'}
            </Text>
          </View>
        </View>
      </View>

      {/* Map for active delivery */}
      {isActive && farmerLoc && consumerLoc && (
        <View style={styles.miniMap}>
          <DeliveryMap
            farmer={{ latitude: farmerLoc.latitude || 23.0225, longitude: farmerLoc.longitude || 72.5714 }}
            consumer={{ latitude: consumerLoc.latitude || 23.0302, longitude: consumerLoc.longitude || 72.5808 }}
            distributor={myLocation || undefined}
          />
        </View>
      )}

      {/* Timer & Incentive for active deliveries */}
      {isActive && item.acceptedAt && (
        <View style={styles.timerContainer}>
          <View style={styles.timerBox}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={styles.timerLabel}>Time Left</Text>
            <Text style={styles.timerValue}>{timeLeft}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.timerBox}>
            <Ionicons name="cash-outline" size={18} color={colors.primary} />
            <Text style={styles.timerLabel}>Incentive</Text>
            <Text style={styles.incentiveValue}>₹{incentive}</Text>
          </View>
        </View>
      )}

      {/* Completed incentive */}
      {item.status === 'delivered' && (
        <View style={styles.completedIncentive}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={styles.completedIncentiveText}>Earned ₹{item.currentIncentive || 0}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {item.status === 'assigned' && (
          <View style={styles.actionRow}>
            <Pressable style={styles.rejectBtn} onPress={() => Alert.alert('Info', 'Rejection flow not yet implemented')}>
              <Ionicons name="close" size={20} color={colors.danger} />
              <Text style={styles.rejectText}>Reject</Text>
            </Pressable>
            <Pressable style={styles.acceptBtn} onPress={() => onAction(item.orderId?._id, 'accept')}>
              <Ionicons name="checkmark" size={20} color={colors.white} />
              <Text style={styles.acceptText}>Accept</Text>
            </Pressable>
          </View>
        )}
        {item.status === 'accepted' && (
          <Pressable style={styles.actionBtn} onPress={() => onAction(item.orderId?._id, 'pickup')}>
            <Ionicons name="bag-handle-outline" size={18} color={colors.white} />
            <Text style={styles.actionBtnText}>Mark Picked Up</Text>
          </Pressable>
        )}
        {item.status === 'picked_up' && (
          <Pressable style={[styles.actionBtn, { backgroundColor: '#F57C00' }]} onPress={() => onAction(item.orderId?._id, 'delivered')}>
            <Ionicons name="checkmark-done" size={18} color={colors.white} />
            <Text style={styles.actionBtnText}>Mark Delivered</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ---------- Main Screen ----------
export function DistributorDeliveriesScreen() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const { location } = useCurrentLocation();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/distributor/deliveries');
      setDeliveries(data.deliveries || []);
    } catch (e: any) {
      console.error('Distributor deliveries error:', e.config?.url, e.response?.status);
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    const unsubs = [
      socketService.subscribe('delivery_accepted', () => void load()),
      socketService.subscribe('new_delivery_assigned', () => void load()),
      socketService.subscribe('delivery_completed', () => void load()),
    ];
    return () => unsubs.forEach(fn => fn());
  }, [load]);

  const handleAction = async (id: string, action: string) => {
    try {
      await api.put(`/distributor/${action}/${id}`);
      if (action === 'delivered') {
        Alert.alert('🎉 Delivered!', 'Incentive has been added to your wallet.');
      }
      await load();
    } catch (e: any) {
      console.error('Action error:', e.config?.url, e.response?.status);
      Alert.alert('Error', e?.response?.data?.message || 'Action failed');
    }
  };

  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const historyDeliveries = deliveries.filter(d => d.status === 'delivered');
  const display = tab === 'active' ? activeDeliveries : historyDeliveries;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deliveries</Text>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable style={[styles.tab, tab === 'active' && styles.activeTab]} onPress={() => setTab('active')}>
          <Text style={[styles.tabText, tab === 'active' && styles.activeTabText]}>
            Active ({activeDeliveries.length})
          </Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'history' && styles.activeTab]} onPress={() => setTab('history')}>
          <Text style={[styles.tabText, tab === 'history' && styles.activeTabText]}>
            History ({historyDeliveries.length})
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={display}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        onRefresh={load}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name={tab === 'active' ? 'bicycle-outline' : 'time-outline'} size={56} color={colors.border} />
            <Text style={styles.emptyText}>{tab === 'active' ? 'No active deliveries' : 'No delivery history'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <DeliveryCard item={item} onAction={handleAction} myLocation={location} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, padding: spacing.xl, paddingTop: 60 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.md },

  tabRow: { flexDirection: 'row', marginBottom: spacing.lg, backgroundColor: colors.white, borderRadius: radii.lg, padding: 4, ...shadows.soft },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: radii.md },
  activeTab: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.muted },
  activeTabText: { color: colors.white },

  card: { backgroundColor: colors.white, borderRadius: radii.xl, marginBottom: spacing.lg, padding: spacing.lg, ...shadows.soft },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  orderId: { fontSize: 18, fontWeight: '800', color: colors.text },
  orderAmount: { fontSize: 14, color: colors.muted, marginTop: 2, fontWeight: '600' },
  statusBadge: { backgroundColor: colors.lightGreen, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill },
  statusText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  completedBadge: { backgroundColor: '#E8F5E9' },
  completedText: { color: '#2E7D32' },

  routeSection: { marginBottom: spacing.md },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, marginRight: spacing.sm },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 1 },
  routeValue: { fontSize: 14, color: colors.text, fontWeight: '500', marginTop: 2 },
  routeLine: { width: 2, height: 16, backgroundColor: colors.border, marginLeft: 5, marginVertical: 2 },

  miniMap: { height: 160, borderRadius: radii.lg, overflow: 'hidden', marginBottom: spacing.md },

  timerContainer: { flexDirection: 'row', backgroundColor: colors.lightGreen, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center' },
  timerBox: { flex: 1, alignItems: 'center' },
  timerLabel: { fontSize: 11, color: colors.muted, fontWeight: '700', marginTop: 4 },
  timerValue: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 2 },
  incentiveValue: { fontSize: 22, fontWeight: '800', color: colors.primary, marginTop: 2 },
  divider: { width: 1, height: 40, backgroundColor: colors.border },

  completedIncentive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md },
  completedIncentiveText: { marginLeft: 8, fontSize: 16, fontWeight: '700', color: '#2E7D32' },

  actions: { marginTop: spacing.xs },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.danger },
  rejectText: { color: colors.danger, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  acceptBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: radii.lg, backgroundColor: colors.primary },
  acceptText: { color: colors.white, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: radii.lg, backgroundColor: colors.primary },
  actionBtnText: { color: colors.white, fontSize: 16, fontWeight: '700', marginLeft: 8 },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: colors.muted, fontSize: 16, fontWeight: '600', marginTop: spacing.md },
});
