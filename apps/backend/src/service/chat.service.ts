import { createDb } from '@/db';
import { ChatMessageModel, ChatSessionModel, PostModel } from '@/model';
import { buildAgent } from '@/agent/llm';
import { HumanMessage, AIMessage, SystemMessage } from 'langchain';
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
    userId?: number,
    activePostId?: number
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

        let contextMessage: SystemMessage | null = null;
        if (activePostId) {
            const post = await db.query.PostModel.findFirst({
                where: eq(PostModel.id, activePostId),
            });
            if (post) {
                contextMessage = new SystemMessage(
                    `USER CONTEXT: The user is currently reading the blog post titled "${post.title}" (ID: ${post.id}, Slug: ${post.slug}). ` +
                    `If the user refers to "this post", "this article", "bài viết này", "bài blog này", or asks questions about what they are reading, ` +
                    `you should base your answers on this post. You can use your tools to fetch more details about this postId if needed.`
                );
            }
        }

        const langchainMessages = [
            ...(contextMessage ? [contextMessage] : []),
            ...messagesFromDb.map((msg) => {
                if (msg.role === 'user') {
                    return new HumanMessage(msg.content);
                } else {
                    let content = msg.content;
                    if (content.startsWith('[') && content.endsWith(']')) {
                        try {
                            const parsed = JSON.parse(content);
                            if (Array.isArray(parsed)) {
                                const textBlocks = parsed.filter((block: any) => block && block.type === 'text');
                                content = textBlocks.map((block: any) => block.text).join('\n');
                            }
                        } catch {
                            // no-op
                        }
                    }
                    return new AIMessage(content);
                }
            })
        ];

        const agent = buildAgent(db);
        const agentResult = await agent.invoke({
            messages: langchainMessages,
        });

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
                : Array.isArray(replyMessage.content)
                    ? replyMessage.content
                        .filter((block: any) => block && block.type === 'text')
                        .map((block: any) => block.text)
                        .join('\n')
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
