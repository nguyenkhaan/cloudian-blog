import { createDb } from '@/db';
import { CommentModel, CommentStatus, PostModel, PostStatus, UserModel, Role } from '@/model';
import {
    CreateCommentDtoType,
    UpdateCommentDtoType,
    GetAllCommentsQueryType,
} from '@/schema/comment.schema';
import { and, desc, eq, sql, SQL } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export async function createComment(
    db: ReturnType<typeof createDb>,
    userId: number,
    postId: number,
    data: CreateCommentDtoType
) {
    try {

        const post = await db.query.PostModel.findFirst({
            where: and(
                eq(PostModel.id, postId),
                eq(PostModel.status, PostStatus.PUBLISHED)
            ),
        });

        if (!post) {
            throw new HTTPException(404, {
                message: 'Post not found or not published',
            });
        }

        const result = await db
            .insert(CommentModel)
            .values({
                content: data.content,
                userId: userId,
                postId: postId,
                status: CommentStatus.ACTIVE,
            })
            .returning({ id: CommentModel.id });

        const created = result[0];
        if (!created) {
            throw new HTTPException(500, {
                message: 'Failed to create comment',
            });
        }

        return {
            success: true,
            commentId: created.id,
        };
    } catch (err) {
        console.error('Create comment error: ', err);
        throw err;
    }
}

export async function getCommentsByPostId(
    db: ReturnType<typeof createDb>,
    postId: number
) {
    try {
        const results = await db
            .select({
                id: CommentModel.id,
                content: CommentModel.content,
                createdAt: CommentModel.createdAt,
                updatedAt: CommentModel.updatedAt,
                user: {
                    id: UserModel.id,
                    name: UserModel.name,
                    nickName: UserModel.nickName,
                },
            })
            .from(CommentModel)
            .innerJoin(UserModel, eq(CommentModel.userId, UserModel.id))
            .where(
                and(
                    eq(CommentModel.postId, postId),
                    eq(CommentModel.status, CommentStatus.ACTIVE)
                )
            )
            .orderBy(desc(CommentModel.createdAt));

        return results;
    } catch (err) {
        console.error('Get comments by post error: ', err);
        throw err;
    }
}

export async function getCommentsByUserId(
    db: ReturnType<typeof createDb>,
    userId: number
) {
    try {
        const results = await db
            .select({
                id: CommentModel.id,
                content: CommentModel.content,
                createdAt: CommentModel.createdAt,
                updatedAt: CommentModel.updatedAt,
                postId: CommentModel.postId,
                postTitle: PostModel.title,
                postSlug: PostModel.slug,
                status: CommentModel.status,
            })
            .from(CommentModel)
            .innerJoin(PostModel, eq(CommentModel.postId, PostModel.id))
            .where(eq(CommentModel.userId, userId))
            .orderBy(desc(CommentModel.createdAt));

        return results;
    } catch (err) {
        console.error('Get comments by user error: ', err);
        throw err;
    }
}

export async function updateComment(
    db: ReturnType<typeof createDb>,
    userId: number,
    commentId: number,
    data: UpdateCommentDtoType,
    userRoles: string[]
) {
    try {
        const comment = await db.query.CommentModel.findFirst({
            where: eq(CommentModel.id, commentId),
        });

        if (!comment) {
            throw new HTTPException(404, {
                message: 'Comment not found',
            });
        }

        if (comment.userId !== userId) {
            throw new HTTPException(403, {
                message: 'You are not allowed to update this comment',
            });
        }

        await db
            .update(CommentModel)
            .set({
                content: data.content,
                updatedAt: new Date(),
            })
            .where(eq(CommentModel.id, commentId));

        return {
            success: true,
        };
    } catch (err) {
        console.error('Update comment error: ', err);
        throw err;
    }
}

export async function deleteComment(
    db: ReturnType<typeof createDb>,
    userId: number,
    commentId: number,
    userRoles: string[]
) {
    try {
        const comment = await db.query.CommentModel.findFirst({
            where: eq(CommentModel.id, commentId),
        });

        if (!comment) {
            throw new HTTPException(404, {
                message: 'Comment not found',
            });
        }

        const isOwner = comment.userId === userId;
        const isAdminOrManager = userRoles.includes(Role.ADMIN) || userRoles.includes(Role.MANAGER);

        if (!isOwner && !isAdminOrManager) {
            throw new HTTPException(403, {
                message: 'You are not allowed to delete this comment',
            });
        }

        await db.delete(CommentModel).where(eq(CommentModel.id, commentId));

        return {
            success: true,
        };
    } catch (err) {
        console.error('Delete comment error: ', err);
        throw err;
    }
}

export async function getAllComments(
    db: ReturnType<typeof createDb>,
    query: GetAllCommentsQueryType
) {
    try {
        const conditions: SQL[] = [];

        if (query.postId !== undefined) {
            conditions.push(eq(CommentModel.postId, query.postId));
        }
        if (query.userId !== undefined) {
            conditions.push(eq(CommentModel.userId, query.userId));
        }
        if (query.status !== undefined) {
            conditions.push(eq(CommentModel.status, query.status));
        }

        const results = await db
            .select({
                id: CommentModel.id,
                content: CommentModel.content,
                status: CommentModel.status,
                createdAt: CommentModel.createdAt,
                updatedAt: CommentModel.updatedAt,
                user: {
                    id: UserModel.id,
                    name: UserModel.name,
                    nickName: UserModel.nickName,
                    email: UserModel.email,
                },
                post: {
                    id: PostModel.id,
                    title: PostModel.title,
                    slug: PostModel.slug,
                },
            })
            .from(CommentModel)
            .innerJoin(UserModel, eq(CommentModel.userId, UserModel.id))
            .innerJoin(PostModel, eq(CommentModel.postId, PostModel.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .limit(query.limit || 10)
            .offset(query.offset || 0)
            .orderBy(desc(CommentModel.createdAt));

        return results;
    } catch (err) {
        console.error('Get all comments error: ', err);
        throw err;
    }
}

export async function updateCommentStatus(
    db: ReturnType<typeof createDb>,
    commentId: number,
    status: CommentStatus
) {
    try {
        const comment = await db.query.CommentModel.findFirst({
            where: eq(CommentModel.id, commentId),
        });

        if (!comment) {
            throw new HTTPException(404, {
                message: 'Comment not found',
            });
        }

        await db
            .update(CommentModel)
            .set({
                status: status,
                updatedAt: new Date(),
            })
            .where(eq(CommentModel.id, commentId));

        return {
            success: true,
        };
    } catch (err) {
        console.error('Update comment status error: ', err);
        throw err;
    }
}
