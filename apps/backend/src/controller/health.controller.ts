import { Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { OpenAPIHono } from '@hono/zod-openapi';
import { describeRoute } from 'hono-openapi';
const route = new OpenAPIHono();

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

export default route;
