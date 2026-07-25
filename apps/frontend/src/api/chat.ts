import type { ChatSession, ChatMessage, SendMessageResponse } from '../types/chat';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I am the Cloudian AI Assistant. How can I help you today?',
    createdAt: new Date().toISOString(),
  }
];

export const createChatSessionApi = async (): Promise<ChatSession> => {
  await sleep(400);
  return {
    id: 1,
    code: 'mock-session-code-123',
    userId: 99,
    messageCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const getUserChatSessionsApi = async (): Promise<ChatSession[]> => {
  await sleep(300);
  return [
    {
      id: 1,
      code: 'mock-session-code-123',
      userId: 99,
      messageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
};

export const getSessionMessagesApi = async (_code: string): Promise<ChatMessage[]> => {
  await sleep(400);
  return [...MOCK_MESSAGES];
};

export const sendChatMessageApi = async (data: {
  sessionCode: string;
  content: string;
  activePostId?: number;
}): Promise<SendMessageResponse> => {
  await sleep(1000); // Simulate bot typing latency

  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: data.content,
    createdAt: new Date().toISOString(),
  };

  let botReply = `I received your question about: "${data.content}". `;
  if (data.activePostId) {
    botReply += `I see you are currently reading blog ID: ${data.activePostId}. In the context of this post, here is the simulated response explaining caching strategy and edge computing.`;
  } else {
    botReply += `This is a mock assistant reply. You can ask me questions about systems architecture, React 19 compilation, vector databases, or scaling techniques!`;
  }

  const botMsg: ChatMessage = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: botReply,
    createdAt: new Date().toISOString(),
  };

  MOCK_MESSAGES.push(userMsg);
  MOCK_MESSAGES.push(botMsg);

  return {
    userMessage: userMsg,
    assistantMessage: botMsg,
  };
};
