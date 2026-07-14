import { AppEnv } from '@/types/env';
import {Hono} from 'hono'
import { describeRoute } from 'hono-openapi';

const route = new Hono<AppEnv>() 
const tags = ["Auth"]

route.post("/login" , describeRoute({
    summary: 'Login', 
    tags, 
    description: "Login account" 
}) , async (c) => {
    const db = await c.get('db') 
    const accessSecret = c.env.JWT_ACCESS_SECRET 
    const refreshSecret = c.env.JWT_REFRESH_SECRET 
    
})