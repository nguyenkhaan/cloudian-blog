import { createDb } from '@/db';
import { PostTagModel, TagModel } from '@/model';
import { CreateTagDtoType } from '@/schema/tag.schema';
import { eq, or } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export async function getAllTags(db: ReturnType<typeof createDb>) {
    try {
        const results = await db.query.TagModel.findMany();
        return results;
    } catch (err) {
        console.error('Get all tags error: ', err);
        throw err;
    }
}

export async function createTag(db: ReturnType<typeof createDb>, data: CreateTagDtoType) {
    try {
        const existing = await db.query.TagModel.findFirst({
            where: or(
                eq(TagModel.name, data.name),
                eq(TagModel.slug, data.slug)
            ),
        });

        if (existing) {
            throw new HTTPException(400, {
                message: 'Tag name or slug already exists',
            });
        }

        const result = await db
            .insert(TagModel)
            .values({
                name: data.name,
                slug: data.slug,
            })
            .returning({ id: TagModel.id });

        const created = result[0];
        if (!created) {
            throw new HTTPException(500, {
                message: 'Failed to create tag',
            });
        }

        return {
            success: true,
            tagId: created.id,
        };
    } catch (err) {
        console.error('Create tag error: ', err);
        throw err;
    }
}

export async function deleteTag(db: ReturnType<typeof createDb>, id: number) {
    try {
        const tag = await db.query.TagModel.findFirst({
            where: eq(TagModel.id, id),
        });

        if (!tag) {
            throw new HTTPException(404, {
                message: 'Tag not found',
            });
        }

        await db.transaction(async (tx) => {
            await tx
                .delete(PostTagModel)
                .where(eq(PostTagModel.tagId, id));

            await tx
                .delete(TagModel)
                .where(eq(TagModel.id, id));
        });

        return {
            success: true,
        };
    } catch (err) {
        console.error('Delete tag error: ', err);
        throw err;
    }
}
