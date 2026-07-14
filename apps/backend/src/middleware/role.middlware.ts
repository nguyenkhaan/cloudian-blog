import { Role } from '@/model/base';
import { AppEnv } from '@/types/env';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const requireRole = (roles: Role[]) => {
    const roleMiddleware = createMiddleware<AppEnv>(async (c, next) => {
        const user = c.get('user');
        const userRoles = user.roles ?? [];
        const hasRole = roles.some((role) => userRoles.includes(role));
        if (!hasRole)
            throw new HTTPException(403, {
                message: "User don't allow to access this resource",
            });
        await next();
    });
    return roleMiddleware;
};
