import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core'
import { UserModel } from './user';
import {Role} from '@/model/base'

export const UserRoleModel = sqliteTable("user_role" , {
    id: integer("id").primaryKey({autoIncrement : true}), 
    userId: integer("user_id").references(() => UserModel.id), 
    role: text("role").$type<Role>().notNull().default(Role.USER)
})
