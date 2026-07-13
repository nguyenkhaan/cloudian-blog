import { index, integer, sqliteTable , text } from "drizzle-orm/sqlite-core";
import {PostStatus} from '@/model/base'
import { UserModel } from "./user";
import { sql } from "drizzle-orm";


export const PostModel = sqliteTable("post" , {
    id: integer('id').primaryKey({ autoIncrement : true }), 
    title: text('title').notNull(), 
    content: text('content').default(''), 
    slug: text('slug'), 
    authorId: text('author_id').references(() => UserModel.id), 
    banner: text('banner'), 
    status: text('status').$type<PostStatus>().default(PostStatus.DRAFT), 
    publishedAt: integer('published_at' , {mode: 'timestamp'}), 
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now') * 1000)`), 
    updatedAt: integer('updated_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now') * 1000)`)
        .$onUpdate(() => new Date()),
}, (table) => {
    return {
        postNameIndex: index('post_name_idx').on(table.title), 
        slugIndex: index('post_slug_idx').on(table.slug), 
        statusIndex: index('post_status_idx').on(table.status)
    }
})