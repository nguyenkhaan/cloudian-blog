import { createDb } from '@/db';
import { comparePass } from '@/helper/pwd';
import { UserModel } from '@/model/user';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { createToken } from './jwt.service';
import { TokenType } from '@/base/jwt.enum';

//_______________HELPER FUNCTION

export async function login(
    db: ReturnType<typeof createDb>,
    email: string,
    password: string,
    accessSecret: string,
    refreshSecret: string
) {
    try {
        const user = await db.query.UserModel.findFirst({
            where: eq(UserModel.email, email),
            with: {
                roles: true,
            },
        });
        if (!user)
            throw new HTTPException(404, {
                message: 'User has not been registered',
            });
        const result = await comparePass(password, user.password);
        if (!result)
            throw new HTTPException(404, {
                message: 'Wrong password',
            });
        const userRoles = user.roles.map((rrole) => rrole.role);
        const payload = {
            sub: user.id.toString(), 
            roles: userRoles
        } 
        const accessToken = await createToken(TokenType.ACCESS_TOKEN , {
            ...payload, 
            exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_LIVETIME 
        } , accessSecret) 
        const refreshToken = await createToken(TokenType.REFRESH_TOKEN , {
            ...payload, 
            exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_LIVETIME
        } , refreshSecret) 
        return {
            accessToken, refreshToken
        }
    } catch (err) {
        console.log('login error: ', err);
        throw err;
    }
}
