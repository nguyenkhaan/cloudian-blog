import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { PostStatus, Role } from '@/model';
import { GetAllAdminPostQuery, GetAllPostsQuery, getDetailPostParam } from '@/schema/post.schema';
import { getAllAdminPosts, getAllPost, getDetailPost } from '@/service/post.service';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono'
import { describeRoute, validator } from 'hono-openapi';

const route = new Hono<AppEnv>() 
const tags = ['Post'] 

route.get('/' , describeRoute({
    summary: 'Get all posts', 
    
    description: 'Get all posts with valid filter', 
    tags 
}) , validator('query' , GetAllPostsQuery), 
    async (c) => {
        const data = await c.req.valid('query')
        const db = await c.get('db')
        const response = await getAllPost(db , data)
        return c.json(response)
    }
) 

route.get('/admin' , AuthMiddleware , requireRole(Role.ADMIN) , describeRoute({
    tags, 
    summary: 'Get all admin posts', 
    description: 'Get all admin posts' 
}) , validator('query' , GetAllAdminPostQuery), 
    async (c) => {
        const db = await c.get('db')
        const data = await c.req.valid('query')
        const response = await getAllAdminPosts(db , data)
        return c.json(response) 
    }
)

route.get('/:slugOrId' , describeRoute({
    tags, 
    summary: "Get detail post", 
    description: "Get a post's detail by slug or id"
}) , validator('param' , getDetailPostParam) , 
    async(c) => {
        const db = await c.get('db') 
        const { slugOrId } = await c.req.valid('param')
        const response = await getDetailPost(db , slugOrId) 
        return c.json(response)
    }
)
export default route 