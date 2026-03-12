import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getSignals } from '../../api/signals';
import { getProfile } from '../../api/profile';
import type { Signal } from '../../types/api';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface SignalItemProps {
  signal: Signal;
  isMine: boolean;
}

function SignalItem({ signal, isMine }: SignalItemProps) {
  return (
    <View style={[styles.card, isMine ? styles.cardSent : styles.cardReceived]}>
      <View style={[styles.avatar, isMine ? styles.avatarSent : styles.avatarReceived]}>
        <Text style={[styles.avatarText, isMine ? styles.avatarTextSent : styles.avatarTextReceived]}>
          {initials(signal.senderName)}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.senderName} numberOfLines={1}>
            {isMine ? 'You' : (signal.senderName ?? 'Someone')}
          </Text>
          <Text style={styles.timestamp}>{timeAgo(signal.sentAt)}</Text>
        </View>

        <Text style={styles.message}>
          {signal.message ?? 'Beer time!'}
        </Text>

        {signal.barName ? (
          <View style={styles.barRow}>
            <Text style={styles.barIcon}>📍</Text>
            <Text style={styles.barName}>{signal.barName}</Text>
          </View>
        ) : null}

        <Text style={[styles.badge, isMine ? styles.badgeSent : styles.badgeReceived]}>
          {isMine ? 'Sent' : 'Received'}
        </Text>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🍺</Text>
      <Text style={styles.emptyTitle}>No signals yet</Text>
      <Text style={styles.emptyBody}>
        Be the first to rally the crew!{'\n'}Hit Send Signal and get the party started.
      </Text>
    </View>
  );
}

export default function SignalFeedScreen() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch profile once to resolve the current user's ID for sent/received badges.
  useEffect(() => {
    getProfile()
      .then((res) => setMyId(res.data.id))
      .catch(() => {/* non-critical — badges just won't distinguish sent/received */});
  }, []);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await getSignals();
      setSignals(res.data);
    } catch {
      Alert.alert('Error', 'Could not load signals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={signals.length === 0 ? styles.listEmptyContainer : styles.listContent}
      data={signals}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyState />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor="#F59E0B"
          colors={['#F59E0B']}
        />
      }
      renderItem={({ item }) => (
        <SignalItem signal={item} isMine={item.senderId === myId} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#F9FAFB' },
  listContent: { padding: 16, gap: 12 },
  listEmptyContainer: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Card ────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSent: { backgroundColor: '#FFFBEB' },
  cardReceived: { backgroundColor: '#EFF6FF' },

  // ── Avatar ──────────────────────────────────────────────────
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarSent: { backgroundColor: '#FEF3C7' },
  avatarReceived: { backgroundColor: '#DBEAFE' },
  avatarText: { fontSize: 16, fontWeight: '700' },
  avatarTextSent: { color: '#D97706' },
  avatarTextReceived: { color: '#1D4ED8' },

  // ── Card body ───────────────────────────────────────────────
  cardBody: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  senderName: { fontSize: 14, fontWeight: '700', color: '#1C1C1E', flex: 1 },
  timestamp: { fontSize: 11, color: '#9CA3AF', marginLeft: 8 },
  message: { fontSize: 15, color: '#374151', marginBottom: 6 },

  barRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  barIcon: { fontSize: 12 },
  barName: { fontSize: 12, color: '#6B7280' },

  badge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeSent: { backgroundColor: '#FDE68A', color: '#92400E' },
  badgeReceived: { backgroundColor: '#BFDBFE', color: '#1E3A8A' },

  // ── Empty state ─────────────────────────────────────────────
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  emptyBody: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});
