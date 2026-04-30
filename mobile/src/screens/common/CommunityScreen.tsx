import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { chatService } from '../../services/chatService';
import { authService } from '../../services/authService';
import { socketService } from '../../services/socketService';
import { colors, radii, spacing, shadows } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types/auth';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';

export function CommunityScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Chats' | 'Discover' | 'Feed'>('Chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Audio recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<any>(null);

  const loadHistory = useCallback(async () => {
    if (!selectedUser) return;
    setLoadingHistory(true);
    try {
      const data = await chatService.history(selectedUser.username || '');
      setMessages(data.messages || []);
    } catch (e: any) {
      console.error('Chat error', e);
    } finally {
      setLoadingHistory(false);
    }
  }, [selectedUser]);

  useFocusEffect(
    useCallback(() => {
      if (selectedUser) void loadHistory();
    }, [loadHistory, selectedUser])
  );

  useEffect(() => {
    const unsubscribe = socketService.subscribe('chat:message', (newMessage: any) => {
      if (selectedUser && (newMessage.fromUserId._id === selectedUser._id || newMessage.fromUserId === selectedUser._id)) {
        setMessages(prev => [...prev, newMessage]);
      }
    });
    return unsubscribe;
  }, [selectedUser]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await authService.searchUsers(searchQuery);
      setSearchResults(data.users || []);
    } catch (e) {
      Alert.alert('Error', 'Unable to search users');
    } finally {
      setSearching(false);
    }
  };

  // Audio Recording Functions
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission denied', 'Allow microphone access to record voice notes');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    
    setIsRecording(false);
    clearInterval(recordingTimer.current);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri && selectedUser) {
        // In a real app, upload uri to cloud storage (S3/Cloudinary)
        // Here we mock the upload by sending the URI string
        await chatService.send(selectedUser.username || '', '', 'voice', uri, recordingDuration * 1000);
        await loadHistory();
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }

  const renderMessage = ({ item }: { item: any }) => {
    const mine = item.fromUserId?._id ? item.fromUserId._id === user?._id : item.fromUserId === user?._id;
    return (
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
        {item.type === 'voice' ? (
          <Pressable style={styles.voiceBubble} onPress={() => playSound(item.voice?.url)}>
            <Ionicons name="play" size={20} color={mine ? colors.white : colors.primary} />
            <Text style={[styles.bubbleText, mine && { color: colors.white }]}>
              Voice Note ({Math.round((item.voice?.durationMs || 0) / 1000)}s)
            </Text>
          </Pressable>
        ) : (
          <Text style={[styles.bubbleText, mine && { color: colors.white }]}>{item.text}</Text>
        )}
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  async function playSound(url: string) {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.playAsync();
    } catch (e) {
      Alert.alert('Playback Error', 'Unable to play this voice note');
    }
  }

  if (selectedUser) {
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <Pressable onPress={() => setSelectedUser(null)}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Image 
            source={{ uri: selectedUser.profileImage || 'https://via.placeholder.com/100' }} 
            style={styles.chatAvatar} 
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{selectedUser.fullName}</Text>
            <Text style={styles.chatStatus}>{selectedUser.role === 'farmer' ? `Farmer • ${selectedUser.farmName || ''}` : 'Consumer'}</Text>
          </View>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: spacing.lg }}
          inverted={false}
          ListEmptyComponent={loadingHistory ? <ActivityIndicator color={colors.primary} /> : null}
        />

        <View style={styles.composerContainer}>
          {isRecording ? (
            <View style={styles.recordingOverlay}>
              <View style={styles.recordingPulse} />
              <Text style={styles.recordingTime}>Recording... {recordingDuration}s</Text>
              <Pressable style={styles.stopBtn} onPress={stopRecording}>
                <Ionicons name="stop" size={24} color={colors.white} />
              </Pressable>
            </View>
          ) : (
            <>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Type a message..."
                placeholderTextColor={colors.muted}
                style={styles.chatInput}
                multiline
              />
              {text.trim() ? (
                <Pressable 
                  style={styles.sendBtn} 
                  onPress={async () => {
                    if (!text.trim()) return;
                    try {
                      await chatService.send(selectedUser.username || '', text);
                      setText('');
                      await loadHistory();
                    } catch (e) {
                      Alert.alert('Error', 'Failed to send');
                    }
                  }}
                >
                  <Ionicons name="send" size={20} color={colors.white} />
                </Pressable>
              ) : (
                <Pressable style={styles.micBtn} onPressIn={startRecording}>
                  <Ionicons name="mic" size={24} color={colors.white} />
                </Pressable>
              )}
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community</Text>
      
      <View style={styles.tabsContainer}>
        {(['Chats', 'Discover', 'Feed'] as const).map(tab => (
          <Pressable 
            key={tab} 
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'Discover' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBox}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search farmers or neighbours"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              onSubmitEditing={handleSearch}
            />
            <Pressable style={styles.searchBtn} onPress={handleSearch}>
              <Ionicons name="search" size={20} color={colors.white} />
            </Pressable>
          </View>

          {searching ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <Pressable style={styles.userItem} onPress={() => setSelectedUser(item)}>
                  <Image source={{ uri: item.profileImage || 'https://via.placeholder.com/100' }} style={styles.itemAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.fullName}</Text>
                    <Text style={styles.itemRole}>{item.role.toUpperCase()} {item.farmName ? `• ${item.farmName}` : ''}</Text>
                  </View>
                  <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                </Pressable>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Find someone to chat with!</Text>}
            />
          )}
        </View>
      ) : activeTab === 'Chats' ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.border} />
          <Text style={styles.emptyText}>Start a conversation from Discover tab</Text>
          <PrimaryButton title="Go to Discover" onPress={() => setActiveTab('Discover')} style={{ marginTop: 20 }} />
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="newspaper-outline" size={64} color={colors.border} />
          <Text style={styles.emptyText}>Community Feed Coming Soon!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, paddingTop: 60 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', marginHorizontal: spacing.xl },
  
  tabsContainer: { 
    flexDirection: 'row', 
    margin: spacing.xl, 
    backgroundColor: colors.white, 
    borderRadius: radii.xl, 
    padding: 4, 
    ...shadows.soft 
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radii.lg },
  tabBtnActive: { backgroundColor: colors.primary },
  tabText: { color: colors.muted, fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: colors.white },

  searchBox: { flexDirection: 'row', marginHorizontal: spacing.xl, gap: 10, marginBottom: spacing.lg },
  searchInput: { flex: 1, backgroundColor: colors.white, borderRadius: radii.lg, paddingHorizontal: 16, paddingVertical: 12, ...shadows.soft },
  searchBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, width: 48, alignItems: 'center', justifyContent: 'center' },

  userItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: spacing.xl, marginBottom: spacing.md, padding: spacing.lg, borderRadius: radii.xl, ...shadows.soft },
  itemAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: spacing.md },
  itemName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  itemRole: { color: colors.muted, fontSize: 12, marginTop: 2 },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 40, fontSize: 16 },

  // Chat Interface
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: spacing.md },
  chatName: { color: colors.text, fontSize: 18, fontWeight: '800' },
  chatStatus: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  
  bubble: { borderRadius: 20, padding: 12, marginBottom: 12, maxWidth: '80%', ...shadows.soft },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: colors.white },
  bubbleText: { fontSize: 15, color: colors.text, lineHeight: 20 },
  time: { fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 4, alignSelf: 'flex-end' },
  voiceBubble: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  composerContainer: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 },
  chatInput: { flex: 1, backgroundColor: colors.background, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, color: colors.text },
  micBtn: { width: 48, height: 48, backgroundColor: colors.primary, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { width: 40, height: 40, backgroundColor: colors.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  
  recordingOverlay: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGreen, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
  recordingPulse: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.danger },
  recordingTime: { flex: 1, color: colors.primary, fontWeight: '700' },
  stopBtn: { backgroundColor: colors.danger, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});


