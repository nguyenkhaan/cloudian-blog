import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { Role } from '@/model';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';
import {
    CreateCommentDto,
    UpdateCommentDto,
    CommentIdParam,
    PostIdParam,
    UserIdParam,
    UpdateCommentStatusDto,
    GetAllCommentsQuery,
} from '@/schema/comment.schema';
import {
    createComment,
    getCommentsByPostId,
    getCommentsByUserId,
    updateComment,
    deleteComment,
    getAllComments,
    updateCommentStatus,
} from '@/service/comment.service';

const route = new Hono<AppEnv>();
const tags = ['Comment'];

route.get(
    '/post/:postId',
    describeRoute({
        tags,
        summary: 'Get post comments',
        description: 'Get all active comments for a specific post',
    }),
    validator('param', PostIdParam),
    async (c) => {
        const db = await c.get('db');
        const { postId } = await c.req.valid('param');
        const response = await getCommentsByPostId(db, postId);
        return c.json(response);
    }
);

route.get(
    '/user/:userId',
    AuthMiddleware,
    describeRoute({
        tags,
        summary: 'Get user comments',
        description: 'Get all comments created by a specific user',
    }),
    validator('param', UserIdParam),
    async (c) => {
        const db = await c.get('db');
        const { userId } = await c.req.valid('param');
        const response = await getCommentsByUserId(db, userId);
        return c.json(response);
    }
);

route.post(
    '/post/:postId',
    AuthMiddleware,
    requireRole(Role.USER),
    describeRoute({
        tags,
        summary: 'Create comment',
        description: 'Create a comment on a specific post',
    }),
    validator('param', PostIdParam),
    validator('json', CreateCommentDto),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const { postId } = await c.req.valid('param');
        const data = await c.req.valid('json');
        const response = await createComment(db, userId, postId, data);
        return c.json(response, 201);
    }
);

route.patch(
    '/:commentId',
    AuthMiddleware,
    requireRole(Role.USER),
    describeRoute({
        tags,
        summary: 'Update comment',
        description: 'Update content of an existing comment',
    }),
    validator('param', CommentIdParam),
    validator('json', UpdateCommentDto),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const userRoles = user.roles || [];
        const { commentId } = await c.req.valid('param');
        const data = await c.req.valid('json');
        const response = await updateComment(db, userId, commentId, data, userRoles);
        return c.json(response);
    }
);

route.delete(
    '/:commentId',
    AuthMiddleware,
    requireRole(Role.USER, Role.ADMIN, Role.MANAGER),
    describeRoute({
        tags,
        summary: 'Delete comment',
        description: 'Delete a comment by ID (Owner or Admin/Manager only)',
    }),
    validator('param', CommentIdParam),
    async (c) => {
        const db = await c.get('db');
        const user = c.get('user');
        const userId = Number(user.sub);
        const userRoles = user.roles || [];
        const { commentId } = await c.req.valid('param');
        const response = await deleteComment(db, userId, commentId, userRoles);
        return c.json(response);
    }
);

route.get(
    '/',
    AuthMiddleware,
    requireRole(Role.ADMIN, Role.MANAGER),
    describeRoute({
        tags,
        summary: 'Get all comments',
        description: 'Admin/Manager view to fetch all comments in the system with optional filters',
    }),
    validator('query', GetAllCommentsQuery),
    async (c) => {
        const db = await c.get('db');
        const query = await c.req.valid('query');
        const response = await getAllComments(db, query);
        return c.json(response);
    }
);

route.put(
    '/:commentId/status',
    AuthMiddleware,
    requireRole(Role.ADMIN, Role.MANAGER),
    describeRoute({
        tags,
        summary: 'Update comment status',
        description: 'Admin/Manager capability to mark comments as active or invalid',
    }),
    validator('param', CommentIdParam),
    validator('json', UpdateCommentStatusDto),
    async (c) => {
        const db = await c.get('db');
        const { commentId } = await c.req.valid('param');
        const { status } = await c.req.valid('json');
        const response = await updateCommentStatus(db, commentId, status);
        return c.json(response);
    }
);

export default route;