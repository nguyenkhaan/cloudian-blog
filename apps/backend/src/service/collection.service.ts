import { createDb } from '@/db';
import {
    CollectionModel,
    PostCollectionModel,
    PostModel,
    PostStatus,
} from '@/model';
import {
    CreateCollectionDtoType,
    UpdateCollectionDtoType,
} from '@/schema/collection.schema';
import { and, eq, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export async function getAllCollections(db: ReturnType<typeof createDb>) {
    try {
        const results = await db
            .select({
                id: CollectionModel.id,
                name: CollectionModel.name,
                description: CollectionModel.description,
                thumbnail: CollectionModel.thumbnail,
                postCount: sql<number>`count(${PostModel.id})`.mapWith(Number),
            })
            .from(CollectionModel)
            .leftJoin(
                PostCollectionModel,
                eq(CollectionModel.id, PostCollectionModel.collectionId)
            )
            .leftJoin(
                PostModel,
                and(
                    eq(PostCollectionModel.postId, PostModel.id),
                    eq(PostModel.status, PostStatus.PUBLISHED)
                )
            )
            .groupBy(CollectionModel.id);

        return results;
    } catch (err) {
        console.error('Get all collections error: ', err);
        throw err;
    }
}

export async function getCollectionDetails(
    db: ReturnType<typeof createDb>,
    id: number
) {
    try {
        const collection = await db.query.CollectionModel.findFirst({
            where: eq(CollectionModel.id, id),
        });

        if (!collection) {
            throw new HTTPException(404, {
                message: 'Collection not found',
            });
        }

        const posts = await db
            .select({
                id: PostModel.id,
                title: PostModel.title,
                slug: PostModel.slug,
            })
            .from(PostModel)
            .innerJoin(
                PostCollectionModel,
                eq(PostModel.id, PostCollectionModel.postId)
            )
            .where(
                and(
                    eq(PostCollectionModel.collectionId, id),
                    eq(PostModel.status, PostStatus.PUBLISHED)
                )
            );

        return {
            ...collection,
            posts,
        };
    } catch (err) {
        console.error('Get collection details error: ', err);
        throw err;
    }
}

export async function createCollection(
    db: ReturnType<typeof createDb>,
    data: CreateCollectionDtoType
) {
    try {
        const result = await db
            .insert(CollectionModel)
            .values({
                name: data.name,
                description: data.description,
                thumbnail: data.thumbnail || null,
            })
            .returning({ id: CollectionModel.id });

        const created = result[0];
        if (!created) {
            throw new HTTPException(500, {
                message: 'Failed to create collection',
            });
        }
        console.log("Hello collection") 
        return {
            success: true,
            collectionId: created.id,
        };
    } catch (err) {
        console.error('Create collection error: ', err);
        throw err;
    }
}

export async function updateCollection(
    db: ReturnType<typeof createDb>,
    id: number,
    data: UpdateCollectionDtoType
) {
    try {
        const collection = await db.query.CollectionModel.findFirst({
            where: eq(CollectionModel.id, id),
        });

        if (!collection) {
            throw new HTTPException(404, {
                message: 'Collection not found',
            });
        }

        await db
            .update(CollectionModel)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(CollectionModel.id, id));

        return {
            success: true,
        };
    } catch (err) {
        console.error('Update collection error: ', err);
        throw err;
    }
}

export async function deleteCollection(
    db: ReturnType<typeof createDb>,
    id: number
) {
    try {
        const collection = await db.query.CollectionModel.findFirst({
            where: eq(CollectionModel.id, id),
        });

        if (!collection) {
            throw new HTTPException(404, {
                message: 'Collection not found',
            });
        }

        await db.transaction(async (tx) => {
            await tx
                .delete(PostCollectionModel)
                .where(eq(PostCollectionModel.collectionId, id));

            await tx.delete(CollectionModel).where(eq(CollectionModel.id, id));
        });

        return {
            success: true,
        };
    } catch (err) {
        console.error('Delete collection error: ', err);
        throw err;
    }
}
