// Dung de tracking xem co bao nhieu tai lieu duoc download 

import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { PostModel } from "./post";
import { UserModel } from "./user";
import { sql } from "drizzle-orm";


export const DownloadPostModel = sqliteTable('download_post' , {
    id: integer('id').primaryKey({ autoIncrement : true }), 
    postId: integer('post_id').references(() => PostModel.id , {
        onDelete: 'cascade', 
        onUpdate: 'cascade'
    }).notNull(), 
    userId : integer('user_id').references(() => UserModel.id , {
        onDelete: 'cascade', 
        onUpdate: 'cascade'
    }).notNull(), 
    createdAt: integer('created_at', { mode: 'timestamp' })
            .notNull()
            .default(sql`(strftime('%s', 'now') * 1000)`),
})