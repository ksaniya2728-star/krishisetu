import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, shadows } from '../../theme';

export function RoleSelectionScreen() {
  const navigation = useNavigation<any>();

  const RoleCard = ({ title, text, icon, role }: any) => (
    <Pressable 
      style={styles.card} 
      onPress={() => navigation.navigate('Signup', { initialRole: role })}
    >
      <View style={styles.iconBg}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.border} />
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Get Started</Text>
      <Text style={styles.title}>Who are you?</Text>
      <Text style={styles.subtitle}>Choose your role to start your journey on KrishiSetu.</Text>

      <RoleCard 
        title="I am a Farmer" 
        text="Sell fresh harvest, track orders, and monitor weekly earnings." 
        icon="leaf" 
        role="farmer"
      />

      <RoleCard 
        title="I am a Consumer" 
        text="Browse nearby farms, add to cart, and join community baskets." 
        icon="cart" 
        role="consumer"
      />

      <RoleCard 
        title="Micro-logistics" 
        text="Join as a delivery partner and help bridge the gap." 
        icon="bicycle" 
        role="distributor"
      />

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.loginBtn}>
        <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Login</Text></Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.xl, paddingTop: 100 },
  kicker: { color: colors.primary, fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  title: { color: colors.text, fontSize: 34, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 8, marginBottom: spacing.xxxl, lineHeight: 24 },
  card: { 
    backgroundColor: colors.white, 
    borderRadius: radii.xl, 
    padding: spacing.lg, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: spacing.md,
    ...shadows.soft 
  },
  iconBg: { 
    backgroundColor: colors.lightGreen, 
    width: 60, 
    height: 60, 
    borderRadius: radii.lg, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: spacing.md 
  },
  cardContent: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  cardText: { color: colors.muted, fontSize: 14, marginTop: 4, lineHeight: 18 },
  loginBtn: { marginTop: spacing.xxl, alignItems: 'center' },
  loginText: { color: colors.muted, fontSize: 15 },
  loginLink: { color: colors.primary, fontWeight: '800' },
});

