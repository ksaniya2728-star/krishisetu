import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Switch, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, shadows } from '../../theme';

export function PrivacySecurityScreen() {
  const [biometric, setBiometric] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const SettingRow = ({ icon, title, value, onValueChange, type = 'switch' }: any) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBg}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      {type === 'switch' ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange} 
          trackColor={{ false: colors.border, true: colors.primary }} 
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy & Security</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Login & Security</Text>
        <View style={styles.card}>
          <Pressable onPress={() => Alert.alert('Change Password', 'Verification email sent.')}>
            <SettingRow icon="key-outline" title="Change Password" type="chevron" />
          </Pressable>
          <View style={styles.divider} />
          <SettingRow 
            icon="finger-print-outline" 
            title="Biometric Login" 
            value={biometric} 
            onValueChange={setBiometric} 
          />
          <View style={styles.divider} />
          <SettingRow 
            icon="shield-checkmark-outline" 
            title="Two-Factor Auth" 
            value={twoFactor} 
            onValueChange={setTwoFactor} 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Data</Text>
        <View style={styles.card}>
          <SettingRow icon="download-outline" title="Download My Data" type="chevron" />
          <View style={styles.divider} />
          <Pressable onPress={() => Alert.alert('Delete Account', 'This action cannot be undone. Confirm?', [
            { text: 'Cancel' },
            { text: 'Delete', style: 'destructive' }
          ])}>
            <SettingRow icon="trash-outline" title="Delete Account" type="chevron" />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 72 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.muted, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, overflow: 'hidden', ...shadows.soft },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { backgroundColor: colors.lightGreen, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  rowTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.xl + 36 }
});
