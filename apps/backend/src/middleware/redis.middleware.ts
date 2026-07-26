import { AppEnv } from "@/types/env";
import { createMiddleware } from 'hono/factory';
import { Redis } from '@upstash/redis'
export const redisMiddleware = createMiddleware<AppEnv>(async (c , next) => {
    const redis = new Redis({
        url: c.env.UPSTASH_REDIS_REST_URL, 
        token: c.env.UPSTASH_REDIS_REST_TOKEN 
    })
    c.set('redis' , redis) 
    await next() 
})