import { z } from 'zod';

export const CreateChatSessionDto = z.object({}).optional();

export const SendMessageDto = z.object({
    sessionCode: z.string().min(1, 'Session code is required'),
    content: z.string().min(1, 'Message content cannot be empty'),
});

export const ChatSessionCodeParam = z.object({
    code: z.string().min(1, 'Session code parameter is required'),
});

export type CreateChatSessionDtoType = z.infer<typeof CreateChatSessionDto>;
export type SendMessageDtoType = z.infer<typeof SendMessageDto>;
export type ChatSessionCodeParamType = z.infer<typeof ChatSessionCodeParam>;
