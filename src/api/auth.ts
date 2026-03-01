import client from './client';
import type { RegisterRequest, GoogleAuthRequest, AuthResponse } from '../types/api';

export const register = (data: RegisterRequest) =>
  client.post<AuthResponse>('/auth/register', data);

export const googleAuth = (data: GoogleAuthRequest) =>
  client.post<AuthResponse>('/auth/google', data);
