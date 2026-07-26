import { AppEnv } from "@/types/env";
import { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { Ratelimit } from "@upstash/ratelimit";
import { HTTPException } from "hono/http-exception";

type RateLimitOptions = {
    key: (c : Context<AppEnv>) => string, 
    limit : number, 
    window: `${number} s` | `${number} m` | `${number} h`; //Moi nguoi duoc gui toi da bao nhieu request 1 phut? 
    //Gui toi da limit trong xong window phut Vi du: limit = 5, window = 1 s => 5 request 1s 
}

export const rateLimitMiddleware = (options : RateLimitOptions) => {
    const rateLimit = createMiddleware<AppEnv>(async (c , next) => {
        const redis = c.get('redis') 
        const rateLimit = new Ratelimit({
            redis, 
            limiter: Ratelimit.slidingWindow(options.limit , options.window)
        })
        const { success } = await rateLimit.limit(
            options.key(c) 
        ) 
        if (!success) 
            throw new HTTPException(429 , {
                message: "Too many requests. Try again later" 
            })
        await next() 
    }) 
    return rateLimit
}
