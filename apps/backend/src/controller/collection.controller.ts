import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { Role } from '@/model';
import {
    CreateCollectionDto,
    UpdateCollectionDto,
    CollectionIdParam,
} from '@/schema/collection.schema';
import {
    getAllCollections,
    getCollectionDetails,
    createCollection,
    updateCollection,
    deleteCollection,
} from '@/service/collection.service';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';

const route = new Hono<AppEnv>();
const tags = ['Collection'];

route.get(
    '/',
    describeRoute({
        summary: 'Get all collections',
        description: 'Get all collections with post count',
        tags,
    }),
    async (c) => {
        const db = await c.get('db');
        const response = await getAllCollections(db);
        return c.json(response);
    }
);

route.get(
    '/:id',
    describeRoute({
        summary: 'Get collection details',
        description: 'Get collection details and its associated posts',
        tags,
    }),
    validator('param', CollectionIdParam),
    async (c) => {
        const db = await c.get('db');
        const { id } = await c.req.valid('param');
        const response = await getCollectionDetails(db, id);
        return c.json(response);
    }
);

route.post(
    '/',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        summary: 'Create collection',
        description: 'Create a new collection',
        tags,
    }),
    validator('json', CreateCollectionDto),
    async (c) => {
        const db = await c.get('db');
        const data = await c.req.valid('json');
        const response = await createCollection(db, data);
        return c.json(response, 201);
    }
);

route.put(
    '/:id',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        summary: 'Update collection',
        description: 'Update collection details by ID',
        tags,
    }),
    validator('param', CollectionIdParam),
    validator('json', UpdateCollectionDto),
    async (c) => {
        const db = await c.get('db');
        const { id } = await c.req.valid('param');
        const data = await c.req.valid('json');
        const response = await updateCollection(db, id, data);
        return c.json(response);
    }
);

route.delete(
    '/:id',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        summary: 'Delete collection',
        description: 'Delete a collection by ID',
        tags,
    }),
    validator('param', CollectionIdParam),
    async (c) => {
        const db = await c.get('db');
        const { id } = await c.req.valid('param');
        const response = await deleteCollection(db, id);
        return c.json(response);
    }
);

export default route;
