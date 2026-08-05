import { createDb } from '@/db';
import { UserModel } from '@/model';
import { asc, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import {
    mapAdminUserRecord,
    toggleAdminUserStatusValue,
} from '@/helper/admin-users';
import { changeUserEmail } from './auth.service';
import { MailService } from './mail.service';

export async function getAdminUsers(db: ReturnType<typeof createDb>) {
    try {
        const users = await db.query.UserModel.findMany({
            columns: {
                id: true,
                email: true,
                name: true,
                nickName: true,
                active: true,
                approve: true,
            },
            with: {
                roles: {
                    columns: {
                        role: true,
                    },
                },
                oauths: {
                    columns: {
                        provider: true,
                    },
                },
            },
            orderBy: asc(UserModel.id),
        });

        return users.map((user) => mapAdminUserRecord(user as any));
    } catch (err) {
        console.error('Get admin users error: ', err);
        throw err;
    }
}

export async function updateAdminUserStatus(
    db: ReturnType<typeof createDb>,
    userId: number
) {
    try {
        const user = await db.query.UserModel.findFirst({
            where: eq(UserModel.id, userId),
            columns: {
                id: true,
                email: true,
                name: true,
                nickName: true,
                active: true,
                approve: true,
            },
            with: {
                roles: {
                    columns: {
                        role: true,
                    },
                },
                oauths: {
                    columns: {
                        provider: true,
                    },
                },
            },
        });

        if (!user) {
            throw new HTTPException(404, {
                message: 'User not found',
            });
        }

        const currentStatus =
            user.active && user.approve ? 'active' : 'suspended';
        const nextStatus = toggleAdminUserStatusValue(currentStatus);

        await db
            .update(UserModel)
            .set(nextStatus)
            .where(eq(UserModel.id, userId));

        return {
            success: true,
            user: mapAdminUserRecord({
                ...user,
                ...nextStatus,
            } as any),
        };
    } catch (err) {
        console.error('Update admin user status error: ', err);
        throw err;
    }
}

export async function requestAdminUserEmailChange(
    db: ReturnType<typeof createDb>,
    userId: number,
    email: string,
    secretKey: string,
    FE: string,
    mailService: MailService
) {
    try {
        return await changeUserEmail(
            db,
            userId,
            { email },
            secretKey,
            FE,
            mailService
        );
    } catch (err) {
        console.error('Request admin user email change error: ', err);
        throw err;
    }
}
