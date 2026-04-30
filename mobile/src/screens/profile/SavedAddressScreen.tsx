import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, shadows } from '../../theme';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { api } from '../../services/api';

export function SavedAddressScreen() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/profile/addresses');
      setAddresses(data.addresses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/profile/address/${id}`);
            fetchAddresses();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete address');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Addresses</Text>
      
      <FlatList
        data={addresses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.type === 'Home' ? 'home' : 'briefcase'} size={20} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.addressType}>{item.type}</Text>
                <Text style={styles.addressText}>{item.street}, {item.city}</Text>
              </View>
            </View>
            <Pressable onPress={() => handleDelete(item._id)}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No addresses saved yet.</Text> : null
        }
      />

      <PrimaryButton 
        title="Add New Address" 
        onPress={() => Alert.alert('Coming Soon', 'Map selection integration in progress')} 
        style={styles.addBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: 72 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: spacing.xl },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, ...shadows.soft },
  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { backgroundColor: colors.lightGreen, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  textContainer: { flex: 1 },
  addressType: { fontSize: 16, fontWeight: '700', color: colors.text },
  addressText: { fontSize: 14, color: colors.muted, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: spacing.xxl },
  addBtn: { marginTop: spacing.md }
});
