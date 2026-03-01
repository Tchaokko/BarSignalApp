import client from './client';
import type { FriendsListResponse } from '../types/api';

export const getFriends = () =>
  client.get<FriendsListResponse>('/friends');

export const addFriend = (friendId: string) =>
  client.post(`/friends/${friendId}`);

export const removeFriend = (friendId: string) =>
  client.delete(`/friends/${friendId}`);
