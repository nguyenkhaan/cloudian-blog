import { TokenType } from '@/base/jwt.enum';
import { sign, verify } from 'hono/jwt';

export const createToken = async (
    type: TokenType,
    payload: any,
    secret: string
) => {
    try {
        const token = await sign(payload, secret, 'HS256');
        return token;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const verifyToken = async (token: string, secret: string) => {
    try {
        const payload = await verify(token, secret, 'HS256');

        return payload;
    } catch (err) {
        console.log('Verify token error');
        throw err;
    }
};
