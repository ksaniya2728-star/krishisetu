import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, shadows } from '../../theme';
import { api } from '../../services/api';

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={() => setNotifications([])}>
          <Text style={styles.clearAll}>Clear All</Text>
        </Pressable>
      </View>
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.unread]}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={item.type === 'order' ? 'cart' : 'chatbubble'} 
                size={20} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifBody}>{item.body}</Text>
              <Text style={styles.notifTime}>2 hours ago</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: 72 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  clearAll: { color: colors.primary, fontWeight: '700' },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', marginBottom: spacing.md, ...shadows.soft },
  unread: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  iconContainer: { backgroundColor: colors.lightGreen, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  textContainer: { flex: 1 },
  notifTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  notifBody: { fontSize: 14, color: colors.muted, marginTop: 4, lineHeight: 20 },
  notifTime: { fontSize: 12, color: colors.muted, marginTop: 8 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: spacing.xxl }
});
