import type { AuthResponse } from '../types/auth';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const loginWithGoogleApi = async (_idToken: string): Promise<AuthResponse> => {
  await sleep(1200); // Simulate network latency
  
  // Return mock google login user response
  return {
    accessToken: 'mock-google-access-token-' + Date.now(),
    refreshToken: 'mock-google-refresh-token-' + Date.now(),
    provider: 'google',
    user: {
      id: 99,
      email: 'reader@gmail.com',
      name: 'Google Reader',
      roles: ['user'],
    },
  };
};

export const loginLocalApi = async (email: string, password: string): Promise<AuthResponse> => {
  await sleep(1500); // Simulate network latency
  
  if (password !== 'cloudian123') {
    throw new Error('Mật khẩu không chính xác hoặc tài khoản không tồn tại.');
  }

  if (email === 'admin@gmail.com') {
    return {
      accessToken: 'mock-admin-access-token-' + Date.now(),
      refreshToken: 'mock-admin-refresh-token-' + Date.now(),
      provider: 'local',
      user: {
        id: 1,
        email: 'admin@gmail.com',
        name: 'System Administrator',
        roles: ['admin', 'manager', 'user'],
      },
    };
  } else if (email === 'manager@gmail.com') {
    return {
      accessToken: 'mock-manager-access-token-' + Date.now(),
      refreshToken: 'mock-manager-refresh-token-' + Date.now(),
      provider: 'local',
      user: {
        id: 2,
        email: 'manager@gmail.com',
        name: 'Content Creator',
        roles: ['manager', 'user'],
      },
    };
  } else if (email === 'user@gmail.com') {
    return {
      accessToken: 'mock-user-access-token-' + Date.now(),
      refreshToken: 'mock-user-refresh-token-' + Date.now(),
      provider: 'local',
      user: {
        id: 3,
        email: 'user@gmail.com',
        name: 'Regular Reader',
        roles: ['user'],
      },
    };
  } else {
    // Generate a default mock reader user on-the-fly if password matches
    return {
      accessToken: 'mock-demo-access-token-' + Date.now(),
      refreshToken: 'mock-demo-refresh-token-' + Date.now(),
      provider: 'local',
      user: {
        id: 42,
        email,
        name: email.split('@')[0] || 'User',
        roles: ['user'],
      },
    };
  }
};

export const changePasswordApi = async (_password: string, _token: string): Promise<string> => {
  await sleep(1000);
  return 'Password updated successfully';
};

export const registerApi = async (data: {
  email: string;
  name: string;
  password?: string;
  nickName?: string;
}): Promise<any> => {
  await sleep(1200);
  return {
    success: true,
    user: {
      id: 5,
      email: data.email,
      name: data.name,
    },
    verifyToken: 'mock-verify-token-' + Date.now(),
  };
};

export const verifyAccountApi = async (code: string): Promise<string> => {
  await sleep(1000);
  console.log('Verifying security token:', code);
  return 'Account verified successfully';
};
