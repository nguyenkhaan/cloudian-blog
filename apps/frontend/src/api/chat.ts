import type { ChatSession, ChatMessage, SendMessageResponse } from '../types/chat';
import client from './client';

export const createChatSessionApi = async (): Promise<ChatSession> => {
  const response = await client.post<ChatSession>('/chat/session');
  return response.data;
};

export const getUserChatSessionsApi = async (): Promise<ChatSession[]> => {
  const response = await client.get<ChatSession[]>('/chat/sessions');
  return response.data;
};

export const getSessionMessagesApi = async (code: string): Promise<ChatMessage[]> => {
  const response = await client.get<ChatMessage[]>(`/chat/sessions/${code}/messages`);
  return response.data;
};

export const sendChatMessageApi = async (data: {
  sessionCode: string;
  content: string;
  activePostId?: number;
}): Promise<SendMessageResponse> => {
  const response = await client.post<SendMessageResponse>('/chat/message', data);
  return response.data;
};
