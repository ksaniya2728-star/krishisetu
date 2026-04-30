import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Image, Pressable, Linking } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryMap } from '../../components/maps/DeliveryMap';
import { consumerService } from '../../services/consumerService';
import { socketService } from '../../services/socketService';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { colors, radii, spacing, shadows } from '../../theme';

export function OrderTrackingScreen() {
  const route = useRoute<any>();
  const [order, setOrder] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { location, refresh } = useCurrentLocation();

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await consumerService.trackOrder(route.params.orderId);
      setOrder(result);
    } finally {
      setRefreshing(false);
    }
  }, [route.params.orderId]);

  useEffect(() => {
    const unsubscribe = socketService.subscribe('order:update', (updatedOrder: any) => {
      if (updatedOrder._id === route.params.orderId) {
        setOrder(updatedOrder);
      }
    });
    return unsubscribe;
  }, [route.params.orderId]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const getStatusIndex = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'picked_up': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentIdx = getStatusIndex(order?.status);
  const stages = ['Confirmed', 'Accepted', 'Picked Up', 'In Transit', 'Delivered'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Track Order</Text>
          <Text style={styles.orderId}>ID: {order?.orderId || '...'}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{order?.status?.replace('_', ' ').toUpperCase() || 'PENDING'}</Text>
        </View>
      </View>

      {/* Horizontal Stepper */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperRow}>
          {stages.map((stage, i) => (
            <React.Fragment key={stage}>
              <View style={styles.stepNode}>
                <View style={[styles.stepCircle, i <= currentIdx && styles.activeStepCircle]}>
                  {i < currentIdx ? (
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  ) : (
                    <View style={[styles.innerCircle, i === currentIdx && styles.activeInnerCircle]} />
                  )}
                </View>
                <Text style={[styles.stepLabel, i <= currentIdx && styles.activeStepLabel]}>{stage}</Text>
              </View>
              {i < stages.length - 1 && (
                <View style={[styles.stepLine, i < currentIdx && styles.activeStepLine]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.mapContainer}>
        <DeliveryMap
          farmer={{ latitude: 23.0225, longitude: 72.5714 }}
          consumer={location || { latitude: 23.0302, longitude: 72.5808 }}
          distributor={order?.status !== 'pending' ? { latitude: 23.0268, longitude: 72.5753 } : undefined}
        />
      </View>

      {/* Partner Details */}
      {order?.assignedDistributorId && (
        <View style={styles.partnerCard}>
          <View style={styles.partnerHeader}>
            <Image 
              source={{ uri: order.assignedDistributorId.profileImage || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' }} 
              style={styles.avatar} 
            />
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{order.assignedDistributorId.fullName}</Text>
              <Text style={styles.partnerMeta}>Delivery Partner • {order.assignedDistributorId.vehicleType || 'Bicycle'}</Text>
            </View>
            <Pressable style={styles.callBtn} onPress={() => Linking.openURL(`tel:${order.assignedDistributorId.phoneNumber}`)}>
              <Ionicons name="call" size={20} color={colors.white} />
            </Pressable>
          </View>
          
          <View style={styles.etaRow}>
            <View style={styles.etaItem}>
              <Ionicons name="time-outline" size={16} color={colors.muted} />
              <Text style={styles.etaText}>ETA: 15 mins</Text>
            </View>
            <View style={styles.divider} />
            <Pressable style={styles.liveBtn}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text style={styles.liveText}>Live Location</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {order?.items?.map((item: any, i: number) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.produceId?.name} x {item.quantity}kg</Text>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalPrice}>₹{order?.totalAmount}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  orderId: { color: colors.muted, fontSize: 13, marginTop: 4, fontWeight: '600' },
  statusBadge: { backgroundColor: colors.lightGreen, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill },
  statusText: { color: colors.primary, fontSize: 10, fontWeight: '800' },

  stepperContainer: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.xl, ...shadows.soft },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepNode: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  activeStepCircle: { backgroundColor: colors.primary },
  innerCircle: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white },
  activeInnerCircle: { backgroundColor: colors.white },
  stepLabel: { fontSize: 10, color: colors.muted, marginTop: 8, fontWeight: '600', textAlign: 'center' },
  activeStepLabel: { color: colors.text },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: -15, marginTop: -18 },
  activeStepLine: { backgroundColor: colors.primary },

  mapContainer: { height: 200, borderRadius: radii.xl, overflow: 'hidden', marginBottom: spacing.xl, ...shadows.soft },
  
  partnerCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.xl, ...shadows.soft },
  partnerHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: spacing.md },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 18, fontWeight: '800', color: colors.text },
  partnerMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  
  etaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  etaItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  etaText: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: colors.text },
  divider: { width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: spacing.md },
  liveBtn: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  liveText: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: colors.primary },

  summaryCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.lg, ...shadows.soft },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemName: { color: colors.muted, fontSize: 14 },
  itemPrice: { color: colors.text, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  totalPrice: { fontSize: 18, fontWeight: '800', color: colors.primary },
});



