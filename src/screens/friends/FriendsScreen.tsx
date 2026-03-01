import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getFriends, addFriend, removeFriend } from '../../api/friends';
import type { Friend } from '../../types/api';

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [addId, setAddId] = useState('');
  const [adding, setAdding] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      const res = await getFriends();
      setFriends(res.data);
    } catch {
      Alert.alert('Error', 'Could not load friends.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFriends(); }, [loadFriends]);

  const handleAdd = async () => {
    if (!addId.trim()) return;
    setAdding(true);
    try {
      await addFriend(addId.trim());
      setAddId('');
      loadFriends();
    } catch {
      Alert.alert('Error', 'Could not add friend.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove friend', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFriend(id);
            loadFriends();
          } catch {
            Alert.alert('Error', 'Could not remove friend.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Friend user ID (UUID)"
          autoCapitalize="none"
          value={addId}
          onChangeText={setAddId}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={adding}>
          {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>Add</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No friends yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.displayName ?? item.id}</Text>
            <TouchableOpacity onPress={() => handleRemove(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', marginTop: 32 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  name: { fontSize: 16 },
  remove: { color: '#FF3B30', fontSize: 14 },
});
