import * as path from 'path';
import drizzleConfig from '../drizzle.config';
import { hashPass } from './helper/pwd';

async function main() {
    try {
        const dbUrl =
            (drizzleConfig as any)?.dbCredentials?.url ||
            './.wrangler/state/v3/d1/database.sqlite';
        const dbPath = path.resolve(process.cwd(), dbUrl);

        console.log(`Connecting to database sqlite file at: ${dbPath}`);

        // Try to load a sqlite client that's available in this environment.
        // @ts-ignore
        const better = await import('better-sqlite3').catch(() => null);
        if (!better) {
            throw new Error(
                'No better-sqlite3 database driver found. Please run: bun install better-sqlite3 --save-dev'
            );
        }

        const Database = (better as any).default ?? better;
        const db = new Database(dbPath);

        // Turn on foreign keys enforcement
        db.pragma('foreign_keys = ON');

        // Clean tables to start fresh
        console.log('Cleaning existing tables...');
        db.prepare('DELETE FROM post_tag').run();
        db.prepare('DELETE FROM post_collection').run();
        db.prepare('DELETE FROM tag').run();
        db.prepare('DELETE FROM collection').run();
        db.prepare('DELETE FROM comment').run();
        db.prepare('DELETE FROM report').run();
        db.prepare('DELETE FROM subscriber').run();
        db.prepare('DELETE FROM post').run();
        db.prepare('DELETE FROM user_role').run();
        db.prepare('DELETE FROM user').run();

        // Prepare statements
        const insertUser = db.prepare(
            'INSERT INTO user (email, name, nickName, password, active, approve) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const insertRole = db.prepare(
            'INSERT INTO user_role (user_id, role) VALUES (?, ?)'
        );
        const insertTag = db.prepare(
            'INSERT INTO tag (name, slug) VALUES (?, ?)'
        );
        const insertCollection = db.prepare(
            'INSERT INTO collection (name, description, thumbnail) VALUES (?, ?, ?)'
        );
        const insertPost = db.prepare(
            'INSERT INTO post (title, content, slug, author_id, banner, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        const insertPostTag = db.prepare(
            'INSERT INTO post_tag (tag_id, post_id) VALUES (?, ?)'
        );
        const insertPostCollection = db.prepare(
            'INSERT INTO post_collection (post_id, collection_id) VALUES (?, ?)'
        );
        const insertComment = db.prepare(
            'INSERT INTO comment (content, status, user_id, post_id) VALUES (?, ?, ?, ?)'
        );
        const insertReport = db.prepare(
            'INSERT INTO report (title, content, user_id, status, entity, solved_at) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const insertSubscriber = db.prepare(
            'INSERT INTO subscriber (email, name, delete_at, note) VALUES (?, ?, ?, ?)'
        );

        // 1. Seed Users & Roles
        console.log('Seeding users...');
        const userPassword = await hashPass('cloudian123');

        // Admin User
        const adminResult = insertUser.run('admin@gmail.com', 'Admin User', 'admin', userPassword, 1, 1);
        const adminId = adminResult.lastInsertRowid;
        insertRole.run(adminId, 'admin');
        insertRole.run(adminId, 'manager');
        insertRole.run(adminId, 'user');

        // Manager User
        const managerResult = insertUser.run('manager@gmail.com', 'Manager User', 'manager', userPassword, 1, 1);
        const managerId = managerResult.lastInsertRowid;
        insertRole.run(managerId, 'manager');
        insertRole.run(managerId, 'user');

        // Regular User
        const normalUserResult = insertUser.run('user@gmail.com', 'Regular User', 'user', userPassword, 1, 1);
        const userId = normalUserResult.lastInsertRowid;
        insertRole.run(userId, 'user');

        // Reporter User
        const reporterResult = insertUser.run('reporter@gmail.com', 'Reporter User', 'reporter', userPassword, 1, 1);
        const reporterId = reporterResult.lastInsertRowid;
        insertRole.run(reporterId, 'user');

        // 2. Seed Tags
        console.log('Seeding tags...');
        const tagTech = insertTag.run('Technology', 'technology').lastInsertRowid;
        const tagProg = insertTag.run('Programming', 'programming').lastInsertRowid;
        const tagServerless = insertTag.run('Serverless', 'serverless').lastInsertRowid;
        const tagHono = insertTag.run('Hono Framework', 'hono-framework').lastInsertRowid;

        // 3. Seed Collections
        console.log('Seeding collections...');
        const colBackend = insertCollection.run(
            'Backend Masterclass',
            'Learn how to build high performance backends using Hono, Drizzle, and TypeScript.',
            'https://res.cloudinary.com/demo/image/upload/v1619098909/sample.jpg'
        ).lastInsertRowid;

        const colServerless = insertCollection.run(
            'Going Serverless',
            'Deep dive into Cloudflare Workers, KV, D1, and R2 bindings.',
            'https://res.cloudinary.com/demo/image/upload/v1619098909/sample.jpg'
        ).lastInsertRowid;

        // 4. Seed Posts
        console.log('Seeding posts...');
        const now = Date.now();

        // Post 1: Hono
        const postHonoId = insertPost.run(
            'Building Fast APIs with Hono',
            'Hono is a small, simple, and ultrafast web framework built for Cloudflare Workers, Bun, and other JavaScript runtimes. In this article, we explore the basics of routing, middleware, and request validation...',
            'building-fast-apis-with-hono',
            adminId,
            'https://res.cloudinary.com/demo/image/upload/v1619098909/sample.jpg',
            'PUBLISHED',
            now
        ).lastInsertRowid;

        // Post 2: Workers
        const postWorkersId = insertPost.run(
            'Deploying Serverless Backends on Cloudflare Workers',
            'Cloudflare Workers offer an incredibly cheap and performant way to run code at the edge. We will guide you through connecting a Worker to a D1 SQLite database, running schema migrations, and handling requests.',
            'deploying-serverless-backends-on-cloudflare-workers',
            managerId,
            'https://res.cloudinary.com/demo/image/upload/v1619098909/sample.jpg',
            'PUBLISHED',
            now
        ).lastInsertRowid;

        // Post 3: Draft post
        const postDraftId = insertPost.run(
            'Deploying Next.js on Cloudflare Pages',
            'This is a draft post detailing the deploy step of a Next.js frontend to Cloudflare Pages. It is currently under editing review.',
            'deploying-nextjs-on-cloudflare-pages',
            adminId,
            null,
            'DRAFT',
            null
        ).lastInsertRowid;

        // Map posts to tags
        insertPostTag.run(tagTech, postHonoId);
        insertPostTag.run(tagHono, postHonoId);
        insertPostTag.run(tagTech, postWorkersId);
        insertPostTag.run(tagServerless, postWorkersId);

        // Map posts to collections
        insertPostCollection.run(postHonoId, colBackend);
        insertPostCollection.run(postWorkersId, colServerless);

        // 5. Seed Comments
        console.log('Seeding comments...');
        insertComment.run(
            'This is an amazing framework! Built my first API in 5 minutes.',
            'active',
            userId,
            postHonoId
        );
        insertComment.run(
            'Is this production ready? Can we run it on Node environments too?',
            'active',
            reporterId,
            postHonoId
        );
        insertComment.run(
            'Yes, Hono supports Node.js, Bun, Deno, and Cloudflare Workers seamlessly!',
            'active',
            adminId,
            postHonoId
        );
        const spamCommentId = insertComment.run(
            'Buy cheap stocks option links here!!! http://spam-links.com',
            'invalid',
            reporterId,
            postHonoId
        ).lastInsertRowid;

        // 6. Seed Reports
        console.log('Seeding reports...');
        // Solved report (reporting the spam comment)
        insertReport.run(
            'Spam Comment Report',
            `The comment with ID ${spamCommentId} contains unsolicited financial spam links.`,
            userId,
            'solved',
            'comment',
            now
        );

        // Pending report (reporting incorrect content in Workers post)
        insertReport.run(
            'Outdated Info in Workers Post',
            `The D1 connections limit is stated as 10 in the post, but the modern limit has been raised to 100.`,
            reporterId,
            'pending',
            'post',
            null
        );

        // 7. Seed Subscribers
        console.log('Seeding subscribers...');
        insertSubscriber.run('subscriber.alice@example.com', 'Alice Smith', null, 'Subscribed via landing page');
        insertSubscriber.run('subscriber.bob@example.com', 'Bob Johnson', null, 'Subscribed via footer');
        insertSubscriber.run('charlie.unsubscribed@example.com', 'Charlie Brown', now, 'Unsubscribed on newsletter');

        console.log('Seeding completed successfully!');
        db.close();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

main();
