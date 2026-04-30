import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SummaryCard } from '../../components/cards/SummaryCard';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { farmerService } from '../../services/farmerService';
import { useAuth } from '../../hooks/useAuth';
import { colors, radii, spacing } from '../../theme';

export function FarmerDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await farmerService.getDashboard();
      setData(result);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.greeting}>Namaste, {user?.fullName?.split(' ')[0]}</Text>
      <Text style={styles.heading}>Today's harvest performance</Text>

      <SummaryCard
        title="Today's earnings"
        value={`₹${Math.round(data?.totalDeliveredEarnings ?? 0)}`}
        subtitle={`${data?.pendingOrdersCount ?? 0} active orders`}
      />

      <View style={styles.quickRow}>
        <View style={styles.quickCard}>
          <Text style={styles.quickTitle}>Add Produce</Text>
          <Text style={styles.quickSubtitle}>Upload crop details and price</Text>
          <PrimaryButton title="Open" onPress={() => navigation.navigate('Add')} />
        </View>
        <View style={styles.quickCard}>
          <Text style={styles.quickTitle}>My Orders</Text>
          <Text style={styles.quickSubtitle}>Track order confirmations and pickups</Text>
          <PrimaryButton title="View" onPress={() => navigation.navigate('FarmerOrders')} variant="light" />
        </View>
      </View>

      <View style={styles.quickCard}>
        <Text style={styles.quickTitle}>Earnings insights</Text>
        <Text style={styles.quickSubtitle}>Weekly graph, best selling produce, and comparisons</Text>
        <PrimaryButton title="Open earnings" onPress={() => navigation.navigate('FarmerEarnings')} />
      </View>

      <View style={styles.quickCard}>
        <Text style={styles.quickTitle}>Pickup status</Text>
        <Text style={styles.quickSubtitle}>Follow confirmation, pickup, and delivery progress for your latest order.</Text>
        <PrimaryButton title="Track pickup" onPress={() => navigation.navigate('PickupTracking')} variant="light" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 72 },
  greeting: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: spacing.lg, marginTop: 8 },
  quickRow: { gap: spacing.md, marginTop: spacing.lg },
  quickCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  quickTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  quickSubtitle: { color: colors.muted, lineHeight: 20, marginBottom: spacing.md, marginTop: 8 },
});

