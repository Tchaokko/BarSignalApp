import client from './client';
import type { RegisterRequest, LoginRequest, GoogleAuthRequest, AuthResponse } from '../types/api';

export const register = (data: RegisterRequest) =>
  client.post<AuthResponse>('/auth/register', data);

export const login = (data: LoginRequest) =>
  client.post<AuthResponse>('/auth/login', data);

export const googleAuth = (data: GoogleAuthRequest) =>
  client.post<AuthResponse>('/auth/google', data);
