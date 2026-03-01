import client from './client';
import type { UserProfile, UserProfileUpdate } from '../types/api';

export const getProfile = () =>
  client.get<UserProfile>('/profile');

export const updateProfile = (data: UserProfileUpdate) =>
  client.put<UserProfile>('/profile', data);
