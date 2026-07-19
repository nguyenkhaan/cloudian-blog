import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';
import { changeEmail, changePassword, forgotPassword, login, refresh, register, verify, verifyChangeEmail } from '@/service/auth.service'
import { ChangeEmailDto, ChangePasswordDto, ChangePasswordQuery, ForgotPasswordQuery, LoginDto, RefreshDto, RegisterDto, VerifyChangeEmailDto, VerifyQuery } from '@/schema/auth.schema'
import { AuthMiddleware } from '@/middleware/auth.middleware';

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

route.post('/change-email' , describeRoute({
    summary: 'Change email', 
    tags, 
    description: "Change account's email"
}) , 
    AuthMiddleware, 
    validator('json' , ChangeEmailDto), 
    async (c) => {
        const db = await c.get('db')
        const user = await c.get('user') 
        const data = await c.req.valid('json')
        const secretKey = c.env.JWT_VERIFY_RESET_EMAIL
        const response = await changeEmail(db , Number(user.sub) , data , secretKey)
        return c.json(response)
    }
)

route.get('/verify-change-email' , describeRoute({
    summary: "Verify change email", 
    tags, 
    description: "Verify account's new email"
}) , 
    validator('query' , VerifyChangeEmailDto), 
    async (c) => {
        const db = await c.get('db')
        const { token } = await c.req.valid('query')
        const secretKey = c.env.JWT_VERIFY_RESET_EMAIL
        const response = await verifyChangeEmail(db , token , secretKey)
        return c.text(response) 
    }
)

route.post('/refresh' , describeRoute({
    summary: 'Refresh session', 
    tags, 
    description: 'Get new access token with refresh token'
}) , validator('json' , RefreshDto) , 
    async (c) => {
        const accessKey = c.env.JWT_ACCESS_SECRET 
        const refreshKey = c.env.JWT_REFRESH_SECRET 
        const { token } = await c.req.valid('json')
        const response = await refresh(token , accessKey , refreshKey) 
        return c.json(response) 
    }   
)

export default route 