import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { colors, radii, spacing, shadows } from '../../theme';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, refreshProfile, logout } = useAuth();
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setUploading(true);
        // Using a basic data URI for simplicity. In a real app, upload to S3/Cloudinary.
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await authService.updateProfileImage(base64Uri);
        await refreshProfile();
        Alert.alert('Success', 'Profile image updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const renderSettingRow = (icon: keyof typeof Ionicons.glyphMap, title: string, subtitle?: string, action?: () => void) => (
    <Pressable style={styles.settingRow} onPress={action}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
        <Pressable style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <Pressable onPress={pickImage} style={styles.avatarContainer} disabled={uploading}>
          <Image
            source={{
              uri: user?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
            }}
            style={styles.avatar}
          />
          <View style={styles.editAvatarBadge}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </View>
        </Pressable>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
          <Text style={styles.meta}>{user?.phoneNumber}</Text>
        </View>
      </View>

      <View style={styles.walletCard}>
        <View>
          <Text style={styles.walletLabel}>Krishi Wallet Balance</Text>
          <Text style={styles.walletAmount}>₹1,250.00</Text>
        </View>
        <PrimaryButton title="Add Money" onPress={() => {}} style={styles.walletBtn} />
      </View>

      <Text style={styles.sectionTitle}>Account Settings</Text>
      <View style={styles.cardGroup}>
        {renderSettingRow('location-outline', 'Saved Addresses', 'Manage delivery locations', () => navigation.navigate('SavedAddress'))}
        {renderSettingRow('card-outline', 'Payment Methods', 'Manage cards and UPI', () => navigation.navigate('PaymentMethods'))}
        {renderSettingRow('notifications-outline', 'Notifications', 'Manage alerts', () => navigation.navigate('Notifications'))}
        {renderSettingRow('shield-checkmark-outline', 'Privacy & Security', 'Password and biometric', () => navigation.navigate('PrivacySecurity'))}
      </View>

      <Text style={styles.sectionTitle}>Support</Text>
      <View style={styles.cardGroup}>
        {renderSettingRow('help-circle-outline', 'Help Center', 'FAQs and customer support', () => navigation.navigate('HelpCenter'))}
        {renderSettingRow('document-text-outline', 'Terms & Policies', undefined, () => navigation.navigate('TermsPolicies'))}
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={() =>
          Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => void logout() },
          ])
        }
      >
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  screenTitle: { color: colors.text, fontSize: 32, fontWeight: '800' },
  editBtn: { backgroundColor: colors.lightGreen, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.pill },
  editBtnText: { color: colors.primary, fontWeight: '700' },
  
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  avatarContainer: { position: 'relative', marginRight: spacing.xl },
  avatar: { borderRadius: 40, height: 80, width: 80 },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: { flex: 1 },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  role: { color: colors.primary, fontWeight: '700', marginTop: 4, fontSize: 12, letterSpacing: 1 },
  meta: { color: colors.muted, marginTop: 4, fontSize: 14 },

  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    ...shadows.card,
  },
  walletLabel: { color: '#D6F2D9', fontSize: 14, marginBottom: 4 },
  walletAmount: { color: colors.white, fontSize: 28, fontWeight: '800' },
  walletBtn: { backgroundColor: colors.white, paddingHorizontal: 16, height: 40, marginTop: 0 },

  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: spacing.md, marginLeft: spacing.xs },
  cardGroup: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
    ...shadows.soft,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIconContainer: {
    backgroundColor: colors.lightGreen,
    padding: 10,
    borderRadius: radii.md,
    marginRight: spacing.md,
  },
  settingTextContainer: { flex: 1 },
  settingTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  settingSubtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginTop: spacing.sm,
  },
  logoutText: { color: colors.danger, fontSize: 16, fontWeight: '700', marginLeft: spacing.sm },
});

