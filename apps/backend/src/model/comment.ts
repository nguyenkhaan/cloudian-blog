import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { CommentStatus } from "./base";
import { UserModel } from "./user";
import { PostModel } from "./post";

export const CommentModel = sqliteTable("comment" , {
    id : integer('id').primaryKey({ autoIncrement : true }), 
    content : text('content').notNull(), 
    createdAt : integer('created_at' , {mode: 'timestamp'})
            .notNull()
            .default(sql`(strftime('%s', 'now') * 1000)`), 
    status : text('status').$type<CommentStatus>().default(CommentStatus.ACTIVE), 
    userId : integer('user_id').notNull().references(() => UserModel.id), 
    postId : integer('post_id').notNull().references(() => PostModel.id), 
    updatedAt: integer('updated_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now') * 1000)`)
        .$onUpdate(() => new Date()),
})