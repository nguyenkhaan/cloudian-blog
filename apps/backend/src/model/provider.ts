import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { AuthProvider } from "./base";

export const OAuthModel = sqliteTable("auth_provider" , {
    id: integer('id').primaryKey({ autoIncrement : true }), 
    userId: integer('user_id').notNull(), 
    provider: text('status').$type<AuthProvider>().default(AuthProvider.LOCAL),
})