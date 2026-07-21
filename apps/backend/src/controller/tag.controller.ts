import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { Role } from '@/model';
import { CreateTagDto, TagIdParam } from '@/schema/tag.schema';
import { getAllTags, createTag, deleteTag } from '@/service/tag.service';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';

const route = new Hono<AppEnv>();
const tags = ['Tag'];

route.get(
    '/',
    describeRoute({
        summary: 'Get all tags',
        description: 'Get all tags available in the database',
        tags,
    }),
    async (c) => {
        const db = await c.get('db');
        const response = await getAllTags(db);
        return c.json(response);
    }
);

route.post(
    '/',
    AuthMiddleware,
    requireRole(Role.USER),
    describeRoute({
        summary: 'Create tag',
        description: 'Create a new tag',
        tags,
    }),
    validator('json', CreateTagDto),
    async (c) => {
        const db = await c.get('db');
        const data = await c.req.valid('json');
        const response = await createTag(db, data);
        return c.json(response, 201);
    }
);

route.delete(
    '/:id',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        summary: 'Delete tag',
        description: 'Delete a tag by ID',
        tags,
    }),
    validator('param', TagIdParam),
    async (c) => {
        const db = await c.get('db');
        const { id } = await c.req.valid('param');
        const response = await deleteTag(db, id);
        return c.json(response);
    }
);

export default route;
