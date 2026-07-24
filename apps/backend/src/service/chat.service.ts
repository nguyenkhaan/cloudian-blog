import { createDb } from '@/db';
import { ChatMessageModel, ChatSessionModel } from '@/model';
import { buildAgent } from '@/agent/llm';
import { HumanMessage, AIMessage } from 'langchain';
import { eq, and, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { validateUserQuery, truncateUserQuery } from '@/helper/chat.security';

function generateRandomCode(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return `chat_${timestamp}_${randomSuffix}`;
}

function generateMessageId(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return `msg_${timestamp}_${randomSuffix}`;
}

export async function createChatSession(
    db: ReturnType<typeof createDb>,
    userId?: number
) {
    try {
        const code = generateRandomCode();
        const results = await db
            .insert(ChatSessionModel)
            .values({
                code,
                userId: userId || null,
                messageCount: 0,
            })
            .returning();

        const session = results[0];
        if (!session) {
            throw new HTTPException(500, {
                message: 'Failed to create chat session',
            });
        }
        return session;
    } catch (err) {
        console.error('Create chat session error: ', err);
        throw err;
    }
}

export async function getUserChatSessions(
    db: ReturnType<typeof createDb>,
    userId: number
) {
    try {
        const sessions = await db
            .select()
            .from(ChatSessionModel)
            .where(eq(ChatSessionModel.userId, userId))
            .orderBy(sql`${ChatSessionModel.id} DESC`);
        return sessions;
    } catch (err) {
        console.error('Get user chat sessions error: ', err);
        throw err;
    }
}

export async function getChatMessages(
    db: ReturnType<typeof createDb>,
    sessionCode: string,
    userId?: number
) {
    try {
        const session = await db.query.ChatSessionModel.findFirst({
            where: eq(ChatSessionModel.code, sessionCode),
        });

        if (!session) {
            throw new HTTPException(404, {
                message: 'Chat session not found',
            });
        }

        if (session.userId && session.userId !== userId) {
            throw new HTTPException(403, {
                message: 'Access to this chat session is forbidden',
            });
        }

        const messages = await db
            .select()
            .from(ChatMessageModel)
            .where(eq(ChatMessageModel.sessionId, session.id))
            .orderBy(sql`${ChatMessageModel.createdAt} ASC`);

        return messages;
    } catch (err) {
        console.error('Get chat messages error: ', err);
        throw err;
    }
}

export async function sendChatMessage(
    db: ReturnType<typeof createDb>,
    sessionCode: string,
    content: string,
    userId?: number
) {
    try {
        // 1. Find session
        const session = await db.query.ChatSessionModel.findFirst({
            where: eq(ChatSessionModel.code, sessionCode),
        });

        if (!session) {
            throw new HTTPException(404, {
                message: 'Chat session not found',
            });
        }
        if (session.userId && session.userId !== userId) {
            throw new HTTPException(403, {
                message: 'Access to this chat session is forbidden',
            });
        }
        if (!validateUserQuery(content)) {
            throw new HTTPException(400, {
                message: 'Invalid message query content',
            });
        }
        const cleanContent = truncateUserQuery(content);


        const userMsgId = generateMessageId();
        await db.insert(ChatMessageModel).values({
            id: userMsgId,
            content: cleanContent,
            userId: userId || null,
            role: 'user',
            sessionId: session.id,
        });


        const messagesFromDb = await db
            .select()
            .from(ChatMessageModel)
            .where(eq(ChatMessageModel.sessionId, session.id))
            .limit(10)
            .orderBy(sql`${ChatMessageModel.createdAt} ASC`);

        const langchainMessages = messagesFromDb.map((msg) => {
            if (msg.role === 'user') {
                return new HumanMessage(msg.content);
            } else {
                return new AIMessage(msg.content);
            }
        });

        // 5. Build agent and invoke
        const agent = buildAgent(db);
        const agentResult = await agent.invoke({
            messages: langchainMessages,
        });

        // 6. Extract reply
        const replyMessage =
            agentResult.messages[agentResult.messages.length - 1];
        if (!replyMessage) {
            throw new HTTPException(500, {
                message: 'AI did not return any response',
            });
        }

        const replyContent =
            typeof replyMessage.content === 'string'
                ? replyMessage.content
                : JSON.stringify(replyMessage.content);

        const assistantMsgId = generateMessageId();
        const assistantMsgValues = {
            id: assistantMsgId,
            content: replyContent,
            userId: null,
            role: 'assistant' as const,
            sessionId: session.id,
        };
        await db.insert(ChatMessageModel).values(assistantMsgValues);
        await db
            .update(ChatSessionModel)
            .set({
                messageCount: (session.messageCount || 0) + 2,
            })
            .where(eq(ChatSessionModel.id, session.id));

        return {
            userMessage: {
                id: userMsgId,
                content: cleanContent,
                role: 'user' as const,
                createdAt: new Date(),
            },
            assistantMessage: {
                id: assistantMsgId,
                content: replyContent,
                role: 'assistant' as const,
                createdAt: new Date(),
            },
        };
    } catch (err) {
        console.error('Send chat message error: ', err);
        throw err;
    }
}
