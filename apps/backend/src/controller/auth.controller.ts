import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';
import { changePassword, forgotPassword, login, register, verify } from '@/service/auth.service'
import { ChangePasswordDto, ChangePasswordQuery, ForgotPasswordQuery, LoginDto, RegisterDto, VerifyQuery } from '@/schema/auth.schema'

const route = new Hono<AppEnv>();
const tags = ['Auth'];

route.post(
    '/login',
    describeRoute({
        summary: 'Login',
        tags,
        description: 'Login account'
    }),
    validator('json' , LoginDto), 
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
    description: 'Register a new user' 
}) , 
    validator('json' , RegisterDto), 
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
}) , validator('query'   , VerifyQuery) , 
    async (c) => {
        const db = await c.get('db') 
        const verifySecret = c.env.JWT_VERIFY_REGISTER 
        const data = await c.req.valid('query') 
        const response = await verify(db , data.code , verifySecret) 
        return c.text(response)
    }
)

route.get('/forgot-password' , describeRoute({
    summary: 'Forgot password', 
    tags, 
    description: 'Get a rescue password token'
}) , 
    validator('query' , ForgotPasswordQuery), 
    async (c) => {
        const {email} = await c.req.valid('query') 
        const db = await c.get('db')
        const secretKey = c.env.JWT_VERIFY_RESET_PASSWORD
        const response = await forgotPassword(db , email , secretKey) 
        return c.json(response) 
})
route.post('/change-password' , describeRoute({
    summary: 'Chang password', 
    tags
}) ,
    validator('query' , ChangePasswordQuery),
    validator('json' , ChangePasswordDto), 
    async (c) => {
        const db = await c.get('db') 
        const { token } = await  c.req.valid('query') 
        const data = await c.req.valid('json') 
        const secretKey = c.env.JWT_VERIFY_RESET_PASSWORD
        const response = await changePassword(db , token , secretKey , data) 
        return c.text(response) 
    }
)
export default route 