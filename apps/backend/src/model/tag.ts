import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { PostModel } from "./post";


export const TagModel = sqliteTable("tag" , {
    id: integer('id').primaryKey({autoIncrement: true}), 
    name: integer('id').notNull(), 
    slug: integer('slug') 
} , (table) => {
    return {
        slugIndex: index('tag_slug_idx').on(table.slug), 
        nameIndex: index('tag_name_idx').on(table.name) 
    }
})

export const PostTagModel = sqliteTable("post_tag" , {
    id: integer('id').primaryKey({autoIncrement : true}), 
    tagId: integer('tag_id').references(() => TagModel.id), 
    postId: integer('post_id').references(() => PostModel.id)
})