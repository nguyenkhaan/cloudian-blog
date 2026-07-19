import { createDb } from '@/db/index';
import { AccessJwtPayload } from './jwt';

export type AppEnv = {
    Bindings: {
        //Binding nay chinh la khai bao cac bien moi truong, hono se dua vao day va tien hanh lay ra gia tri cac bein moi truong tuong ung trong file .env
        blogging_database: D1Database;
        JWT_ACCESS_SECRET: string;
        JWT_REFRESH_SECRET: string;
        JWT_VERIFY_REGISTER: string; 
        FE_URL : string; 
        JWT_VERIFY_RESET_PASSWORD : string; 
    };
    Variables: {
        db: ReturnType<typeof createDb>;
        //Dinh nghia bien user ben trong context, se duoc su dung de tien hanh lay ra thong tin user (c.get('user'))
        user: AccessJwtPayload;
    };
};

/**
 * O trne Binding thi truy cap bang c.env
 * O duoi thi truy cap bang c.get(''), dat vao bang c.set('')
 */
