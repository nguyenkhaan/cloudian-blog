import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ReportEntity, ReportStatus } from "./base";
import { UserModel } from "./user";

export const ReportModel = sqliteTable("report" , {
    id : integer('id').primaryKey({ autoIncrement : true }), 
    title : text('title').notNull(), 
    content : text('content').notNull(), 
    userId : integer('user_id').notNull().references(() => UserModel.id), 
    createdAt : integer('created_at' , {mode: 'timestamp'})
            .notNull()
            .default(sql`(strftime('%s', 'now') * 1000)`), 
    status : text('status').$type<ReportStatus>().default(ReportStatus.PENDING),
    entity:  text('entity').$type<ReportEntity>().notNull(), 
    solved_at : integer('solved_at' , {mode : 'timestamp'})
} , (table) => {
    return {
        titleIndex : index('title_index').on(table.title)
    }
})