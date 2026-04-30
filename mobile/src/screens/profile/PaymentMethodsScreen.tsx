import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, shadows } from '../../theme';
import { api } from '../../services/api';

export function PaymentMethodsScreen() {
  const [methods, setMethods] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState('0');
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<'upi' | 'card'>('upi');
  const [newName, setNewName] = useState('');
  const [newDetail, setNewDetail] = useState('');

  const fetchMethods = useCallback(async () => {
    try {
      const { data } = await api.get('/payments/methods');
      setMethods(data.methods || []);
      setWalletBalance(data.walletBalance || '0');
    } catch (e: any) {
      console.error('[PaymentMethods] fetch error:', e.config?.url, e.response?.status);
    }
  }, []);

  useFocusEffect(useCallback(() => { void fetchMethods(); }, [fetchMethods]));

  const handleAdd = async () => {
    if (!newName.trim() || !newDetail.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields');
      return;
    }
    try {
      await api.post('/payments/add-method', {
        type: newType,
        name: newName.trim(),
        detail: newDetail.trim(),
        isDefault: methods.length === 0,
      });
      setShowAdd(false);
      setNewName('');
      setNewDetail('');
      await fetchMethods();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to add method');
    }
  };

  const handleRemove = (id: string, name: string) => {
    Alert.alert('Remove', `Remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/payments/remove/${id}`);
            await fetchMethods();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to remove');
          }
        }
      }
    ]);
  };

  const iconForType = (type: string) => {
    switch (type) {
      case 'upi': return 'phone-portrait';
      case 'card': return 'card';
      case 'wallet': return 'wallet';
      default: return 'cash';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Methods</Text>

      {/* Wallet */}
      <View style={styles.walletCard}>
        <View>
          <Text style={styles.walletLabel}>Krishi Wallet</Text>
          <Text style={styles.walletAmount}>₹{parseFloat(walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        </View>
        <Ionicons name="wallet" size={36} color="rgba(255,255,255,0.4)" />
      </View>

      {/* Saved Methods */}
      <Text style={styles.sectionTitle}>Saved Methods</Text>
      <FlatList
        data={methods}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>No payment methods saved yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.methodIcon}>
                <Ionicons name={iconForType(item.type)} size={22} color={colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.methodName}>{item.name}</Text>
                <Text style={styles.methodDetail}>{item.detail}</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>DEFAULT</Text>
                </View>
              )}
              <Pressable onPress={() => handleRemove(item._id, item.name)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color={colors.muted} />
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Add new form */}
      {showAdd && (
        <View style={styles.addForm}>
          <Text style={styles.addFormTitle}>Add Payment Method</Text>
          <View style={styles.typeRow}>
            <Pressable
              style={[styles.typeBtn, newType === 'upi' && styles.typeBtnActive]}
              onPress={() => setNewType('upi')}
            >
              <Text style={[styles.typeBtnText, newType === 'upi' && styles.typeBtnTextActive]}>UPI</Text>
            </Pressable>
            <Pressable
              style={[styles.typeBtn, newType === 'card' && styles.typeBtnActive]}
              onPress={() => setNewType('card')}
            >
              <Text style={[styles.typeBtnText, newType === 'card' && styles.typeBtnTextActive]}>Card</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder={newType === 'upi' ? 'e.g. Google Pay' : 'e.g. HDFC Visa'}
            placeholderTextColor={colors.muted}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={styles.input}
            placeholder={newType === 'upi' ? 'e.g. user@okaxis' : 'e.g. **** 4532'}
            placeholderTextColor={colors.muted}
            value={newDetail}
            onChangeText={setNewDetail}
          />
          <View style={styles.addFormActions}>
            <Pressable style={styles.cancelBtn} onPress={() => { setShowAdd(false); setNewName(''); setNewDetail(''); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!showAdd && (
        <Pressable style={styles.addNew} onPress={() => setShowAdd(true)}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.addNewText}>Add New Payment Method</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: spacing.xl },

  walletCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, borderRadius: radii.xl, padding: spacing.xl, marginBottom: spacing.xl, ...shadows.card },
  walletLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  walletAmount: { color: colors.white, fontSize: 32, fontWeight: '800', marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },

  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, ...shadows.soft },
  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  methodIcon: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.lightGreen, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  textContainer: { flex: 1 },
  methodName: { fontSize: 16, fontWeight: '700', color: colors.text },
  methodDetail: { fontSize: 13, color: colors.muted, marginTop: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  defaultBadge: { backgroundColor: colors.lightGreen, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  defaultText: { color: colors.primary, fontSize: 9, fontWeight: '800' },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: colors.muted, fontSize: 14, marginTop: spacing.sm },

  addForm: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.xl, marginBottom: spacing.md, ...shadows.soft },
  addFormTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.lightGreen },
  typeBtnText: { fontWeight: '700', color: colors.muted },
  typeBtnTextActive: { color: colors.primary },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.text, marginBottom: spacing.sm, backgroundColor: '#FAFAFA' },
  addFormActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  cancelText: { color: colors.muted, fontWeight: '700', fontSize: 16 },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: radii.lg, backgroundColor: colors.primary, alignItems: 'center' },
  saveText: { color: colors.white, fontWeight: '700', fontSize: 16 },

  addNew: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, marginBottom: 100 },
  addNewText: { color: colors.primary, fontWeight: '700', marginLeft: 8 },
});
