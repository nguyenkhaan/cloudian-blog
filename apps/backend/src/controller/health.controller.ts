import { Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { describeRoute } from 'hono-openapi';
import { AppEnv } from '@/types/env';
import { UserModel } from '@/model/user';

const route = new Hono<AppEnv>();

route.get(
    '/liveness',
    describeRoute({
        summary: 'Liveness',
        tags: ['Health'],
        description: 'Checking application health',
    }),
    async (c: Context) => {
        return c.json({
            message: 'Your app is running. Build with Cloudian 💙 Cloud',
        });
    }
);

route.get(
    '/error',
    describeRoute({
        summary: 'Error',
        tags: ['Health'],
        description: 'Testing error',
    }),
    async (c: Context) => {
        throw new HTTPException(401, {
            message: 'This is an testing app errors',
        });
    }
);

route.get(
    '/text',
    describeRoute({
        summary: 'Text',
        tags: ['Health'],
        description: 'Testing text format response',
    }),
    async (c: Context) => {
        return c.text('Your app is running. Build with Cloudian 💙 Cloudg');
    }
);

route.get(
    'test-db',
    describeRoute({
        summary: 'Test database',
        tags: ['Health'],
        description: 'Just testing database D1 config with drizzle and success',
    }),
    async (c) => {
        const db = c.get('db');
        const user = await db.select().from(UserModel);
        console.log('Cac user lay ra duoc la: ', user);
        return c.text('Testing successfully');
    }
);
export default route;
