import {createDb} from '@/db/index'

export type AppEnv = {
    Bindings: {
        blogging_database : D1Database
    }, 
    Vairables: {
        db: ReturnType<typeof createDb>
    }
}