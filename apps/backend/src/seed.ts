import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import drizzleConfig from '../drizzle.config';
import { hashPass } from './helper/pwd';

const args = new Set(process.argv.slice(2));
const isRemote = args.has('--remote');
const isDryRun = args.has('--dry-run');
const databaseName = 'blogging-database';

function escapeSql(value: string | number | null) {
    if (value === null) {
        return 'NULL';
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return `'${value.replace(/'/g, "''")}'`;
}

function buildSeedSql(passwordHash: string, now: number) {
    return [
        'PRAGMA foreign_keys = ON;',
        'DELETE FROM post_tag;',
        'DELETE FROM post_collection;',
        'DELETE FROM tag;',
        'DELETE FROM collection;',
        'DELETE FROM comment;',
        'DELETE FROM report;',
        'DELETE FROM subscriber;',
        'DELETE FROM post;',
        'DELETE FROM user_role;',
        'DELETE FROM user;',
        '',
        `INSERT INTO user (email, name, nickName, password, active, approve) VALUES (${escapeSql('admin@gmail.com')}, ${escapeSql('Admin User')}, ${escapeSql('admin')}, ${escapeSql(passwordHash)}, 1, 1);`,
        `INSERT INTO user (email, name, nickName, password, active, approve) VALUES (${escapeSql('manager@gmail.com')}, ${escapeSql('Manager User')}, ${escapeSql('manager')}, ${escapeSql(passwordHash)}, 1, 1);`,
        `INSERT INTO user (email, name, nickName, password, active, approve) VALUES (${escapeSql('user@gmail.com')}, ${escapeSql('Regular User')}, ${escapeSql('user')}, ${escapeSql(passwordHash)}, 1, 1);`,
        `INSERT INTO user (email, name, nickName, password, active, approve) VALUES (${escapeSql('reporter@gmail.com')}, ${escapeSql('Reporter User')}, ${escapeSql('reporter')}, ${escapeSql(passwordHash)}, 1, 1);`,
        `INSERT INTO user_role (user_id, role) SELECT id, 'admin' FROM user WHERE email = 'admin@gmail.com';`,
        `INSERT INTO user_role (user_id, role) SELECT id, 'manager' FROM user WHERE email = 'admin@gmail.com';`,
        `INSERT INTO user_role (user_id, role) SELECT id, 'user' FROM user WHERE email = 'admin@gmail.com';`,
        `INSERT INTO user_role (user_id, role) SELECT id, 'manager' FROM user WHERE email = 'manager@gmail.com';`,
        `INSERT INTO user_role (user_id, role) SELECT id, 'user' FROM user WHERE email = 'manager@gmail.com';`,
        `INSERT INTO user_role (user_id, role) SELECT id, 'user' FROM user WHERE email = 'user@gmail.com';`,
        `INSERT INTO user_role (user_id, role) SELECT id, 'user' FROM user WHERE email = 'reporter@gmail.com';`,
        `INSERT INTO tag (name, slug) VALUES ('Technology', 'technology');`,
        `INSERT INTO tag (name, slug) VALUES ('Programming', 'programming');`,
        `INSERT INTO tag (name, slug) VALUES ('Serverless', 'serverless');`,
        `INSERT INTO tag (name, slug) VALUES ('Hono Framework', 'hono-framework');`,
        `INSERT INTO collection (name, description, thumbnail) VALUES ('Backend Masterclass', 'Learn how to build high performance backends using Hono, Drizzle, and TypeScript.', 'https://res.cloudinary.com/demo/image/upload/v1619098909/sample.jpg');`,
        `INSERT INTO collection (name, description, thumbnail) VALUES ('Going Serverless', 'Deep dive into Cloudflare Workers, KV, D1, and R2 bindings.', 'https://res.cloudinary.com/demo/image/upload/v1619098909/sample.jpg');`,
        `INSERT INTO post (title, content, slug, author_id, banner, status, published_at) VALUES ('Building Fast APIs with Hono', 'Hono is a small, simple, and ultrafast web framework built for Cloudflare Workers, Bun, and other JavaScript runtimes. In this article, we explore the basics of routing, middleware, and request validation...', 'building-fast-apis-with-hono', (SELECT id FROM user WHERE email = 'admin@gmail.com'), 'https://res.cloudinary.com/demo/image/upload/v1619098909/sample.jpg', 'published', ${now});`,
        `INSERT INTO post (title, content, slug, author_id, banner, status, published_at) VALUES ('Deploying Serverless Backends on Cloudflare Workers', 'Cloudflare Workers offer an incredibly cheap and performant way to run code at the edge. We will guide you through connecting a Worker to a D1 SQLite database, running schema migrations, and handling requests.', 'deploying-serverless-backends-on-cloudflare-workers', (SELECT id FROM user WHERE email = 'manager@gmail.com'), 'https://res.cloudinary.com/demo/image/upload/v1619098909/sample.jpg', 'published', ${now});`,
        `INSERT INTO post (title, content, slug, author_id, banner, status, published_at) VALUES ('Deploying Next.js on Cloudflare Pages', 'This is a draft post detailing the deploy step of a Next.js frontend to Cloudflare Pages. It is currently under editing review.', 'deploying-nextjs-on-cloudflare-pages', (SELECT id FROM user WHERE email = 'admin@gmail.com'), NULL, 'draft', NULL);`,
        `INSERT INTO post_tag (tag_id, post_id) SELECT (SELECT id FROM tag WHERE slug = 'technology'), (SELECT id FROM post WHERE slug = 'building-fast-apis-with-hono');`,
        `INSERT INTO post_tag (tag_id, post_id) SELECT (SELECT id FROM tag WHERE slug = 'hono-framework'), (SELECT id FROM post WHERE slug = 'building-fast-apis-with-hono');`,
        `INSERT INTO post_tag (tag_id, post_id) SELECT (SELECT id FROM tag WHERE slug = 'technology'), (SELECT id FROM post WHERE slug = 'deploying-serverless-backends-on-cloudflare-workers');`,
        `INSERT INTO post_tag (tag_id, post_id) SELECT (SELECT id FROM tag WHERE slug = 'serverless'), (SELECT id FROM post WHERE slug = 'deploying-serverless-backends-on-cloudflare-workers');`,
        `INSERT INTO post_collection (post_id, collection_id) SELECT (SELECT id FROM post WHERE slug = 'building-fast-apis-with-hono'), (SELECT id FROM collection WHERE name = 'Backend Masterclass');`,
        `INSERT INTO post_collection (post_id, collection_id) SELECT (SELECT id FROM post WHERE slug = 'deploying-serverless-backends-on-cloudflare-workers'), (SELECT id FROM collection WHERE name = 'Going Serverless');`,
        `INSERT INTO comment (content, status, user_id, post_id) VALUES ('This is an amazing framework! Built my first API in 5 minutes.', 'active', (SELECT id FROM user WHERE email = 'user@gmail.com'), (SELECT id FROM post WHERE slug = 'building-fast-apis-with-hono'));`,
        `INSERT INTO comment (content, status, user_id, post_id) VALUES ('Is this production ready? Can we run it on Node environments too?', 'active', (SELECT id FROM user WHERE email = 'reporter@gmail.com'), (SELECT id FROM post WHERE slug = 'building-fast-apis-with-hono'));`,
        `INSERT INTO comment (content, status, user_id, post_id) VALUES ('Yes, Hono supports Node.js, Bun, Deno, and Cloudflare Workers seamlessly!', 'active', (SELECT id FROM user WHERE email = 'admin@gmail.com'), (SELECT id FROM post WHERE slug = 'building-fast-apis-with-hono'));`,
        `INSERT INTO comment (content, status, user_id, post_id) VALUES ('Buy cheap stocks option links here!!! http://spam-links.com', 'invalid', (SELECT id FROM user WHERE email = 'reporter@gmail.com'), (SELECT id FROM post WHERE slug = 'building-fast-apis-with-hono'));`,
        `INSERT INTO report (title, content, user_id, status, entity, solved_at) VALUES ('Spam Comment Report', 'The comment with ID 1 contains unsolicited financial spam links.', (SELECT id FROM user WHERE email = 'user@gmail.com'), 'solved', 'comment', ${now});`,
        `INSERT INTO report (title, content, user_id, status, entity, solved_at) VALUES ('Outdated Info in Workers Post', 'The D1 connections limit is stated as 10 in the post, but the modern limit has been raised to 100.', (SELECT id FROM user WHERE email = 'reporter@gmail.com'), 'pending', 'post', NULL);`,
        `INSERT INTO subscriber (email, name, delete_at, note) VALUES ('subscriber.alice@example.com', 'Alice Smith', NULL, 'Subscribed via landing page');`,
        `INSERT INTO subscriber (email, name, delete_at, note) VALUES ('subscriber.bob@example.com', 'Bob Johnson', NULL, 'Subscribed via footer');`,
        `INSERT INTO subscriber (email, name, delete_at, note) VALUES ('charlie.unsubscribed@example.com', 'Charlie Brown', ${now}, 'Unsubscribed on newsletter');`,
    ].join('\n');
}

async function seedLocal(sqlText: string) {
    const dbUrl =
        (drizzleConfig as any)?.dbCredentials?.url ||
        './.wrangler/state/v3/d1/database.sqlite';
    const dbPath = path.resolve(process.cwd(), dbUrl);

    console.log(`Connecting to local SQLite database at: ${dbPath}`);

    // @ts-ignore
    const better = await import('better-sqlite3').catch(() => null);
    if (!better) {
        throw new Error(
            'No better-sqlite3 database driver found. Please run: bun install better-sqlite3 --save-dev'
        );
    }

    const Database = (better as any).default ?? better;
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    db.exec(sqlText);
    db.close();
}

async function seedRemote(sqlText: string) {
    const tempFile = path.join(os.tmpdir(), `blogging-d1-seed-${Date.now()}.sql`);

    try {
        fs.writeFileSync(tempFile, sqlText, 'utf8');
        const bunxCommand = process.platform === 'win32' ? 'bunx.cmd' : 'bunx';
        const argsToPass = ['wrangler', 'd1', 'execute', databaseName, '--remote', '--file', tempFile];

        if (isDryRun) {
            console.log('Dry run:');
            console.log(`$ ${bunxCommand} ${argsToPass.join(' ')}`);
            return;
        }

        console.log(`Seeding remote D1 database '${databaseName}' via Wrangler...`);
        execFileSync(bunxCommand, argsToPass, {
            cwd: process.cwd(),
            stdio: 'inherit'
        });
    } finally {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
    }
}

async function main() {
    try {
        const now = Date.now();
        const userPassword = await hashPass('cloudian123');
        const sqlText = buildSeedSql(userPassword, now);

        if (isRemote) {
            await seedRemote(sqlText);
        } else {
            await seedLocal(sqlText);
        }

        console.log('Seeding completed successfully!');
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

main();
