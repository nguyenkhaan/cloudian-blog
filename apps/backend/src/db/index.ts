import { drizzle } from 'drizzle-orm/d1';

//De dung dung cu phap db.query.UserModel.findFirst() thi phai thuc hien viec nay
import * as schema from '@/model';

export const createDb = (db: D1Database) => {
    return drizzle(db, { schema });
};
