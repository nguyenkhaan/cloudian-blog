//https://freedium-mirror.cfd/https://medium.com/@yannick.burkard/building-production-ready-hono-apis-a-modern-architecture-guide-fed8a415ca96
//https://hono.dev/docs/api/request - Su dung OpenAPI Hono de sinh API document nhe may con vo. Lam nhu the thi no moi nhanh duoc
import { Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';
import { AppEnv } from './types/env';
import { databaseMiddleware } from '@/middleware/database.middleware';

// Importing routes
import HealthRoute from '@/controller/health.controller';
import AuthRoute from '@/controller/auth.controller';
import PostRoute from '@/controller/post.controller';
import CollectionRoute from '@/controller/collection.controller';
import TagRoute from '@/controller/tag.controller';
import CommentRoute from '@/controller/comment.controller';
import ReportRoute from '@/controller/report.controller';
const app = new Hono<AppEnv>();
app.use('*', databaseMiddleware);
app.notFound((c: Context) => {
    return c.text('Cloudian Notification Not Found');
});

// Global exption
app.onError((err, c: Context) => {
    if (err instanceof HTTPException)
        return c.json(
            {
                success: false,
                message: 'Cloudian Notification!!!',
                error: err.message,
            },
            err.status
        );
    console.log(err);
    return c.json(
        {
            success: false,
            message: 'Cloudian Notification!!! Internal Server Error',
        },
        500
    );
});

app.get(
    '/openapi',
    openAPIRouteHandler(app, {
        documentation: {
            info: {
                title: 'Backend API',
                version: '1.0.0',
                description: 'Cloudian API documet',
            },
            servers: [
                { url: 'http://localhost:3000', description: 'Local Server' },
            ],
        },
    })
);

app.get(
    '/scalar',
    Scalar((c: any) => {
        return {
            url: '/openapi', //Day chinh la duong link cua cai JSON tren nhe
            proxyUrl: 'https://proxy.scalar.com',
            theme: 'purple',
        };
    })
);

//Adding route
const apiRoute = new Hono<AppEnv>();
apiRoute.route('/health', HealthRoute);
apiRoute.route('/auth', AuthRoute);
apiRoute.route('/posts', PostRoute);
apiRoute.route('/collections', CollectionRoute);
apiRoute.route('/tags', TagRoute);
apiRoute.route('/comments', CommentRoute);
apiRoute.route('/reports', ReportRoute);
app.route('/api', apiRoute);
export default app;
