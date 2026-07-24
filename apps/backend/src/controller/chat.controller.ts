import { AuthMiddleware } from '@/middleware/auth.middleware';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';
import { verifyToken } from '@/service/jwt.service';
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
import { HTTPException } from 'hono/http-exception';

const route = new Hono<AppEnv>();
const tags = ['AI Chat'];

async function getOptionalUser(c: any): Promise<number | undefined> {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return undefined;
    }
    const token = authHeader.substring(7);
    try {
        const secret = c.env.JWT_ACCESS_SECRET;
        const payload = await verifyToken(token, secret);
        return Number(payload.sub);
    } catch (err) {
        throw new HTTPException(401, {
            message: 'Invalid or expired authentication token',
        });
    }
}

route.post(
    '/session',
    describeRoute({
        tags,
        summary: 'Create AI Chat session',
        description:
            'Initialize a new chat session. Can be done as a guest or authenticated user.',
    }),
    validator('json', CreateChatSessionDto),
    async (c) => {
        const db = await c.get('db');
        const userId = await getOptionalUser(c);
        const session = await createChatSession(db, userId);
        return c.json(session, 201);
    }
);

route.get(
    '/sessions',
    AuthMiddleware,
    describeRoute({
        tags,
        summary: 'Get user chat sessions',
        description:
            'Get all chat sessions associated with the authenticated user.',
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
        description:
            'Retrieve conversation history for a given chat session code.',
    }),
    validator('param', ChatSessionCodeParam),
    async (c) => {
        const db = await c.get('db');
        const { code } = await c.req.valid('param');
        const userId = await getOptionalUser(c);
        const messages = await getChatMessages(db, code, userId);
        return c.json(messages);
    }
);

route.post(
    '/message',
    describeRoute({
        tags,
        summary: 'Send message to AI Chat session',
        description:
            'Post a new message to a session and get the AI assistant response.',
    }),
    validator('json', SendMessageDto),
    async (c) => {
        const db = await c.get('db');
        const { sessionCode, content } = await c.req.valid('json');
        const userId = await getOptionalUser(c);
        const response = await sendChatMessage(
            db,
            sessionCode,
            content,
            userId
        );
        return c.json(response, 201);
    }
);

export default route;
