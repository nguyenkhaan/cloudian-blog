import { drizzle } from 'drizzle-orm/d1';

//De dung dung cu phap db.query.UserModel.findFirst() thi phai thuc hien viec nay
import * as schema from '@/model';

export const createDb = (db: D1Database) => {
    return drizzle(db, { schema });
};

type DrizzleDb = ReturnType<typeof createDb>;
type TransactionalDb = Parameters<Parameters<DrizzleDb['transaction']>[0]>[0];

function isUnsupportedTransactionError(error: unknown): boolean {
    const getMessage = (err: unknown): string => 
        err instanceof Error ? err.message : String(err);
    
    // Check if this error or its cause indicates unsupported D1 transaction
    const checkError = (err: unknown): boolean => 
        /begin transaction|savepoint|state\.storage\.transaction|D1_ERROR/i.test(getMessage(err));
    
    if (checkError(error)) {
        return true;
    }
    
    // Check the cause property if it exists
    if ('cause' in error && error.cause !== null && typeof error.cause === 'object') {
        return checkError(error.cause);
    }
    
    return false;
}

export async function runWithTransaction<T>(
    db: DrizzleDb,
    operation: (tx: TransactionalDb) => Promise<T>
): Promise<T> {
    try {
        return await db.transaction(async (tx) => operation(tx));
    } catch (error) {
        if (isUnsupportedTransactionError(error)) {
            console.warn('D1 transaction is not supported in this runtime; running the operation without a transaction.');
            return operation(db as unknown as TransactionalDb);
        }
        throw error;
    }
}
