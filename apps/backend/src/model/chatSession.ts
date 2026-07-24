import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { UserModel } from './user';

export const ChatSessionModel = sqliteTable('chat_session', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull().unique(),
    userId: integer('user_id').references(() => UserModel.id),
    messageCount: integer('message_count').default(0),
});
