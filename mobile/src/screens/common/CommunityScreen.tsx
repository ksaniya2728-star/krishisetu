import React, { useCallback, useState, useEffect } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { chatService } from '../../services/chatService';
import { socketService } from '../../services/socketService';
import { colors, radii, spacing, shadows } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

export function CommunityScreen() {
  const { user } = useAuth();
  const [otherUsername, setOtherUsername] = useState('');
  const [text, setText] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'Chats' | 'Voice Notes' | 'Community Feed'>('Chats');

  const load = useCallback(async () => {
    if (!otherUsername) return;
    setLoading(true);
    try {
      const data = await chatService.history(otherUsername);
      setMessages(data.messages || []);
    } catch (e: any) {
      Alert.alert('Chat error', e?.response?.data?.message || 'Unable to load history');
    } finally {
      setLoading(false);
    }
  }, [otherUsername]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  useEffect(() => {
    const unsubscribe = socketService.subscribe('chat:message', (newMessage: any) => {
      // Append the new message
      setMessages(prev => [...prev, newMessage]);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Hub</Text>
      
      <View style={styles.tabsContainer}>
        {['Chats', 'Voice Notes', 'Community Feed'].map(tab => (
          <Pressable 
            key={tab} 
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'Chats' && (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Chat with Username</Text>
            <TextInput
              value={otherUsername}
              onChangeText={setOtherUsername}
              placeholder="Enter farmer or consumer username"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoCapitalize="none"
            />
            <Pressable style={styles.refresh} onPress={() => void load()}>
              <Text style={styles.refreshText}>{loading ? 'Loading…' : 'Load history'}</Text>
            </Pressable>
          </View>

          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.label}>Messages</Text>
            <FlatList
              data={messages}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: 12 }}
              renderItem={({ item }) => {
                const mine = item.fromUserId?._id ? item.fromUserId._id === user?._id : item.fromUserId === user?._id;
                return (
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                    <Text style={styles.bubbleType}>{item.type}</Text>
                    {item.type === 'voice' ? (
                      <Text style={styles.bubbleText}>Voice: {item.voice?.url}</Text>
                    ) : (
                      <Text style={styles.bubbleText}>{item.text}</Text>
                    )}
                  </View>
                );
              }}
            />
          </View>

          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type message"
              placeholderTextColor={colors.muted}
              style={[styles.input, { flex: 1 }]}
            />
            <Pressable
              style={styles.send}
              onPress={async () => {
                if (!otherUsername || !text) return;
                try {
                  await chatService.send(otherUsername, text);
                  setText('');
                  await load();
                } catch (e: any) {
                  Alert.alert('Send failed', e?.response?.data?.message || 'Unable to send');
                }
              }}
            >
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>
        </>
      )}

      {activeTab !== 'Chats' && (
        <View style={styles.card}>
          <Text style={styles.label}>Coming Soon</Text>
          <Text style={styles.bubbleText}>This section is under construction.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, padding: spacing.xl, paddingTop: 60 },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  tabsContainer: { flexDirection: 'row', marginTop: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.white, borderRadius: radii.lg, padding: 4, ...shadows.soft },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radii.md },
  tabBtnActive: { backgroundColor: colors.primary },
  tabText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: colors.white },
  
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.soft },
  label: { color: colors.text, fontWeight: '800', marginBottom: 10 },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  refresh: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: colors.lightGreen, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 8 },
  refreshText: { color: colors.primary, fontWeight: '800' },
  bubble: { borderRadius: 16, padding: 12, marginBottom: 10, maxWidth: '85%' },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: colors.lightGreen },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  bubbleType: { color: colors.muted, fontSize: 11, marginBottom: 4 },
  bubbleText: { color: colors.text },
  composer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  send: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 20, justifyContent: 'center' },
  sendText: { color: colors.white, fontWeight: '800' },
});

