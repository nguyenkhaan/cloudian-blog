import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const ChatSessionModel = sqliteTable("chat_session" , {
    id : integer("id").primaryKey({ autoIncrement : true }), 
    code : text("code").notNull().unique(), 
    messageCount : integer("message_count").default(0) 
})