import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { Role } from '@/model';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';
import { MailService } from '@/service/mail.service';
import {
    CreateSubscriberDto,
    UnsubscribeDto,
    SendSingleEmailDto,
    SendNewsletterDto,
    GetAllSubscribersQuery,
} from '@/schema/subscriber.schema';
import {
    subscribe,
    unsubscribe,
    getAllSubscribers,
    sendSingleEmail,
    sendNewsletter,
} from '@/service/subscriber.service';

const route = new Hono<AppEnv>();
const tags = ['Subscriber'];

route.post(
    '/',
    describeRoute({
        tags,
        summary: 'Subscribe to newsletter',
        description: 'Subscribe email to receive newsletters and updates',
    }),
    validator('json', CreateSubscriberDto),
    async (c) => {
        const db = await c.get('db');
        const data = await c.req.valid('json');
        const mailService = new MailService(c.env);
        const response = await subscribe(db, data, mailService, c.env.FE_URL);
        return c.json(response, 201);
    }
);

route.post(
    '/unsubscribe',
    describeRoute({
        tags,
        summary: 'Unsubscribe from newsletter',
        description: 'Remove email subscription from updates list',
    }),
    validator('json', UnsubscribeDto),
    async (c) => {
        const db = await c.get('db');
        const data = await c.req.valid('json');
        const response = await unsubscribe(db, data.email);
        return c.json(response);
    }
);

route.get(
    '/',
    AuthMiddleware,
    requireRole(Role.ADMIN, Role.MANAGER),
    describeRoute({
        tags,
        summary: 'Get all subscribers',
        description: 'Admin/Manager view to fetch all active subscriber emails',
    }),
    validator('query', GetAllSubscribersQuery),
    async (c) => {
        const db = await c.get('db');
        const query = await c.req.valid('query');
        const response = await getAllSubscribers(db, query);
        return c.json(response);
    }
);

route.post(
    '/send-email',
    AuthMiddleware,
    requireRole(Role.ADMIN, Role.MANAGER),
    describeRoute({
        tags,
        summary: 'Send individual email',
        description: 'Admin/Manager direct email broadcast to one subscriber',
    }),
    validator('json', SendSingleEmailDto),
    async (c) => {
        const mailService = new MailService(c.env);
        const data = await c.req.valid('json');
        const response = await sendSingleEmail(mailService, data);
        return c.json(response);
    }
);

route.post(
    '/newsletter',
    AuthMiddleware,
    requireRole(Role.ADMIN, Role.MANAGER),
    describeRoute({
        tags,
        summary: 'Broadcast newsletter',
        description: 'Broadcast newsletter template with recent posts list to all active subscribers',
    }),
    validator('json', SendNewsletterDto),
    async (c) => {
        const db = await c.get('db');
        const mailService = new MailService(c.env);
        const data = await c.req.valid('json');
        const response = await sendNewsletter(db, mailService, data, c.env.FE_URL);
        return c.json(response);
    }
);

export default route;
