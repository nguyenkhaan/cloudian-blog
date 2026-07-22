import { cloudinary } from '@/core/cloudianry.config';
import { createDb } from '@/db';
import {
    CollectionModel,
    PostCollectionModel,
    PostModel,
    PostStatus,
    PostTagModel,
    TagModel,
    UserModel,
    Role,
} from '@/model';
import {
    CreatePostDtoType,
    GetAllAdminPostQueryType,
    GetAllPostQueryType,
    GetUserPostsQueryType,
    UpdatePostDtoType,
} from '@/schema/post.schema';
import { and, desc, eq, inArray, SQL } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { displayPartsToString } from 'typescript';

export async function getAllPost(
    db: ReturnType<typeof createDb>,
    data: GetAllPostQueryType
) {
    try {
        const conditions: SQL[] = [];
        if (data.tag && data.tag.length > 0)
            conditions.push(inArray(TagModel.name, data.tag));

        if (data.collection && data.collection.length > 0)
            conditions.push(inArray(CollectionModel.id, data.collection));
        if (data.keyword) conditions.push(eq(PostModel.title, data.keyword));
        const results = await db
            .selectDistinct({
                id: PostModel.id,
                title: PostModel.title,
                slug: PostModel.slug,
                banner: PostModel.banner,
                publishedAt: PostModel.publishedAt,
                authorName: UserModel.name,
                nickName: UserModel.nickName,
                tagId: TagModel.id,
                tagSlug: TagModel.slug,
                tagName: TagModel.name,
                collectionId: CollectionModel.id,
                collectionName: CollectionModel.name,
            })
            .from(PostModel)
            .leftJoin(PostTagModel, eq(PostModel.id, PostTagModel.postId))
            .innerJoin(UserModel, eq(UserModel.id, PostModel.authorId))
            .leftJoin(TagModel, eq(TagModel.id, PostTagModel.tagId))
            .leftJoin(
                PostCollectionModel,
                eq(PostCollectionModel.postId, PostModel.id)
            )
            .leftJoin(
                CollectionModel,
                eq(PostCollectionModel.collectionId, CollectionModel.id)
            )
            .where(
                conditions.length > 0
                    ? and(
                          ...conditions,
                          eq(PostModel.status, PostStatus.PUBLISHED)
                      )
                    : undefined
            )
            //Chi lay danh sach cac bai viet da duoc xuat ban
            .limit(data.limit || 0)
            .offset(data.offset || 0)
            .orderBy(desc(PostModel.publishedAt));
        const map = new Map<number, any>();
        for (const row of results) {
            if (!map.has(row.id)) {
                map.set(row.id, {
                    id: row.id,
                    title: row.title,
                    slug: row.slug,
                    banner: row.banner,
                    publishedAt: row.publishedAt,
                    author: {
                        name: row.authorName,
                        nickName: row.nickName,
                    },
                    tags: [],
                    collections: [],
                });
            }
            const post = map.get(row.id);
            //Adding tag to the post , maybe english is well - Ark One
            if (row.tagId && !post.tags.some((t: any) => t.id === row.tagId)) {
                post.tags.push({
                    id: row.tagId,
                    name: row.tagName,
                    slug: row.tagSlug,
                });
            }
            //Adding collections information to the post, maybe english is well - Ark One
            if (
                row.collectionId &&
                !post.collections.some((t: any) => t.id === row.collectionId)
            ) {
                post.collections.push({
                    id: row.collectionId,
                    name: row.collectionName,
                });
            }
        }
        return [...map.values()];
    } catch (err) {
        console.log('Get all posts error: ', err);
        throw err;
    }
}

export async function getAllAdminPosts(
    db: ReturnType<typeof createDb>,
    data: GetAllAdminPostQueryType
) {
    try {
        const posts = await db.query.PostModel.findMany({
            columns: {
                id: true,
                title: true,
                status: true,
                slug: true,
                createdAt: true,
            },
            where: eq(PostModel.status, data.status),
            limit: data.limit || 10,
            offset: data.offset || 0,
        });
        return posts;
    } catch (err) {
        console.log('Get all admin posts error: ', err);
        throw err;
    }
}

export async function getDetailPost(
    db: ReturnType<typeof createDb>,
    slugOrId: string
) {
    try {
        const condition = isNaN(Number(slugOrId))
            ? () => eq(PostModel.slug, slugOrId)
            : () => eq(PostModel.id, Number(slugOrId));
        const post = await db.query.PostModel.findFirst({
            columns: {
                id: true,
                title: true,
                content: true,
                slug: true,
                status: true,
            },
            with: {
                author: {
                    columns: { name: true },
                },
                postTags: {
                    with: {
                        tag: {
                            columns: { id: true, name: true },
                        },
                    },
                },
                postCollections: {
                    with: {
                        collection: {
                            columns: { id: true, name: true },
                        },
                    },
                },
            },
            where: condition(),
        });
        if (!post)
            throw new HTTPException(404, {
                message: 'Post not found',
            });
        const { postTags, postCollections, ...postData } = post;
        const result = {
            ...postData,
            collections: postCollections.map((v) => ({
                id: v.collection?.id,
                name: v.collection?.name,
            })),
            tags: postTags.map((v) => ({ id: v.tag?.id, name: v.tag?.name })),
        };
        return result;
    } catch (err) {
        console.log('Get detail post error: ', err);
        throw err;
    }
}

export async function createPost(
    db: ReturnType<typeof createDb>,
    userId: number,
    data: CreatePostDtoType
) {
    try {
        const post = await db
            .insert(PostModel)
            .values({
                title: data.title,
                content: data.content,
                banner: data.banner, //Fallback ve du lieu binh thuong
                slug: data.slug,
                status: PostStatus.DRAFT,
                authorId: userId,
            })
            .returning({
                id: PostModel.id,
                title: PostModel.title,
                slug: PostModel.slug,
                banner: PostModel.banner,
            });

        // Adding tags to the post
        const tags =
            data.tagIds?.map((tag) => ({
                tagId: tag,
                postId: post[0]!.id,
            })) || [];
        const collections =
            data.collectionIds?.map((collection) => ({
                collectionId: collection,
                postId: post[0]!.id,
            })) || [];
        //Creating the post
        if (tags.length > 0) await db.insert(PostTagModel).values(tags);
        if (collections.length > 0)
            await db.insert(PostCollectionModel).values(collections);
        return {
            ...post[0]!,
        };
    } catch (err) {
        console.log('create post error: ', err);
        throw err;
    }
}

export async function createUploadSignature(
    folder: string,
    apiSecret: string,
    apiKey: string,
    cloudName: string
) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        {
            folder,
            timestamp,
        },
        apiSecret
    );
    return {
        signature,
        timestamp,
        folder,
        //Nho dat apiKey a cloudName o ben FE (.env)
    };
}

export async function saveTag(
    db: ReturnType<typeof createDb>,
    userId: number,
    userRoles: Role[],
    postId: number,
    tagIds: number[]
) {
    const post = await db.query.PostModel.findFirst({
        where: eq(PostModel.id, postId),
        columns: {
            id: true,
            authorId: true,
        },
    });

    if (!post) {
        throw new HTTPException(404, { message: 'Post not found' });
    }

    const isAuthor = post.authorId === userId;
    const isAdmin = userRoles.includes(Role.ADMIN);
    if (!isAuthor && !isAdmin) {
        throw new HTTPException(403, {
            message: 'You do not have permission to modify this post',
        });
    }

    const mp = new Map<number, number>();

    for (const id of tagIds) {
        mp.set(id, post.id);
    }

    const postTags = await db.query.PostTagModel.findMany({
        where: eq(PostTagModel.postId, post.id),
        columns: {
            id: true,
            tagId: true,
        },
    });

    for (const postTag of postTags)
        if (postTag.tagId) {
            if (!mp.has(postTag.tagId)) {
                await db
                    .delete(PostTagModel)
                    .where(eq(PostTagModel.id, postTag.id));
            } else {
                mp.set(postTag.tagId, -1);
            }
        }

    const tagData: {
        postId: number;
        tagId: number;
    }[] = [];

    for (const [tagId, value] of mp) {
        if (value !== -1) {
            tagData.push({
                postId: value,
                tagId,
            });
        }
    }

    if (tagData.length > 0) {
        await db.insert(PostTagModel).values(tagData);
    }

    return getDetailPost(db, String(postId));
}

export async function saveCollection(
    db: ReturnType<typeof createDb>,
    userId: number,
    userRoles: Role[],
    postId: number,
    collectionIds: number[]
) {
    const post = await db.query.PostModel.findFirst({
        where: eq(PostModel.id, postId),
        columns: {
            id: true,
            authorId: true,
        },
    });
    if (!post) {
        throw new HTTPException(404, { message: 'Post not found' });
    }

    const isAuthor = post.authorId === userId;
    const isAdmin = userRoles.includes(Role.ADMIN);
    if (!isAuthor && !isAdmin) {
        throw new HTTPException(403, {
            message: 'You do not have permission to modify this post',
        });
    }

    const mp = new Map<number, number>();
    for (const id of collectionIds) mp.set(id, post.id);
    const collectionPosts = await db.query.PostCollectionModel.findMany({
        where: eq(PostCollectionModel.postId, post.id),
        columns: {
            id: true,
            collectionId: true,
        },
    });

    for (const collectionPost of collectionPosts)
        if (collectionPost.collectionId) {
            if (!mp.has(collectionPost.collectionId))
                // Thuc hien xoa no khoi database
                await db
                    .delete(PostCollectionModel)
                    .where(eq(PostCollectionModel.id, collectionPost.id));
            else mp.set(collectionPost.collectionId, -1);
        }

    const collectionData = [];
    for (const [collectionId, value] of mp) {
        if (value != -1)
            collectionData.push({
                postId: value,
                collectionId,
            });
    }

    if (collectionData.length > 0) {
        await db.insert(PostCollectionModel).values(collectionData);
    }
    return getDetailPost(db, String(postId));
}

export async function editPost(
    db: ReturnType<typeof createDb>,
    userId: number,
    postId: number,
    data: UpdatePostDtoType
) {
    try {
        const post = await db.query.PostModel.findFirst({
            where: eq(PostModel.id, postId),
        });
        if (!post)
            throw new HTTPException(404, {
                message: 'Post not found',
            });
        if (post.authorId != userId)
            throw new HTTPException(403, {
                message: 'You do not belong to this resource',
            });
        const { tagIds, collectionIds, ...postDaya } = data;
        const result = await db
            .update(PostModel)
            .set({
                ...postDaya,
            })
            .where(eq(PostModel.id, postId))
            .returning({
                id: PostModel.id,
                title: PostModel.title,
            });

        if (tagIds && tagIds.length > 0) {
            await saveTag(db, userId, [Role.USER], postId, tagIds);
        }
        if (collectionIds && collectionIds.length > 0) {
            await saveCollection(
                db,
                userId,
                [Role.USER],
                post.id,
                collectionIds
            );
        }
        return result[0];
    } catch (err) {
        console.log('Edit post error: ', err);
        throw err;
    }
}

export async function getUserPosts(
    db: ReturnType<typeof createDb>,
    userId: number,
    query: GetUserPostsQueryType
) {
    try {
        const conditions: SQL[] = [eq(PostModel.authorId, userId)];
        if (query.status) {
            conditions.push(eq(PostModel.status, query.status));
        }

        const posts = await db.query.PostModel.findMany({
            where: and(...conditions),
            limit: query.limit || 10,
            offset: query.offset || 0,
            orderBy: desc(PostModel.createdAt),
            with: {
                postTags: {
                    with: {
                        tag: {
                            columns: { id: true, name: true, slug: true },
                        },
                    },
                },
                postCollections: {
                    with: {
                        collection: {
                            columns: { id: true, name: true },
                        },
                    },
                },
            },
        });

        return posts.map((post) => {
            const { postTags, postCollections, ...postData } = post;
            return {
                ...postData,
                tags: postTags.map((v) => ({
                    id: v.tag?.id,
                    name: v.tag?.name,
                    slug: v.tag?.slug,
                })),
                collections: postCollections.map((v) => ({
                    id: v.collection?.id,
                    name: v.collection?.name,
                })),
            };
        });
    } catch (err) {
        console.log('Get user posts error: ', err);
        throw err;
    }
}

export async function deletePost(
    db: ReturnType<typeof createDb>,
    userId: number,
    userRoles: Role[],
    postId: number
) {
    try {
        const post = await db.query.PostModel.findFirst({
            where: eq(PostModel.id, postId),
        });

        if (!post) {
            throw new HTTPException(404, {
                message: 'Post not found',
            });
        }

        const isAuthor = post.authorId === userId;
        const isAdmin = userRoles.includes(Role.ADMIN);

        if (!isAuthor && !isAdmin) {
            throw new HTTPException(403, {
                message: 'You are not authorized to delete this post',
            });
        }

        await db.transaction(async (tx) => {
            await tx
                .delete(PostTagModel)
                .where(eq(PostTagModel.postId, postId));
            await tx
                .delete(PostCollectionModel)
                .where(eq(PostCollectionModel.postId, postId));
            await tx.delete(PostModel).where(eq(PostModel.id, postId));
        });

        return { id: post.id, title: post.title, deleted: true };
    } catch (err) {
        console.log('Delete post error: ', err);
        throw err;
    }
}

export async function updatePostStatus(
    db: ReturnType<typeof createDb>,
    postId: number,
    status: PostStatus
) {
    try {
        const post = await db.query.PostModel.findFirst({
            where: eq(PostModel.id, postId),
        });

        if (!post) {
            throw new HTTPException(404, {
                message: 'Post not found',
            });
        }

        const updateFields: any = { status };
        if (status === PostStatus.PUBLISHED) {
            updateFields.publishedAt = new Date();
        }

        const updated = await db
            .update(PostModel)
            .set(updateFields)
            .where(eq(PostModel.id, postId))
            .returning({
                id: PostModel.id,
                title: PostModel.title,
                status: PostModel.status,
                publishedAt: PostModel.publishedAt,
                updatedAt: PostModel.updatedAt,
            });
        return updated[0];
    } catch (err) {
        console.log('Update post status error: ', err);
        throw err;
    }
}
