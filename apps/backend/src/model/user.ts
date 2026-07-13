import {sqliteTable , integer, text, index} from 'drizzle-orm/sqlite-core'

export const UserModel = sqliteTable("user" , {
    id: integer('id').primaryKey({autoIncrement : true}), 
    email: text('email').notNull().unique(), 
    name: text('name').notNull(), 
    nickName: text('nickName'), 
    password: text('password').notNull(), 
    active: integer('active').default(0), 
    approve: integer('approve').default(0)
}, (table) => {
    return {
        nameIndex: index('name_idx').on(table.name)
    }
    
}) 
