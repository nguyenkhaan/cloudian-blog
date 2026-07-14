# HUONG DAN CAI DAT VA THIET LAP CLOUDFLARE D1 + DRIZZLE ORM (BURNING SOUL)

Cac buoc tu 1 den 3 se huong dan cho chung ta setup mot database su dung Cloudflare D1

## 1. Cai dat packages

```bash
bun add drizzle-orm
bun add -d drizzle-kit wrangler
```

- Wrangler la cong cu dong lenh (CLI) chinh thuc cua cloudflare. No giup ban de dang code, kiem thu va dua code cua minh len tren moi truong production cua Cloudflare Worker (Nen tang chay code truc tiep tren mang toan cau)

## 2. Tao D1 Database

- Dang nhap Cloudflare

```
bunx wrangler login
```

Sau khi dang nhap thanh cong, Cloudflare se hoi chung ta co muon cai dat cac skill agents de phu hop cho qua trinh su dung cac agent khong? Chung ta co the bam "Y" o Terminal de xac nhan cai dat

Tien hanh tao mot database (Hay thay ten database cua ban vao)

```bash
bunx wangler d1 create blogging-db
```

Ket qua nhan duoc se nhu sau:

```bash
cloud@cloud ~/w/w/blogging-website (master) [1]> bunx wrangler d1 create blogging-database

 ⛅️ wrangler 4.110.0
────────────────────
✅ Successfully created DB 'blogging-database' in region APAC
Created your new D1 database.

To access your new D1 Database in your Worker, add the following snippet to your configuration file:
{
  "d1_databases": [
    {
      "binding": "blogging_database",
      "database_name": "blogging-database",
      "database_id": "9327b459-0749-44ee-ad55-b7271993a4f1"
    }
  ]
}
```

## 3. Tao wrangler.jsonc

Tai thu muc root cua du an BE, hay tao mot file wrangler.jsonc

```bash
{
  "name": "blog-api",
  "main": "./src/index.ts",
  # File main entry point cua du an 
  "compatibility_date": "2026-07-13",
  "d1_databases": [
    {
      "binding": "blogging_database",   # Copy cai ma wrangler o Buoc 2 tra ve
      "database_name": "blogging-database", # Copy cai ma wrangler o Buoc 2 tra ve
      "database_id": "9327b459-0749-44ee-ad55-b7271993a4f1" # Copy cai ma wrangler o Buoc 2 tra ve
    }
  ], 
}
```

Cac buoc sau se huong dan chung ta setup drizzleORM de thuc hien coding voi cloudflare D1.

## 4. Tao file config & schema 

### config 
- Buoc 1: Cai dat file `drizzle.config.ts`. Tai root cua BE, hay to 1 file voi ten la `drizzle.config.ts`

https://orm.drizzle.team/docs/drizzle-config-file

```typescript
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    //dialect. ban chat cua cloudflare D1 la sqlite => Ve ban chat chung ta dang dung sqlite 
    dialect: 'sqlite',
    //Duong link dan den cac file model. Cac file model (dinh nghia bang database) cua du an duoc dat ben trong thu muc co ten la models
    schema: './src/model/*.ts',   
    //Thu muc migration. Deck can quan tam lam 
    out: './migrations',   
    //Khong con la ./dizzle nua ma se la ./migrations. Thu muc migrations la noi ma wrangler (cloudflare D1) se tien hanh doc cac file migration 
});
``` 

### schema 




- Khai bao cac relations: 

```ts
export const UserRelations = relations(UserModel , ({one , many}) => {  //Ten bang 
    return {
        roles: many(UserRoleModel),   //Ten bang tham chieu toi 
    }
})

export const UserRoleRelations = relations(UserRoleModel , ({one , many}) => {
    return {
        user: one(UserModel , {  //Ten bang tham chieu toi 
            fields: [UserRoleModel.userId],    //Cot tham chieu ben bang 
            references: [UserModel.id]  //Cot ben bang tham chieu toi 
        })
    }
}) 
```

## 5. Tao migration & Apply Local 
Sau khi khai bao xong cac model, tien hanh chay lenh de co the sinh ra duoc cac file migration 

```bash 
bunx drizzle-kit generate 
``` 

Apply local 
```bash 
bunx wrangler d1 migrations apply blogging-database --local 
```

Neu nhu thuc hien thanh cong thi se duoc nhu the nay: 

```bash

 ⛅️ wrangler 4.110.0
────────────────────
Resource location: local 

Use --remote if you want to access the remote instance.

Migrations to be applied:
┌───────────────────────────┐
│ name                      │
├───────────────────────────┤
│ 0000_tired_power_pack.sql │
└───────────────────────────┘
✔ About to apply 1 migration(s)
Your database may not be available to serve requests during the migration, continue? … yes
🌀 Executing on local database blogging-database (9327b459-0749-44ee-ad55-b7271993a4f1) from .wrangler/state/v3/d1:
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
🚣 18 commands executed successfully.
```

## 6. Chay du an 

Chung ta se sua doi cau lenh chay du an, cau lenh chay chinh bay gio se la: 

```bash 
bunx wrangler dev --port 3000
```

```json 
// Chinh trong file package.json 
    "scripts": {
        "dev": "bunx wrangler dev --port 3000"
    },
```
Khi chay thi mot thu muc .wrangler se duoc sinh ra o root, chinh la file sql luu tru cac du lieu cua chung ta. Hay cau hinh drizzle-kit studio de co the doc duoc 
du lieu mot cach truc quan 

## 7. Cau hinh drizzle-kit studio 
De doc duoc sqlite thi can co drive sau
```bash
bun add -d better-sqlite3
```
Ben trong file cau hinh `drizzle.config.ts`. Chung ta se khai bao url chinh la noi chua file sqlite do trong du an

```ts 
    dbCredentials: {
        url: './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/6ba0406aa92c52e5df23a5a0c6ead6735c067543329502d78be23ddf78a4884e.sqlite'
    }
```

Sau khi thiet lap thanh cong thi hay chay lenh: `bunx drizzle-kit studio`. Chung ta se co duoc giao dien drizzle-kit voi day du cac bang 

## 8. Cai dat type<Env> de query database 

Cai dat type cua cloudflare worker 
```bash 
bun add -d @cloudflare/workers-types
```

Sau do ben trong file tsconfig.json. Hay tien hanh them types vao ben trong 
```json 
{
    "types": ["bun" , "@cloudflare/workers-types"],
}
```

Tien hanh tao cac file sau vao ben trong du an 

```typescript 
// src/db/index.ts
import {drizzle} from 'drizzle-orm/d1'

export const createDb = (db : D1Database) => {
    return drizzle(db) 
}
```

```typescript 
// src/types/env.ts
import {createDb} from '@/db/index'

export type AppEnv = {
    Bindings: {
        blogging_database : D1Database
    }, 
    Variables: {
        db: ReturnType<typeof createDb>
    }
}
```

Variables là nơi Hono lưu các giá trị được c.set() trong middleware.

Tao middleware 

```typescript 
// src/middleware/database.middleware.ts 
import { createDb } from '@/db';
import { AppEnv } from '@/types/env';
import { Context } from 'hono';
import {createMiddleware} from 'hono/factory'

export const databaseMiddleware = createMiddleware<AppEnv>(
    async (c : Context , next) => {
        const db = createDb(c.env.blogging_database) 
        c.set('db' , db) 
        next() 
    }
)
```

Ap dung middleware nay len tat ca cac route 
```typescript 
import { AppEnv } from './types/env';
import {databaseMiddleware} from '@/middleware/database.middleware'
const app = new Hono<AppEnv>();
app.use('*' , databaseMiddleware)
app.notFound((c: Context) => {
    return c.text('Cloudian Notification Not Found');
});

```

Sau nay de su dung thi chung ta chi can: 
```typescript 
const db = c.get('db') 
```

Bay gio, tat ca moi route deu phai truyen them generic AppEnv va dong thoi khong duoc ghi `async (c : Context)` nua ma chi can ghi `async (c)` thoi de tranh bi ghi de lai kieu du lieu da thiet lap (Kieu D1Database)