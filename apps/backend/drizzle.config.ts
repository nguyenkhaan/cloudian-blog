import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    dialect: 'sqlite',
    schema: './src/model/*.ts',
    out: './migrations',
    dbCredentials: {
        url: './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/6ba0406aa92c52e5df23a5a0c6ead6735c067543329502d78be23ddf78a4884e.sqlite',
    },
});
