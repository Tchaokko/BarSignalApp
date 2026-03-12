import client from './client';
import type { SendSignalRequest, SignalsListResponse } from '../types/api';

export const sendSignal = (body: SendSignalRequest) =>
  client.post('/api/signals', body);

export const getSignals = (page = 1, pageSize = 20) =>
  client.get<SignalsListResponse>('/api/signals', {
    params: { page, pageSize },
  });
