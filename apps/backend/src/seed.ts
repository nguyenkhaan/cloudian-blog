import { hash } from 'bcryptjs';
import * as path from 'path';
import drizzleConfig from '../drizzle.config';
import { hashPass } from './helper/pwd';

async function main() {
    try {
        const dbUrl =
            (drizzleConfig as any)?.dbCredentials?.url ||
            './.wrangler/state/v3/d1/database.sqlite';
        const dbPath = path.resolve(process.cwd(), dbUrl);

        // Try to load a sqlite client that's available in this environment.
        // @ts-ignore
        const better = await import('better-sqlite3').catch(() => null);
        if (better) {
            const Database = (better as any).default ?? better;
            const db = new Database(dbPath);

            const insertUser = db.prepare(
                'INSERT OR IGNORE INTO user (email, name, nickName, password, active, approve) VALUES (?, ?, ?, ?, ?, ?)'
            );
            const getUser = db.prepare('SELECT id FROM user WHERE email = ?');
            const getRole = db.prepare(
                'SELECT id FROM user_role WHERE user_id = ? AND role = ?'
            );
            const insertRole = db.prepare(
                'INSERT INTO user_role (user_id, role) VALUES (?, ?)'
            );

            // Seed Admin
            const adminPassword = await hashPass('cloudian123');
            insertUser.run(
                'admin@gmail.com',
                'Admin',
                'admin',
                adminPassword,
                1,
                1
            );
            const adminRow = getUser.get('admin@gmail.com') as
                { id: number } | undefined;
            if (adminRow) {
                const roleRow = getRole.get(adminRow.id, 'admin');
                if (!roleRow) {
                    insertRole.run(adminRow.id, 'admin');
                    insertRole.run(adminRow.id, 'user');
                }
            }

            // Seed User
            const userPassword = await hashPass('cloudian123');
            insertUser.run(
                'user@gmail.com',
                'Normal User',
                'user',
                userPassword,
                1,
                1
            );
            const userRow = getUser.get('user@gmail.com') as
                { id: number } | undefined;
            if (userRow) {
                const roleRow = getRole.get(userRow.id, 'user');
                if (!roleRow) {
                    insertRole.run(userRow.id, 'user');
                }
            }

            console.log(
                'Seeding finished: admin and user created (or already existed) with roles.'
            );
            db.close();
            return;
        }

        // @ts-ignore
        const sqlite3mod = await import('sqlite3').catch(() => null);
        if (sqlite3mod) {
            const sqlite3 = (sqlite3mod as any).verbose();
            const db = new sqlite3.Database(dbPath);

            const runAsync = (sql: string, params: any[]) =>
                new Promise<void>((resolve, reject) => {
                    db.run(sql, params, function (err: any) {
                        if (err) return reject(err);
                        resolve();
                    });
                });

            const getAsync = (sql: string, params: any[]) =>
                new Promise<any>((resolve, reject) => {
                    db.get(sql, params, (err: any, row: any) => {
                        if (err) return reject(err);
                        resolve(row);
                    });
                });

            // Seed Admin
            const adminPassword = await hash('Admin123!', 12);
            await runAsync(
                'INSERT OR IGNORE INTO user (email, name, nickName, password, active, approve) VALUES (?, ?, ?, ?, ?, ?)',
                ['admin@gmail.com', 'Admin', 'admin', adminPassword, 1, 1]
            );
            const adminRow = await getAsync(
                'SELECT id FROM user WHERE email = ?',
                ['admin@gmail.com']
            );
            if (adminRow) {
                const roleRow = await getAsync(
                    'SELECT id FROM user_role WHERE user_id = ? AND role = ?',
                    [adminRow.id, 'admin']
                );
                if (!roleRow) {
                    await runAsync(
                        'INSERT INTO user_role (user_id, role) VALUES (?, ?)',
                        [adminRow.id, 'admin']
                    );
                }
            }

            // Seed User
            const userPassword = await hash('User123!', 12);
            await runAsync(
                'INSERT OR IGNORE INTO user (email, name, nickName, password, active, approve) VALUES (?, ?, ?, ?, ?, ?)',
                ['user@gmail.com', 'Normal User', 'user', userPassword, 1, 1]
            );
            const userRow = await getAsync(
                'SELECT id FROM user WHERE email = ?',
                ['user@gmail.com']
            );
            if (userRow) {
                const roleRow = await getAsync(
                    'SELECT id FROM user_role WHERE user_id = ? AND role = ?',
                    [userRow.id, 'user']
                );
                if (!roleRow) {
                    await runAsync(
                        'INSERT INTO user_role (user_id, role) VALUES (?, ?)',
                        [userRow.id, 'user']
                    );
                }
            }

            console.log(
                'Seeding finished: admin and user created (or already existed) with roles.'
            );
            db.close();
            return;
        }

        throw new Error(
            'No supported sqlite client found. Install better-sqlite3 or sqlite3.'
        );
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

main();
