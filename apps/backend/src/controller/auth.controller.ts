import { AppEnv } from '@/types/env';
import { Hono } from 'hono';
import { describeRoute, validator } from 'hono-openapi';
import { MailService } from '@/service/mail.service';
import {
    changeUserEmail,
    changePassword,
    forgotPassword,
    login,
    loginGoogle,
    refresh,
    requestEmailChange,
    register,
    verify,
    verifyChangeEmail,
} from '@/service/auth.service';
import {
    ChangeEmailDto,
    ChangeEmailParam,
    ChangePasswordDto,
    ChangePasswordQuery,
    ForgotPasswordQuery,
    LoginDto,
    LoginGoogleDto,
    RefreshDto,
    RegisterDto,
    VerifyChangeEmailDto,
    VerifyQuery,
    RequestEmailChangeDto,
} from '@/schema/auth.schema';
import { AuthMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middlware';
import { Role } from '@/model';

const route = new Hono<AppEnv>();
const tags = ['Auth'];

route.post(
    '/login',
    describeRoute({
        summary: 'Login',
        tags,
        description: 'Login account',
    }),
    validator('json', LoginDto),
    async (c) => {
        const db = await c.get('db');
        const accessSecret = c.env.JWT_ACCESS_SECRET;
        const refreshSecret = c.env.JWT_REFRESH_SECRET;
        const { email, password } = await c.req.valid('json');
        //Luc nay, thay vi su dung c.req.json()./ Chung ta se su dung: c.req.valid('json'). Luc nay request da duoc validation, va hono se tu dong
        //ap dung kieu du lieu cua Dto vao cho chung ta de dang xu ly
        const response = await login(
            db,
            email,
            password,
            accessSecret,
            refreshSecret
        );
        return c.json(response);
    }
);

route.post(
    '/register',
    AuthMiddleware,
    requireRole(Role.ADMIN), //Chi co admin moi duoc quyen truy cap va dang ky tai khoan cho nguoi dung
    describeRoute({
        summary: 'Register',
        tags,
        description: 'Register a new user',
    }),
    validator('json', RegisterDto),
    async (c) => {
        const data = await c.req.valid('json');
        const db = await c.get('db');
        const verifySecret = c.env.JWT_VERIFY_REGISTER;
        const mailService = new MailService(c.env);
        const response = await register(
            db,
            data,
            verifySecret,
            c.env.FE_URL,
            mailService
        );
        return c.json(response);
    }
);

route.get(
    '/verify',
    describeRoute({
        summary: 'Verify',
        tags,
        description: 'Verify account',
    }),
    validator('query', VerifyQuery),
    async (c) => {
        const db = await c.get('db');
        const verifySecret = c.env.JWT_VERIFY_REGISTER;
        const data = await c.req.valid('query');
        const response = await verify(db, data.code, verifySecret);
        return c.text(response);
    }
);

route.get(
    '/forgot-password',
    describeRoute({
        summary: 'Forgot password',
        tags,
        description: 'Get a rescue password token',
    }),
    validator('query', ForgotPasswordQuery),
    async (c) => {
        const { email } = await c.req.valid('query');
        const db = await c.get('db');
        const secretKey = c.env.JWT_VERIFY_RESET_PASSWORD;
        const mailService = new MailService(c.env);
        const response = await forgotPassword(
            db,
            email,
            secretKey,
            c.env.FE_URL,
            mailService
        );
        return c.json(response);
    }
);

route.post(
    '/login-google',
    describeRoute({
        tags,
        summary: 'Login google',
        description: 'Verify Google idToken, register user on-the-fly and return JWT access/refresh tokens.',
    }),
    validator('json', LoginGoogleDto),
    async (c) => {
        const db = await c.get('db');
        const accessSecret = c.env.JWT_ACCESS_SECRET;
        const refreshSecret = c.env.JWT_REFRESH_SECRET;
        const { idToken } = await c.req.valid('json');
        const response = await loginGoogle(
            db,
            idToken,
            accessSecret,
            refreshSecret
        );
        return c.json(response);
    }
);
route.post(
    '/change-password',
    describeRoute({
        summary: 'Chang password',
        tags,
    }),
    validator('query', ChangePasswordQuery),
    validator('json', ChangePasswordDto),
    async (c) => {
        const db = await c.get('db');
        const { token } = await c.req.valid('query');
        const data = await c.req.valid('json');
        const secretKey = c.env.JWT_VERIFY_RESET_PASSWORD;
        const response = await changePassword(db, token, secretKey, data);
        return c.text(response);
    }
);

route.post(
    '/change-email',
    describeRoute({
        summary: 'Request email change',
        tags,
        description: "Request a email change for the currently user.",
    }),
    AuthMiddleware,
    validator('json', RequestEmailChangeDto),
    async (c) => {
        const db = await c.get('db');
        const data = await c.req.valid('json');
        const mailService = new MailService(c.env);
        const response = await requestEmailChange(
            db,
            Number(c.get('user').sub),
            data,
            c.env.JWT_VERIFY_RESET_EMAIL,
            c.env.FE_URL,
            mailService
        );
        return c.json(response);
    }
);

route.post(
    '/change-email/:userId', 
    describeRoute({
        summary: "Change manager email", 
        tags, 
        description: "Route for admin changes manager's email"
    }), 
    AuthMiddleware, 
    requireRole(Role.ADMIN), 
    async (c) => {
        const db = await c.get('db') 
        const userId = ChangeEmailParam.parse({
            userId: c.req.param('userId'),
        });
        const data = ChangeEmailDto.parse(await c.req.json());
        const secretKey = c.env.JWT_VERIFY_RESET_EMAIL 
        const mailService = new MailService(c.env) 
        const response = await changeUserEmail(
            db, 
            Number(userId), 
            data, 
            secretKey, 
            c.env.FE_URL, 
            mailService
        ) 
        return c.json(response)
    }
)
route.get(
    '/verify-email-change',
    describeRoute({
        summary: 'Verify email change',
        tags,
        description: "Verify account's new email from either the old inbox or the fallback inbox.",
    }),
    validator('query', VerifyChangeEmailDto),
    async (c) => {
        const db = await c.get('db');
        const { code } = await c.req.valid('query');
        const secretKey = c.env.JWT_VERIFY_RESET_EMAIL;
        const response = await verifyChangeEmail(db, code, secretKey);
        return c.text(response);
    }
);

route.get(
    '/verify-change-email',
    describeRoute({
        summary: 'Verify change email',
        tags,
        description: "Verify account's new email",
    }),
    validator('query', VerifyChangeEmailDto),
    async (c) => {
        const db = await c.get('db');
        const { code } = await c.req.valid('query');
        const secretKey = c.env.JWT_VERIFY_RESET_EMAIL;
        const response = await verifyChangeEmail(db, code, secretKey);
        return c.text(response);
    }
);

route.post(
    '/refresh',
    describeRoute({
        summary: 'Refresh session',
        tags,
        description: 'Get new access token with refresh token',
    }),
    validator('json', RefreshDto),
    async (c) => {
        const accessKey = c.env.JWT_ACCESS_SECRET;
        const refreshKey = c.env.JWT_REFRESH_SECRET;
        const { token } = await c.req.valid('json');
        const response = await refresh(token, accessKey, refreshKey);
        return c.json(response);
    }
);

export default route;
