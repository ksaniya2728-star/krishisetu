import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EarningsChart } from '../../components/charts/EarningsChart';
import { farmerService } from '../../services/farmerService';
import { colors, radii, spacing } from '../../theme';

export function FarmerEarningsScreen() {
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await farmerService.getEarnings();
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
      <Text style={styles.title}>Earnings</Text>
      <Text style={styles.total}>₹{Math.round(data?.comparison?.currentWeek || 0)}</Text>
      <Text style={styles.sub}>
        {data?.comparison?.deltaPercent == null
          ? 'No previous week comparison yet'
          : `${data.comparison.deltaPercent.toFixed(1)}% vs last week`}
      </Text>

      <View style={styles.chartCard}>
        <EarningsChart labels={data?.labels || []} values={data?.weeklyEarnings || []} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Best selling produce</Text>
        {(data?.bestSellingProduce || []).map((item: any) => (
          <View key={item.productId} style={styles.listRow}>
            <Text style={styles.listTitle}>{item.productName}</Text>
            <Text style={styles.listMeta}>{item.totalQty} sold</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 72 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  total: { color: colors.primary, fontSize: 36, fontWeight: '800', marginTop: 10 },
  sub: { color: colors.muted, marginBottom: spacing.lg, marginTop: 4 },
  chartCard: { backgroundColor: colors.white, borderRadius: radii.lg, marginBottom: spacing.md, padding: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  listTitle: { color: colors.text, fontWeight: '700' },
  listMeta: { color: colors.muted },
});

