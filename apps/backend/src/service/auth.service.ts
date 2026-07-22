import { createDb } from '@/db';
import { comparePass, hashPass } from '@/helper/pwd';
import { UserModel } from '@/model/user';
import { and, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { createToken, verifyToken } from './jwt.service';
import { TokenType } from '@/base/jwt.enum';
import {
    ChangePasswordType,
    RegisterDtoType,
    ChangeEmailType,
} from '@/schema/auth.schema';
import {
    ACCESS_TOKEN_LIVETIME,
    REFRESH_TOKEN_LIVETIME,
    VERIFY_REGISTER,
    VERIFY_RESET_PASSWORD,
    VERIFY_RESET_EMAIL,
} from '@/base/jwt.constant';

import { AuthProvider, OAuthModel, Role, UserRoleModel } from '@/model';
import { TemplateService } from './template.service';
import { MailService } from './mail.service';
import { AppEnv } from '@/types/env';

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
        if (!user || !user.approve)
            throw new HTTPException(404, {
                message: 'User has not been registered',
            });

        const result = await comparePass(password, user.password);
        if (!result)
            throw new HTTPException(404, {
                message: 'Wrong password',
            });
        const userRoles = user.roles.map((rrole) => rrole.role);

        //Store information toe the oatuh provider 
        const oauth = await db.query.OAuthModel.findFirst({
            where: and(eq(OAuthModel.userId , user.id) ,  eq(OAuthModel.provider , AuthProvider.LOCAL) ), 
            columns: {id : true }
        })
        if (!oauth) {
            await db.insert(OAuthModel).values({
                userId: user.id, 
                provider: AuthProvider.LOCAL
            })
        }

        const payload = {
            sub: user.id.toString(),
            roles: userRoles,
        };
        const accessToken = await createToken(
            TokenType.ACCESS_TOKEN,
            {
                ...payload,
                exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_LIVETIME,
            },
            accessSecret
        );
        const refreshToken = await createToken(
            TokenType.REFRESH_TOKEN,
            {
                ...payload,
                exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_LIVETIME,
            },
            refreshSecret
        );
        return {
            accessToken,
            refreshToken,
            provider: AuthProvider.LOCAL
        };
    } catch (err) {
        console.log('login error: ', err);
        throw err;
    }
}

export async function register(
    db: ReturnType<typeof createDb>,
    data: RegisterDtoType,
    verifySecret: string, 
    FE : string,
    mailService: MailService
) {
    try {
        
        const validMinutes = VERIFY_REGISTER / 60

        const user = await db.query.UserModel.findFirst({
            where: and(
                eq(UserModel.email, data.email)
                // eq(UserModel.active , 1),
            ),
            columns: {
                id: true,
                active: true,
                name : true, 
                approve: true,
                email: true,
            },
        });


        if (user) {
            if (user.active)
                throw new HTTPException(400, {
                    message: 'User has been registered',
                });
            else {
                const payload = {
                    sub: user.id.toString(),
                    email: user.email,
                    exp: Math.floor(Date.now() / 1000) + VERIFY_REGISTER,
                };
                const verifyToken = await createToken(
                    TokenType.VERIFY_REGISTER,
                    payload,
                    verifySecret
                );
                
                const verificationUrl = `${FE}/verify?token=${verifyToken}`   //Gui ve va ben fe se tien hanh tach token ra, sau do quang token nay ve cho backend 
                const name = user.name  

                const html = TemplateService.verifyRegister({ name , verificationUrl , validMinutes})
                await mailService.sendMail(user.email, 'Verify Your Account - Cloudian Blog', html);

                return {
                    user,
                    verifyToken,
                };
            }
        }
        const hashPwd = await hashPass(data.password);
        const newUser = await db
            .insert(UserModel)
            .values({
                email: data.email,
                password: hashPwd,
                name: data.name,
                nickName: data.nickName,
                active: 0,
                approve: 0, //admin thi moi co the tien hanh chuyen doi approve tu 0 sang 1 nhe
            })
            .returning({
                name: UserModel.name,
                nickName: UserModel.nickName,
                email: UserModel.email,
                id: UserModel.id,
            });
        //Sau khiv eirfy tai khoanw thanh cong thi se approve role to the user
        const payload = {
            sub: newUser[0]!.id.toString(),
            email: newUser[0]!.email,
            exp: Math.floor(Date.now() / 1000) + VERIFY_REGISTER,
        };
        const verifyToken = await createToken(
            TokenType.VERIFY_REGISTER,
            payload,
            verifySecret
        );
        
        
        const verificationUrl = `${FE}/verify?token=${verifyToken}`   //Gui ve va ben fe se tien hanh tach token ra, sau do quang token nay ve cho backend 
        const name = newUser[0]?.name || '' 
        const html = TemplateService.verifyRegister({ name , verificationUrl , validMinutes})
        await mailService.sendMail(newUser[0]!.email, 'Verify Your Account - Cloudian Blog', html);

        return {
            user: newUser[0]!,
            verifyToken,
        };
    } catch (err) {
        console.log('register error', err);
        throw err;
    }
}

export async function verify(
    db: ReturnType<typeof createDb>,
    token: string,
    verifySecret: string
) {
    try {
        const payload = await verifyToken(token, verifySecret);
        const id = Number(payload.sub);
        const email = payload.email as string;
        if (!id || !email)
            throw new HTTPException(400, {
                message: 'Missing credential information',
            });
        const user = await db.query.UserModel.findFirst({
            where: and(eq(UserModel.id, id), eq(UserModel.email, email)),
        });
        if (!user)
            throw new HTTPException(404, {
                message: 'User not found',
            });
        //Neu nguoiu dung da hop le thi tien hanh assign roles cung nhu
        await db
            .update(UserModel)
            .set({
                active: 1,
            })
            .where(eq(UserModel.id, id));
        //Assign roles
        await db.insert(UserRoleModel).values({
            role: Role.MANAGER,   //Nguoi dung user thi moi co the tien hanh dang ky 
            userId: user.id,
        });
        return 'User account has been active';
    } catch (err) {
        console.log('Verify account error', err);
        throw err;
    }
}

export async function forgotPassword(
    db: ReturnType<typeof createDb>,
    email: string,
    secretKey: string,
    FE: string,
    mailService: MailService
) {
    try {
        const user = await db
            .select()
            .from(UserModel)
            .where(eq(UserModel.email, email));
        if (!user || user.length == 0)
            throw new HTTPException(404, {
                message: 'User not found',
            });
        const payload = {
            sub: user[0]!.id.toString(),
            email: user[0]!.email,
            exp: Math.floor(Date.now() / 1000) + VERIFY_RESET_PASSWORD,
        };
        const token = await createToken(
            TokenType.VERIFY_RESET_PASSWORD,
            payload,
            secretKey
        );

        const resetUrl = `${FE}/reset-password?token=${token}`;
        const validMinutes = Math.floor(VERIFY_RESET_PASSWORD / 60);
        const html = TemplateService.resetPassword({
            name: user[0]!.name,
            resetUrl,
            validMinutes,
        });
        await mailService.sendMail(email, 'Reset Your Password - Cloudian Blog', html);

        return {
            token,
        };
    } catch (err) {
        console.log('Get password key error: ', err);
        throw err;
    }
}

export async function changePassword(
    db: ReturnType<typeof createDb>,
    token: string,
    secretKey: string,
    data: ChangePasswordType
) {
    try {
        const payload = await verifyToken(token, secretKey);
        const id = Number(payload.sub);
        if (!id)
            throw new HTTPException(404, {
                message: 'User not found',
            });
        const passwordHash = await hashPass(data.password);
        const user = await db
            .update(UserModel)
            .set({
                password: passwordHash,
            })
            .where(eq(UserModel.id, id))
            .returning({
                email: UserModel.email,
            });
        return 'Password has been reset';
    } catch (err) {
        console.log('Change password error ', err);
        throw err;
    }
}
export async function changeEmail(
    db: ReturnType<typeof createDb>,
    userId: number,
    data: ChangeEmailType,
    secretKey: string,
    FE: string,
    mailService: MailService
) {
    try {
        const user = await db.query.UserModel.findFirst({
            where: eq(UserModel.id, userId),
        });
        if (!user)
            throw new HTTPException(404, {
                message: 'User not found',
            });
        const isPasswordMatch = await comparePass(data.password, user.password);
        if (!isPasswordMatch)
            throw new HTTPException(400, {
                message: 'Wrong password',
            });
        const payload = {
            sub: user.id.toString(),
            email: data.email,
            exp: Math.floor(Date.now() / 1000) + VERIFY_RESET_EMAIL,
        };
        const token = await createToken(
            TokenType.VERIFY_RESET_EMAIL,
            payload,
            secretKey
        );

        const resetUrl = `${FE}/verify-email-change?token=${token}`;
        const validMinutes = Math.floor(VERIFY_RESET_EMAIL / 60);
        const html = TemplateService.resetEmail({
            name: user.name,
            newEmail: data.email,
            resetUrl,
            validMinutes,
        });
        await mailService.sendMail(data.email, 'Confirm Your Email Address Change - Cloudian Blog', html);

        return {
            token,
        };
    } catch (err) {
        console.log('Change email error: ', err);
        throw err;
    }
}

export async function verifyChangeEmail(
    db: ReturnType<typeof createDb>,
    token: string,
    secretKey: string
) {
    try {
        const payload = await verifyToken(token, secretKey);
        const id = Number(payload.sub);
        const email = payload.email;
        if (!id || !email)
            throw new HTTPException(400, {
                message: 'Invalid token',
            });
        await db
            .update(UserModel)
            .set({
                email: email as string,
            })
            .where(eq(UserModel.id, id));
        return "Account's email has been reset successfully";
    } catch (err) {
        console.log('Verify change email error: ', err);
        throw err;
    }
}

export async function refresh(
    token: string,
    accessSecret: string,
    refreshSecret: string
) {
    try {
        const payload = await verifyToken(token, refreshSecret);
        if (!payload)
            throw new HTTPException(400, {
                message: 'Login session data is invalid',
            });
        const accessToken = await createToken(
            TokenType.ACCESS_TOKEN,
            {
                ...payload,
                exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_LIVETIME,
            },
            accessSecret
        );
        return {
            accessToken,
        };
    } catch (err) {
        console.log('Get access token error: ', err);
        throw err;
    }
}
