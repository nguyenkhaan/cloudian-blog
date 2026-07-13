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
  "main": "index.ts",
  "compatibility_date": "2026-07-13",
  "d1_databases": [
    {
      "binding": "blogging_database",   # Copy cai ma wrangler o Buoc 2 tra ve
      "database_name": "blogging-database", # Copy cai ma wrangler o Buoc 2 tra ve
      "database_id": "9327b459-0749-44ee-ad55-b7271993a4f1" # Copy cai ma wrangler o Buoc 2 tra ve
    }
  ]
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
    out: './drizzle',
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

