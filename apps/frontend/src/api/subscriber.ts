import client from './client';

export const subscribeApi = async (data: { email: string; name: string }): Promise<any> => {
  const response = await client.post<any>('/subscribers', data);
  return response.data;
};
