import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { Role } from '@/model';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono'

const route = new Hono<AppEnv>() 

route.post('/' , AuthMiddleware, requireRole(Role.USER), )


export default route 