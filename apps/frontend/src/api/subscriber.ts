const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const subscribeApi = async (data: { email: string; name: string }): Promise<any> => {
  await sleep(600); // Simulate network latency
  return {
    success: true,
    subscriber: {
      id: Date.now(),
      email: data.email,
      name: data.name,
    },
  };
};
