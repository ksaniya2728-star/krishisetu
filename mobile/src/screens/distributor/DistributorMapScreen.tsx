import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppMap } from '../../components/common/AppMap';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { api } from '../../services/api';
import { socketService } from '../../services/socketService';
import { colors, radii, spacing, shadows } from '../../theme';

export function DistributorMapScreen() {
  const { location, loading: locLoading, permissionStatus, error: locError, refresh } = useCurrentLocation();
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(true);

  const loadActive = useCallback(async () => {
    try {
      setLoadingDelivery(true);
      const { data } = await api.get('/distributor/deliveries');
      const deliveries = data.deliveries || [];
      // Find first non-delivered delivery
      const active = deliveries.find((d: any) => d.status !== 'delivered') || null;
      setActiveDelivery(active);
    } catch (e: any) {
      console.error('[DistributorMap] load error:', e.config?.url, e.response?.status);
    } finally {
      setLoadingDelivery(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadActive(); }, [loadActive]));

  useEffect(() => {
    const unsubs = [
      socketService.subscribe('delivery_accepted', () => void loadActive()),
      socketService.subscribe('new_delivery_assigned', () => void loadActive()),
      socketService.subscribe('delivery_completed', () => void loadActive()),
      socketService.subscribe('pickup_confirmed', () => void loadActive()),
    ];
    return () => unsubs.forEach(fn => fn());
  }, [loadActive]);

  const handleAction = async (action: string) => {
    if (!activeDelivery) return;
    try {
      await api.put(`/distributor/${action}/${activeDelivery.orderId?._id}`);
      if (action === 'delivered') {
        Alert.alert('🎉 Delivered!', 'Incentive has been added to your wallet.');
      }
      await loadActive();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Action failed');
    }
  };

  // Build map data
  const farmerPickup = activeDelivery?.orderId?.farmerId?.pickupLocation
    || activeDelivery?.orderId?.farmerId?.location?.coordinates;
  const consumerDrop = activeDelivery?.orderId?.consumerId?.location?.coordinates;

  const farmerCoord = farmerPickup
    ? { latitude: farmerPickup.latitude || 23.0225, longitude: farmerPickup.longitude || 72.5714 }
    : { latitude: 23.0225, longitude: 72.5714 };

  const consumerCoord = consumerDrop
    ? { latitude: consumerDrop.latitude || 23.0302, longitude: consumerDrop.longitude || 72.5808 }
    : { latitude: 23.0302, longitude: 72.5808 };

  const myCoord = location || { latitude: 23.0268, longitude: 72.5753 };

  const markers = activeDelivery ? [
    { id: 'you', coordinate: myCoord, title: 'You', pinColor: '#1976D2' },
    { id: 'pickup', coordinate: farmerCoord, title: 'Pickup — ' + (activeDelivery.orderId?.farmerId?.fullName || 'Farmer'), pinColor: colors.primary },
    { id: 'drop', coordinate: consumerCoord, title: 'Drop — ' + (activeDelivery.orderId?.consumerId?.fullName || 'Consumer'), pinColor: '#F57C00' },
  ] : location ? [
    { id: 'you', coordinate: myCoord, title: 'You', pinColor: '#1976D2' },
  ] : [];

  const polyline = activeDelivery ? [farmerCoord, myCoord, consumerCoord] : undefined;

  const midLat = activeDelivery
    ? (farmerCoord.latitude + consumerCoord.latitude) / 2
    : myCoord.latitude;
  const midLng = activeDelivery
    ? (farmerCoord.longitude + consumerCoord.longitude) / 2
    : myCoord.longitude;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map</Text>

      {/* Full-height map */}
      <View style={styles.mapWrapper}>
        <AppMap
          loading={locLoading || loadingDelivery}
          permissionDenied={permissionStatus === 'denied'}
          errorText={locError}
          onRetry={refresh}
          initialRegion={{
            latitude: midLat,
            longitude: midLng,
            latitudeDelta: activeDelivery ? 0.08 : 0.04,
            longitudeDelta: activeDelivery ? 0.08 : 0.04,
          }}
          markers={markers}
          polyline={polyline}
          showUserLocation
          height={420}
        />
      </View>

      {/* Delivery info card */}
      {activeDelivery ? (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoOrderId}>{activeDelivery.orderId?.orderId || 'Delivery'}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{activeDelivery.status?.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={styles.routeText}>{activeDelivery.orderId?.farmerId?.fullName || 'Farmer'}</Text>
          </View>
          <View style={styles.routeConnector} />
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: '#F57C00' }]} />
            <Text style={styles.routeText}>{activeDelivery.orderId?.consumerId?.fullName || 'Consumer'}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {activeDelivery.status === 'assigned' && (
              <Pressable style={styles.acceptBtn} onPress={() => handleAction('accept')}>
                <Ionicons name="checkmark" size={18} color={colors.white} />
                <Text style={styles.btnText}>Accept Delivery</Text>
              </Pressable>
            )}
            {activeDelivery.status === 'accepted' && (
              <Pressable style={styles.acceptBtn} onPress={() => handleAction('pickup')}>
                <Ionicons name="bag-handle-outline" size={18} color={colors.white} />
                <Text style={styles.btnText}>Mark Picked Up</Text>
              </Pressable>
            )}
            {activeDelivery.status === 'picked_up' && (
              <Pressable style={[styles.acceptBtn, { backgroundColor: '#F57C00' }]} onPress={() => handleAction('delivered')}>
                <Ionicons name="checkmark-done" size={18} color={colors.white} />
                <Text style={styles.btnText}>Mark Delivered</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.noDelivery}>
          <Ionicons name="location-outline" size={32} color={colors.border} />
          <Text style={styles.noDeliveryText}>No active delivery. Waiting for assignment...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.xl, paddingTop: 60, marginBottom: spacing.md },

  mapWrapper: { marginHorizontal: spacing.xl, borderRadius: radii.xl, overflow: 'hidden', ...shadows.card },

  infoCard: { margin: spacing.xl, backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.lg, ...shadows.soft },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  infoOrderId: { fontSize: 18, fontWeight: '800', color: colors.text },
  statusBadge: { backgroundColor: colors.lightGreen, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.pill },
  statusText: { color: colors.primary, fontSize: 10, fontWeight: '800' },

  routeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  routeText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  routeConnector: { width: 2, height: 12, backgroundColor: colors.border, marginLeft: 4, marginVertical: 2 },

  actionRow: { marginTop: spacing.md },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radii.lg },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '700', marginLeft: 8 },

  noDelivery: { margin: spacing.xl, alignItems: 'center', paddingVertical: 32, backgroundColor: colors.white, borderRadius: radii.xl, ...shadows.soft },
  noDeliveryText: { color: colors.muted, fontSize: 14, marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.xl },
});
