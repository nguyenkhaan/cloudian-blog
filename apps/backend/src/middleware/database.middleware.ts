import { createDb } from '@/db';
import { AppEnv } from '@/types/env';
import { Context } from 'hono';
import {createMiddleware} from 'hono/factory'

export const databaseMiddleware = createMiddleware<AppEnv>(
    async (c : Context , next) => {
        const db = createDb(c.env.blogging_database) 
        c.set('db' , db) 
        next() 
    }
)