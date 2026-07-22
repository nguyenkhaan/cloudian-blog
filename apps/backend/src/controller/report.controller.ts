import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { Role } from '@/model';
import { AppEnv } from '@/types/env';
import {Hono} from 'hono'
import { describeRoute } from 'hono-openapi';

const route = new Hono<AppEnv>() 
const tags = ["Report"]

route.get('/' , AuthMiddleware, requireRole(Role.ADMIN) , 
    describeRoute({
        tags, 
        summary: "Get all reports", 
        description: "Get all reports in the system"
    }) , 
    async (c) => {

    }
) 

route.get('/:reportId', AuthMiddleware, requireRole(Role.ADMIN), 
    describeRoute({
        tags, 
        summary: "Get detail report", 
        description: "Get detail information of a report" 
    }), 
    async (c) => {
        
    }
)

route.post('/' , AuthMiddleware , requireRole(Role.USER), 
    describeRoute({
        tags, 
        summary: "Create report"
    }), 
    async (c) => {

    }
) 

route.put('/:reportId', AuthMiddleware , requireRole(Role.USER), 
    describeRoute({
        tags, 
        summary: "Edit report content"
    }), 
    async (c) => {

    }
) 

route.delete('/:reportId' , AuthMiddleware, requireRole(Role.USER), 
    describeRoute({
        tags, 
        summary: "Delete a report"
    }), 
    async (c) => {

    }
)

route.post('/:reportId/status', AuthMiddleware, requireRole(Role.ADMIN), 
    describeRoute({
        tags, 
        summary: "Change status", 
        description: "Change a report's status (made by admin)"
    }), 
    async (c) => {

    }
)

export default route 