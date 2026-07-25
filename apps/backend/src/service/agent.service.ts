import { createDb } from '@/db';
import { PostModel, PostStatus } from '@/model';
import { getDetailPost } from '@/service/post.service';
import { and, eq, like, or } from 'drizzle-orm';

export async function searchPostToolService(
    db: ReturnType<typeof createDb>,
    query: string,
    limit: number = 10,
    offset: number = 0
) {
    const posts = await db
        .select({
            id: PostModel.id,
            title: PostModel.title,
            slug: PostModel.slug,
            status: PostModel.status,
            summary: PostModel.summary,
        })
        .from(PostModel)
        .where(
            and(
                or(
                    like(PostModel.title, `%${query}%`),
                    like(PostModel.content, `%${query}%`),
                    like(PostModel.slug, `%${query}%`)
                ),
                eq(PostModel.status, PostStatus.PUBLISHED)
            )
        )
        .limit(limit)
        .offset(offset);
    return posts;
}

export async function getDetailPostToolService(
    db: ReturnType<typeof createDb>,
    slugOrId: string
) {
    const response = await getDetailPost(db, slugOrId);
    return response;
}

export async function getListPostToolService(
    db: ReturnType<typeof createDb>,
    limit: number,
    offset: number
) {
    const posts = await db.query.PostModel.findMany({
        where: eq(PostModel.status, PostStatus.PUBLISHED),
        limit,
        offset,
        columns: {
            id: true,
            title: true,
            status: true,
            slug: true,
            summary: true,
        },
        with: {
            postCollections: {
                with: {
                    collection: {
                        columns: { name: true, description: true },
                    },
                },
            },
            postTags: {
                with: {
                    tag: {
                        columns: { name: true },
                    },
                },
            },
            author: {
                columns: {
                    name: true,
                    nickName: true,
                },
            },
        },
    });

    const result = posts.map((post) => {
        const { author, postCollections, postTags, ...data } = post;
        return {
            ...data,
            collections: postCollections.map((pc) => pc.collection),
            tags: postTags.map((pt) => pt.tag?.name),
            author,
        };
    });
    return result;
}

export async function getPostMetadataToolService(
    db: ReturnType<typeof createDb>,
    postId: number
) {
    const post = await db.query.PostModel.findFirst({
        where: eq(PostModel.id, postId),
        columns: {
            id: true,
            slug: true,
            title: true,
            summary: true,
        },
        with: {
            postCollections: {
                with: {
                    collection: {
                        columns: { name: true, description: true },
                    },
                },
            },
            postTags: {
                with: {
                    tag: {
                        columns: { name: true },
                    },
                },
            },
        },
    });
    if (!post) return null;
    const { postCollections, postTags, ...data } = post;
    return {
        ...data,
        collections: postCollections.map(
            (collection) => collection.collection?.name
        ),
        tags: postTags.map((tag) => tag.tag?.name),
    };
}
