import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { Role } from '@/model';
import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';
import { MailService } from '@/service/mail.service';
import {
    getAdminUsers,
    requestAdminUserEmailChange,
    updateAdminUserStatus,
} from '@/service/user.service';
import { UpdateUserEmailDto, UserIdParam } from '@/schema/user.schema';

const route = new Hono<AppEnv>();
const tags = ['User'];

route.get(
    '/',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        summary: 'Get all users',
        tags,
        description: 'List users for the admin dashboard.',
    }),
    async (c) => {
        const db = await c.get('db');
        const response = await getAdminUsers(db);
        return c.json(response);
    }
);

route.patch(
    '/:userId/status',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        summary: 'Toggle user status',
        tags,
        description: 'Suspend or activate a user from the admin dashboard.',
    }),
    validator('param', UserIdParam),
    async (c) => {
        const db = await c.get('db');
        const { userId } = await c.req.valid('param');
        const response = await updateAdminUserStatus(db, userId);
        return c.json(response);
    }
);

route.post(
    '/:userId/change-email',
    AuthMiddleware,
    requireRole(Role.ADMIN),
    describeRoute({
        summary: 'Request user email change',
        tags,
        description:
            'Send a verification link to the new email so the admin can update a user account safely.',
    }),
    validator('param', UserIdParam),
    validator('json', UpdateUserEmailDto),
    async (c) => {
        const db = await c.get('db');
        const { userId } = await c.req.valid('param');
        const { email } = await c.req.valid('json');
        const mailService = new MailService(c.env);
        const response = await requestAdminUserEmailChange(
            db,
            userId,
            email,
            c.env.JWT_VERIFY_RESET_EMAIL,
            c.env.FE_URL,
            mailService
        );
        return c.json(response);
    }
);

export default route;
