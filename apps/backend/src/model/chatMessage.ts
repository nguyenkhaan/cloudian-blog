import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ChatSessionModel } from "./chatSession";
import { sql } from "drizzle-orm";
import { UserModel } from "./user";

export const ChatMessageModel = sqliteTable("chat_message" , {
    id : text("id").primaryKey(), 
    content : text("content").notNull(), 
    userId : integer("user_id").references(() => UserModel.id),
    sessionId : text("chat_session_id").unique().references(() => ChatSessionModel.id).notNull(), 
    createdAt: integer('created_at' , { mode : 'timestamp' })
            .notNull()
            .default(sql`(strftime('%s', 'now') * 1000)`),
})