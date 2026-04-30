import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Switch, Alert, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, shadows } from '../../theme';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { socketService } from '../../services/socketService';
import { DeliveryMap } from '../../components/maps/DeliveryMap';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';

export function DistributorHomeScreen() {
  const navigation = useNavigation<any>();
  const { user, refreshProfile } = useAuth();
  const { location } = useCurrentLocation();
  const [stats, setStats] = useState<any>({ activeCount: 0, completedCount: 0, totalEarnings: 0, activeDelivery: null });
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user?.availabilityStatus ?? true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Live timer for active delivery
  const [timeLeft, setTimeLeft] = useState('');
  const [liveIncentive, setLiveIncentive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/distributor/dashboard');
      setStats(data);
    } catch (e: any) {
      console.error('Dashboard API error:', e.config?.url, e.response?.status);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  useEffect(() => {
    const unsubs = [
      socketService.subscribe('new_delivery_assigned', () => void load()),
      socketService.subscribe('delivery_accepted', () => void load()),
      socketService.subscribe('delivery_completed', () => void load()),
      socketService.subscribe('pickup_confirmed', () => void load()),
    ];
    return () => unsubs.forEach(fn => fn());
  }, [load]);

  // Incentive timer effect
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const delivery = stats.activeDelivery;
    if (!delivery?.acceptedAt || delivery.status === 'delivered') return;

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
        setLiveIncentive(base);
      } else {
        const blocks = Math.floor((elapsed - 15) / 5);
        setLiveIncentive(Math.max(base - decay * blocks, minimum));
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stats.activeDelivery]);

  const toggleAvailability = async (value: boolean) => {
    try {
      setIsAvailable(value);
      setUpdatingAvailability(true);
      await authService.updateProfile({ availabilityStatus: value });
      await refreshProfile();
    } catch {
      Alert.alert('Error', 'Failed to update availability status');
      setIsAvailable(!value);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const activeDelivery = stats.activeDelivery;
  const farmerLoc = activeDelivery?.orderId?.farmerId?.pickupLocation || activeDelivery?.orderId?.farmerId?.location?.coordinates;
  const consumerLoc = activeDelivery?.orderId?.consumerId?.location?.coordinates;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Welcome, {user?.fullName?.split(' ')[0]}</Text>
          <Text style={styles.subtitle}>Logistics Dashboard</Text>
        </View>
        <View style={styles.availabilityContainer}>
          <Text style={[styles.availabilityText, { color: isAvailable ? colors.primary : colors.danger }]}>
            {isAvailable ? '● Online' : '● Offline'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            disabled={updatingAvailability}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.lightGreen }]}>
          <Text style={styles.statNumber}>{stats.activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
          <Text style={styles.statNumber}>{stats.completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Earnings */}
      <View style={styles.earningsCard}>
        <View>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsAmount}>₹{stats.totalEarnings}</Text>
        </View>
        <Ionicons name="wallet-outline" size={36} color="rgba(255,255,255,0.4)" />
      </View>

      {/* Active Delivery with Map */}
      {activeDelivery && (
        <View style={styles.activeCard}>
          <View style={styles.activeHeader}>
            <Text style={styles.sectionTitle}>Active Delivery</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {/* Map */}
          {farmerLoc && consumerLoc && (
            <View style={styles.mapContainer}>
              <DeliveryMap
                farmer={{ latitude: farmerLoc.latitude || 23.0225, longitude: farmerLoc.longitude || 72.5714 }}
                consumer={{ latitude: consumerLoc.latitude || 23.0302, longitude: consumerLoc.longitude || 72.5808 }}
                distributor={location || undefined}
              />
            </View>
          )}

          {/* Timer strip */}
          {activeDelivery.acceptedAt && (
            <View style={styles.timerStrip}>
              <View style={styles.timerItem}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={styles.timerItemLabel}>Time Left</Text>
                <Text style={styles.timerItemValue}>{timeLeft}</Text>
              </View>
              <View style={styles.timerDivider} />
              <View style={styles.timerItem}>
                <Ionicons name="cash-outline" size={16} color={colors.primary} />
                <Text style={styles.timerItemLabel}>Incentive</Text>
                <Text style={[styles.timerItemValue, { color: colors.primary }]}>₹{liveIncentive}</Text>
              </View>
            </View>
          )}

          <Text style={styles.activeOrderId}>Order: {activeDelivery.orderId?.orderId}</Text>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <Pressable style={styles.quickBtn} onPress={() => navigation.navigate('Deliveries')}>
          <View style={[styles.quickIcon, { backgroundColor: colors.lightGreen }]}>
            <Ionicons name="bicycle" size={24} color={colors.primary} />
          </View>
          <Text style={styles.quickLabel}>Deliveries</Text>
        </Pressable>
        <Pressable style={styles.quickBtn} onPress={() => navigation.navigate('PaymentMethods')}>
          <View style={[styles.quickIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="card" size={24} color="#F57C00" />
          </View>
          <Text style={styles.quickLabel}>Payments</Text>
        </Pressable>
        <Pressable style={styles.quickBtn} onPress={() => navigation.navigate('Notifications')}>
          <View style={[styles.quickIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="notifications" size={24} color="#1976D2" />
          </View>
          <Text style={styles.quickLabel}>Alerts</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 60, paddingBottom: 100 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 4 },
  availabilityContainer: { alignItems: 'center' },
  availabilityText: { fontSize: 12, fontWeight: '800', marginBottom: 4 },

  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  statCard: { flex: 1, padding: spacing.lg, borderRadius: radii.xl, alignItems: 'center', ...shadows.soft },
  statNumber: { fontSize: 32, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 13, color: colors.muted, marginTop: 4, fontWeight: '600' },

  earningsCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, padding: spacing.xl, borderRadius: radii.xl, marginBottom: spacing.xl, ...shadows.card },
  earningsLabel: { color: '#D6F2D9', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  earningsAmount: { color: colors.white, fontSize: 32, fontWeight: '800' },

  activeCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.xl, ...shadows.soft },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  liveBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  liveText: { color: colors.danger, fontSize: 10, fontWeight: '800' },
  activeOrderId: { color: colors.muted, fontSize: 13, fontWeight: '600', marginTop: spacing.sm },

  mapContainer: { height: 180, borderRadius: radii.lg, overflow: 'hidden', marginBottom: spacing.md },

  timerStrip: { flexDirection: 'row', backgroundColor: colors.lightGreen, borderRadius: radii.lg, padding: spacing.md, alignItems: 'center' },
  timerItem: { flex: 1, alignItems: 'center' },
  timerItemLabel: { fontSize: 10, color: colors.muted, fontWeight: '700', marginTop: 4 },
  timerItemValue: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 2 },
  timerDivider: { width: 1, height: 36, backgroundColor: colors.border },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },

  quickActions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  quickBtn: { flex: 1, alignItems: 'center' },
  quickIcon: { width: 56, height: 56, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 8, ...shadows.soft },
  quickLabel: { fontSize: 12, fontWeight: '700', color: colors.text },
});
