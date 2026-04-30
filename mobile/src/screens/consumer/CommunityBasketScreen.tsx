import React, { useCallback, useState, useEffect } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { communityService } from '../../services/communityService';
import { socketService } from '../../services/socketService';
import { colors, radii, spacing, shadows } from '../../theme';

export function CommunityBasketScreen() {
  const [baskets, setBaskets] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await communityService.list('open');
      setBaskets(data.baskets || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  useEffect(() => {
    const unsubscribe = socketService.subscribe('pool:update', () => {
      void load();
    });
    return unsubscribe;
  }, [load]);

  const onShare = async (code: string) => {
    try {
      await Share.share({
        message: `Join our Community Basket on KrishiSetu and save on fresh produce delivery! Use invite code: ${code}`,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const basket = baskets[0];
  const required = Number(basket?.requiredQuantity || 50);
  const totalQty = Number(basket?.totalQuantity || 0);
  const progressPct = required > 0 ? Math.min(100, Math.round((totalQty / required) * 100)) : 0;
  
  // Real avatars if populated, else use a placeholder
  const avatars = basket?.participants?.map((p: any) => p.userId?.profileImage).filter(Boolean) || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Community Basket</Text>
          <Text style={styles.subtitle}>Join and save more with group orders in your apartment.</Text>
        </View>
        <View style={styles.headerIconBg}>
          <Ionicons name="people" size={24} color={colors.primary} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.heading}>{basket?.apartmentName || 'Green Valley Residency'}</Text>
            <Text style={styles.meta}>Delivery: {basket?.deliverySlot || 'Tomorrow Morning'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{basket?.status?.toUpperCase() || 'OPEN'}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Group Goal</Text>
            <Text style={styles.progressValue}>{totalQty} / {required} kg</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            {required - totalQty > 0 
              ? `${required - totalQty} kg more needed to unlock free delivery`
              : 'Goal reached! Order will be processed soon.'}
          </Text>
        </View>

        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Members Joined</Text>
          <View style={styles.avatarRow}>
            {avatars.length > 0 ? (
              avatars.slice(0, 4).map((avatar: string, i: number) => (
                <Image key={i} source={{ uri: avatar }} style={[styles.avatar, { zIndex: 10 - i }]} />
              ))
            ) : (
              <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.avatar} />
            )}
            {avatars.length > 4 && (
              <View style={[styles.avatarMore, { zIndex: 0 }]}>
                <Text style={styles.avatarMoreText}>+{avatars.length - 4}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.inviteBox}>
          <View style={styles.inviteBoxText}>
            <Text style={styles.inviteTitle}>Invite Neighbours</Text>
            <Text style={styles.inviteSubtitle}>Share the link to reach the goal faster</Text>
          </View>
          <Pressable style={styles.shareBtn} onPress={() => onShare('GVR-452')}>
            <Ionicons name="share-social" size={20} color={colors.primary} />
          </Pressable>
        </View>

        <PrimaryButton
          title="Join Basket"
          onPress={async () => {
            try {
              if (!basket?._id) {
                const created = await communityService.create({
                  apartmentName: 'Green Valley Residency',
                  deliverySlot: 'Tomorrow 9:00 AM - 12:00 PM',
                  requiredQuantity: 50,
                  items: [],
                });
                Alert.alert('Created', 'New community basket created.');
                setBaskets([created.basket]);
                return;
              }

              await communityService.join({ basketId: basket._id, contributionAmount: 0 });
              Alert.alert('Joined', 'You joined the community basket successfully.');
              await load();
            } catch (error: any) {
              Alert.alert('Unable to join', error?.response?.data?.message || 'Please try again.');
            }
          }}
        />
      </View>
      
      {/* Location Preview (Mock) */}
      <View style={styles.locationCard}>
        <Text style={styles.sectionTitle}>Drop-off Location</Text>
        <View style={styles.mapPreview}>
          <Ionicons name="location" size={32} color={colors.danger} />
          <Text style={styles.mapPreviewText}>Clubhouse Gate</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 60, paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  headerTextContainer: { flex: 1, paddingRight: spacing.lg },
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.muted, marginTop: 8, fontSize: 14, lineHeight: 20 },
  headerIconBg: { backgroundColor: colors.lightGreen, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.xl, ...shadows.soft },
  
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  heading: { color: colors.text, fontSize: 20, fontWeight: '800', flex: 1, marginRight: 10 },
  meta: { color: colors.muted, marginTop: 6, fontSize: 13 },
  statusBadge: { backgroundColor: colors.lightGreen, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill },
  statusText: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  progressContainer: { backgroundColor: colors.background, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  progressValue: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  barTrack: { backgroundColor: colors.border, borderRadius: radii.pill, height: 10, marginVertical: 8, overflow: 'hidden' },
  barFill: { backgroundColor: colors.primary, height: '100%', borderRadius: radii.pill },
  progressHint: { color: colors.muted, fontSize: 12, marginTop: 4 },

  membersSection: { marginBottom: spacing.xl },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: spacing.md },
  avatarRow: { flexDirection: 'row', paddingLeft: 4 },
  avatar: { borderColor: colors.white, borderRadius: 22, borderWidth: 3, height: 44, marginLeft: -12, width: 44, backgroundColor: colors.lightGreen },
  avatarMore: { borderColor: colors.white, borderRadius: 22, borderWidth: 3, height: 44, marginLeft: -12, width: 44, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  avatarMoreText: { color: colors.text, fontSize: 12, fontWeight: '700' },

  inviteBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGreen, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.xl },
  inviteBoxText: { flex: 1 },
  inviteTitle: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  inviteSubtitle: { color: colors.primary, fontSize: 12, marginTop: 2, opacity: 0.8 },
  shareBtn: { width: 40, height: 40, backgroundColor: colors.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...shadows.soft },

  locationCard: { backgroundColor: colors.white, borderRadius: radii.xl, marginTop: spacing.lg, padding: spacing.xl, ...shadows.soft },
  mapPreview: { height: 120, backgroundColor: colors.border, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  mapPreviewText: { color: colors.muted, fontSize: 14, fontWeight: '700', marginTop: spacing.sm },
});

