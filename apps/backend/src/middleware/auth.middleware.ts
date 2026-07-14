import { verifyToken } from '@/service/jwt.service';
import { AppEnv } from '@/types/env';
import { AccessJwtPayload } from '@/types/jwt';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

// Middle ware duoc su dung de xac minh nguoi dung da thuc su dang nhap chua
export const AuthMiddleware = createMiddleware<AppEnv>(async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader)
        throw new HTTPException(401, {
            message: 'Missing authentication header',
        });
    if (!authHeader.startsWith('Bearer '))
        throw new HTTPException(401, {
            message: 'Invalid authorization header',
        });
    const token = authHeader.substring(7);
    const secret = c.env.JWT_ACCESS_SECRET;
    const payload = await verifyToken(token, secret);

    c.set('user', { ...payload, sub: Number(payload.sub) } as AccessJwtPayload);
    await next();
});
