import { CommentStatus } from '@/model';
import { z } from 'zod';

export const CreateCommentDto = z.object({
    content: z.string().min(1, 'Comment content cannot be empty').meta({ example: 'This is an awesome blog post!' }),
});

export const UpdateCommentDto = z.object({
    content: z.string().min(1, 'Comment content cannot be empty').meta({ example: 'This is an updated comment content!' }),
});

export const CommentIdParam = z.object({
    commentId: z.coerce.number().meta({ example: '1' }),
});

export const PostIdParam = z.object({
    postId: z.coerce.number().meta({ example: '1' }),
});

export const UserIdParam = z.object({
    userId: z.coerce.number().meta({ example: '1' }),
});

export const UpdateCommentStatusDto = z.object({
    status: z.nativeEnum(CommentStatus).meta({ example: 'invalid' }),
});

export const GetAllCommentsQuery = z.object({
    limit: z.coerce.number().default(10).optional(),
    offset: z.coerce.number().default(0).optional(),
    postId: z.coerce.number().optional(),
    userId: z.coerce.number().optional(),
    status: z.nativeEnum(CommentStatus).optional(),
});

export type CreateCommentDtoType = z.infer<typeof CreateCommentDto>;
export type UpdateCommentDtoType = z.infer<typeof UpdateCommentDto>;
export type UpdateCommentStatusDtoType = z.infer<typeof UpdateCommentStatusDto>;
export type GetAllCommentsQueryType = z.infer<typeof GetAllCommentsQuery>;
