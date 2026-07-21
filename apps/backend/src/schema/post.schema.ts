import { PostStatus } from '@/model';
import { z } from 'zod';

export const GetAllPostsQuery = z.object({
    limit: z.coerce.number().default(0).optional(),
    offset: z.coerce.number().default(10).optional(),
    tag: z
        .string()
        .transform((v) => v.split(','))
        .optional(),
    keyword: z.string().optional(),
    collection: z
        .string()
        .transform((v) => v.split(',').map((v) => Number(v)))
        .optional(),
});

export const GetAllAdminPostQuery = z.object({
    limit: z.coerce.number().default(10).optional(),
    offset: z.coerce.number().default(0).optional(),
    status: z.enum(PostStatus).optional().default(PostStatus.PUBLISHED),
});

export const getDetailPostParam = z.object({
    slugOrId: z.string(),
});

export const CreatePostDto = z.object({
    title: z.string(),
    content: z.string(),
    banner: z.string().optional(),
    slug: z.string().optional(),
    tagIds: z.array(z.number()).optional(),
    collectionIds: z.array(z.number()).optional(),
});

export const UpdatePostDto = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    banner: z.string().optional(),
    slug: z.string().optional(),
    tagIds: z.array(z.number()).optional(),
    collectionIds: z.array(z.number()).optional(),
});

export const UpdatePostParam = z.object({
    postId: z.string(),
});

export const GetUserPostsQuery = z.object({
    limit: z.coerce.number().default(10).optional(),
    offset: z.coerce.number().default(0).optional(),
    status: z.nativeEnum(PostStatus).optional(),
});

export const UpdatePostStatusDto = z.object({
    status: z.nativeEnum(PostStatus),
});

export const UpdatePostStatusParam = z.object({
    postId: z.string(),
});

export const SavePostCollectionsDto = z.object({
    collectionIds: z.array(z.number()),
});

export const SavePostCollectionsParam = z.object({
    postId: z.string(),
});

export const SavePostTagsDto = z.object({
    tagIds: z.array(z.number()),
});

export const SavePostTagsParam = z.object({
    postId: z.string(),
});

export const DeletePostParam = z.object({
    postId: z.string(),
});

export type GetAllPostQueryType = z.infer<typeof GetAllPostsQuery>;
export type GetAllAdminPostQueryType = z.infer<typeof GetAllAdminPostQuery>;
export type CreatePostDtoType = z.infer<typeof CreatePostDto>;
export type UpdatePostDtoType = z.infer<typeof UpdatePostDto>;
export type GetUserPostsQueryType = z.infer<typeof GetUserPostsQuery>;
export type UpdatePostStatusDtoType = z.infer<typeof UpdatePostStatusDto>;
export type SavePostCollectionsDtoType = z.infer<typeof SavePostCollectionsDto>;
export type SavePostTagsDtoType = z.infer<typeof SavePostTagsDto>;
