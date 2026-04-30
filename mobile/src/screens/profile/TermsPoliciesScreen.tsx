import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';

export function TermsPoliciesScreen() {
  const sections = [
    { title: 'Privacy Policy', content: 'We value your privacy. Your data is encrypted using AES-256 and never shared with third parties without consent.' },
    { title: 'Terms of Service', content: 'By using KrishiSetu, you agree to our fair trade practices and community guidelines.' },
    { title: 'Refund Policy', content: 'Refunds for fresh produce are processed if quality issues are reported within 24 hours.' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms & Policies</Text>
      {sections.map((s, i) => (
        <View key={i} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <Text style={styles.sectionContent}>{s.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 72 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  sectionContent: { fontSize: 15, color: colors.muted, lineHeight: 24 }
});
