import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, shadows } from '../../theme';

export function HelpCenterScreen() {
  const faqs = [
    { q: 'How to track my order?', a: 'Go to Orders tab and click on the tracking button.' },
    { q: 'What is Community Basket?', a: 'A way to pool orders with neighbors to save on delivery.' },
    { q: 'How to return produce?', a: 'Returns are accepted within 24 hours of delivery for quality issues.' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Help Centre</Text>
      
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput placeholder="Search for help..." style={styles.searchInput} />
      </View>

      <Text style={styles.sectionTitle}>Contact Support</Text>
      <View style={styles.contactRow}>
        <Pressable style={styles.contactBtn}>
          <Ionicons name="chatbubbles" size={24} color={colors.primary} />
          <Text style={styles.contactText}>Live Chat</Text>
        </Pressable>
        <Pressable style={styles.contactBtn}>
          <Ionicons name="call" size={24} color={colors.primary} />
          <Text style={styles.contactText}>Call Us</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>FAQs</Text>
      {faqs.map((faq, i) => (
        <View key={i} style={styles.faqCard}>
          <Text style={styles.faqQ}>{faq.q}</Text>
          <Text style={styles.faqA}>{faq.a}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 72 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: spacing.xl },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.lg, paddingHorizontal: spacing.md, height: 50, marginBottom: spacing.xl, ...shadows.soft },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  contactRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  contactBtn: { flex: 1, backgroundColor: colors.white, padding: spacing.lg, borderRadius: radii.xl, alignItems: 'center', ...shadows.soft },
  contactText: { color: colors.text, fontWeight: '700', marginTop: 8 },
  faqCard: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.soft },
  faqQ: { fontSize: 16, fontWeight: '700', color: colors.text },
  faqA: { fontSize: 14, color: colors.muted, marginTop: 8, lineHeight: 20 }
});
