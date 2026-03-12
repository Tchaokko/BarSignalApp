import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getFriends } from '../../api/friends';
import { sendSignal } from '../../api/signals';
import type { Friend } from '../../types/api';
import NotificationPermission from '../../components/NotificationPermission';

const DEFAULT_MESSAGE = 'Beer time!';

export default function SendSignalScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [message, setMessage] = useState('');
  const [barName, setBarName] = useState('');
  const [sending, setSending] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      const res = await getFriends();
      const list: Friend[] = res.data;
      setFriends(list);
      // Default: all selected
      setSelectedIds(new Set(list.map((f) => f.id)));
    } catch {
      Alert.alert('Oops', 'Could not load your friends list.');
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  useEffect(() => { loadFriends(); }, [loadFriends]);

  const allSelected =
    friends.length > 0 && selectedIds.size === friends.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(friends.map((f) => f.id)));
    }
  };

  const toggleFriend = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSend = async () => {
    if (friends.length > 0 && selectedIds.size === 0) {
      Alert.alert('No recipients', 'Select at least one friend to signal.');
      return;
    }

    setSending(true);
    try {
      await sendSignal({
        message: message.trim() || DEFAULT_MESSAGE,
        barName: barName.trim() || null,
        // null = all friends (broadcast); explicit array when a subset is chosen
        friendIds: allSelected ? null : Array.from(selectedIds),
      });
      Alert.alert('Signal sent! 🍺', 'Your crew has been rallied.');
      setMessage('');
      setBarName('');
    } catch {
      Alert.alert('Failed to send', 'Something went wrong. Try again!');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <NotificationPermission />

        <Text style={styles.heading}>Send a Signal</Text>
        <Text style={styles.subheading}>Rally the crew — it's time for a round 🍻</Text>

        {/* ── Message ──────────────────────────────────────────── */}
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={styles.input}
          placeholder={DEFAULT_MESSAGE}
          value={message}
          onChangeText={setMessage}
          returnKeyType="next"
        />

        {/* ── Bar name ─────────────────────────────────────────── */}
        <Text style={styles.label}>Bar name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. The Rusty Anchor"
          value={barName}
          onChangeText={setBarName}
          returnKeyType="done"
        />

        {/* ── Friend selector ──────────────────────────────────── */}
        <View style={styles.friendsHeader}>
          <Text style={styles.label}>Send to</Text>
          {!loadingFriends && friends.length > 0 && (
            <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAll}>
              <Text style={styles.selectAllText}>
                {allSelected ? 'Deselect all' : 'Select all'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingFriends ? (
          <ActivityIndicator style={styles.loader} />
        ) : friends.length === 0 ? (
          <Text style={styles.noFriends}>
            Add some friends first, then signal them! 👀
          </Text>
        ) : (
          <View style={styles.friendList}>
            {friends.map((friend) => (
              <View key={friend.id} style={styles.friendRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(friend.displayName ?? '?')[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.friendName} numberOfLines={1}>
                  {friend.displayName ?? friend.id}
                </Text>
                <Switch
                  value={selectedIds.has(friend.id)}
                  onValueChange={() => toggleFriend(friend.id)}
                  trackColor={{ true: '#F59E0B', false: '#E5E7EB' }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        )}

        {/* ── CTA ──────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>🍺  Send Signal</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, paddingBottom: 40 },

  heading: { fontSize: 26, fontWeight: '800', color: '#1C1C1E', marginBottom: 4 },
  subheading: { fontSize: 14, color: '#8E8E93', marginBottom: 24 },

  label: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },

  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectAll: { paddingVertical: 4 },
  selectAllText: { fontSize: 13, color: '#F59E0B', fontWeight: '600' },

  loader: { marginVertical: 16 },
  noFriends: { color: '#9CA3AF', fontSize: 14, marginBottom: 16, fontStyle: 'italic' },

  friendList: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#D97706' },
  friendName: { flex: 1, fontSize: 15, color: '#1C1C1E' },

  sendButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: { opacity: 0.6 },
  sendButtonText: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
});
