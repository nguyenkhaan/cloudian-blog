import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { login, register, verify } from '@/service/auth.service'
import { zValidator } from '@hono/zod-validator'
import { LoginDto, RegisterDto, VerifyQuery } from '@/schema/auth.schema'

const route = new Hono<AppEnv>();
const tags = ['Auth'];

route.post(
    '/login',
    describeRoute({
        summary: 'Login',
        tags,
        description: 'Login account',
    }),
    zValidator('json' , LoginDto), 
    async (c) => {
        const db = await c.get('db');
        const accessSecret = c.env.JWT_ACCESS_SECRET;
        const refreshSecret = c.env.JWT_REFRESH_SECRET; 
        const {email , password }= await c.req.valid('json')
        //Luc nay, thay vi su dung c.req.json()./ Chung ta se su dung: c.req.valid('json'). Luc nay request da duoc validation, va hono se tu dong 
        //ap dung kieu du lieu cua Dto vao cho chung ta de dang xu ly 
        const response = await login(db , email , password , accessSecret , refreshSecret)
        return c.json(response)
    }
);

route.post('/register' , describeRoute({
    summary: "Register", 
    tags, 
    description: 'Register a new user', 
}) , 
    zValidator('json' , RegisterDto), 
    async (c) => {
        const data = await c.req.valid('json')
        const db = await c.get('db') 
        const verifySecret = c.env.JWT_VERIFY_REGISTER 
        const response = await register(db , data , verifySecret) 
        return c.json(response)
})

route.get('/verify' , describeRoute({
    summary: "Verify", 
    tags, 
    description: "Verify account", 
    parameters: [
        {
            name: 'code', 
            in: 'query', 
            required: true, 
            schema: {
                type: 'string'
            }, 
            
        }
    ]
}) , zValidator('query'   , VerifyQuery) , 
    async (c) => {
        const db = await c.get('db') 
        const verifySecret = c.env.JWT_VERIFY_REGISTER 
        const data = await c.req.valid('query') 
        const response = await verify(db , data.code , verifySecret) 
        return c.text(response)
    }
)
export default route 