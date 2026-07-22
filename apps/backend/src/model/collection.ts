import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { PostModel } from './post';

export const CollectionModel = sqliteTable(
    'collection',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        name: text('name').notNull(),
        description: text('description').notNull(),
        thumbnail: text('thumbnail'),
        createdAt: integer('created_at' , { mode : 'timestamp' })
            .notNull()
            .default(sql`(strftime('%s', 'now') * 1000)`),
        updatedAt: integer('updated_at', { mode: 'timestamp' })
            .notNull()
            .default(sql`(strftime('%s', 'now') * 1000)`)
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return {
            nameIndex: index('collection_name_idx').on(table.name),
        };
    }
);

export const PostCollectionModel = sqliteTable('post_collection', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    postId: integer('post_id').references(() => PostModel.id),
    collectionId: integer('collection_id').references(() => CollectionModel.id),
});
