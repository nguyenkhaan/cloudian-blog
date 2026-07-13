//https://freedium-mirror.cfd/https://medium.com/@yannick.burkard/building-production-ready-hono-apis-a-modern-architecture-guide-fed8a415ca96
//https://hono.dev/docs/api/request - Su dung OpenAPI Hono de sinh API document nhe may con vo. Lam nhu the thi no moi nhanh duoc
import { Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import HealthRoute from '@/controller/health.controller';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';

const app = new Hono();
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

//Adding route
const apiRoute = new Hono();
apiRoute.route('/health', HealthRoute);

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
    Scalar((c) => {
        return {
            url: '/openapi', //Day chinh la duong link cua cai JSON tren nhe
            proxyUrl: 'https://proxy.scalar.com',
            theme: 'purple',
        };
    })
);

app.route('/api', apiRoute);
export default app;
