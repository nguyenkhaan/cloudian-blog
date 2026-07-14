import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const SubscriberModel = sqliteTable('subscriber', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').unique().notNull(),
    name: text('name').notNull(),
    delete_at: integer('delete_at', { mode: 'timestamp' }),
    note: text('note'),
});
