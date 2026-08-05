import type { AuthResponse } from '../types/auth';
import client from './client';

export const loginWithGoogleApi = async (idToken: string): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/login-google', { idToken });
  return response.data;
};

export const loginLocalApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

export const changePasswordApi = async (password: string, token: string): Promise<string> => {
  const response = await client.post<string>('/auth/change-password', { password }, {
    params: { token },
  });
  return response.data;
};

export const registerApi = async (data: {
  email: string;
  name: string;
  password?: string;
  nickName?: string;
}): Promise<any> => {
  const response = await client.post<any>('/auth/register', data);
  return response.data;
};

export const verifyAccountApi = async (code: string): Promise<string> => {
  const response = await client.get<string>('/auth/verify', {
    params: { code },
  });
  return response.data;
};

export const forgotPasswordApi = async (email: string): Promise<any> => {
  const response = await client.get<any>('/auth/forgot-password', {
    params: { email },
  });
  return response.data;
};

export const requestEmailChangeApi = async (data: {
  email: string;
  verificationTarget?: 'old' | 'new';
}): Promise<any> => {
  const response = await client.post<any>('/auth/change-email', data);
  return response.data;
};

export const updateProfileApi = async (data: {
  name: string;
  nickName?: string | null;
}): Promise<{ success: boolean; user: import('../types/auth').User }> => {
  const response = await client.patch<{ success: boolean; user: import('../types/auth').User }>(
    '/users/me/profile',
    data
  );
  return response.data;
};

export const verifyChangeEmailApi = async (
  code: string,
  verificationTarget?: 'old' | 'new'
): Promise<string> => {
  const response = await client.get<string>('/auth/verify-email-change', {
    params: {
      code,
      verificationTarget,
    },
  });
  return response.data;
};
