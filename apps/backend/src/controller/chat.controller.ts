import { AuthMiddleware } from '@/middleware/auth.middleware';
import { rateLimitMiddleware } from '@/middleware/rateLimit.middlware';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';
import {
    CreateChatSessionDto,
    SendMessageDto,
    ChatSessionCodeParam,
} from '@/schema/chat.schema';
import {
    createChatSession,
    getUserChatSessions,
    getChatMessages,
    sendChatMessage,
} from '@/service/chat.service';

const route = new Hono<AppEnv>();
const tags = ['AI Chat'];

// AI Chat is only accessible to authenticated users
route.use('*', AuthMiddleware);

route.post(
    '/session',
    describeRoute({
        tags,
        summary: 'Create AI Chat session',
        description: 'Initialize a new chat session for the authenticated user.',
    }),
    rateLimitMiddleware({
        limit: 3,
        window: '15 m',
        key: (c) => {
            const user = c.get('user');
            return `${user.sub}:chat-session`;
        },
    }),
    validator('json', CreateChatSessionDto),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const session = await createChatSession(db, userId);
        return c.json(session, 201);
    }
);

route.get(
    '/sessions',
    describeRoute({
        tags,
        summary: 'Get user chat sessions',
        description: 'Get all chat sessions associated with the authenticated user.',
    }),
    rateLimitMiddleware({
        limit: 30,
        window: '1 m',
        key: (c) => {
            const user = c.get('user');
            return `${user.sub}:chat-sessions`;
        },
    }),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const sessions = await getUserChatSessions(db, userId);
        return c.json(sessions);
    }
);

route.get(
    '/sessions/:code/messages',
    describeRoute({
        tags,
        summary: 'Get session messages',
        description: 'Retrieve conversation history for a given chat session code.',
    }),
    rateLimitMiddleware({
        limit: 30,
        window: '1 m',
        key: (c) => {
            const user = c.get('user');
            return `${user.sub}:chat-messages`;
        },
    }),
    validator('param', ChatSessionCodeParam),
    async (c) => {
        const db = await c.get('db');
        const { code } = await c.req.valid('param');
        const user = c.get('user');
        const userId = Number(user.sub);
        const messages = await getChatMessages(db, code, userId);
        return c.json(messages);
    }
);

route.post(
    '/message',
    describeRoute({
        tags,
        summary: 'Send message to AI Chat session',
        description: 'Post a new message to a session and get the AI assistant response.',
    }),
    rateLimitMiddleware({
        limit: 10,
        window: '5 m',
        key: (c) => {
            const user = c.get('user');
            return `${user.sub}:chat-message`;
        },
    }),
    validator('json', SendMessageDto),
    async (c) => {
        const db = await c.get('db');
        const { sessionCode, content, activePostId } = await c.req.valid('json');
        const user = c.get('user');
        const userId = Number(user.sub);
        const response = await sendChatMessage(
            db,
            sessionCode,
            content,
            userId,
            activePostId
        );
        return c.json(response, 201);
    }
);

export default route;
