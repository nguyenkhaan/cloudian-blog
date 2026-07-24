import * as fs from 'fs';
import * as path from 'path';

// Load .env manually
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const index = trimmed.indexOf('=');
            if (index !== -1) {
                const key = trimmed.substring(0, index).trim();
                const value = trimmed.substring(index + 1).trim();
                process.env[key] = value;
            }
        }
    });
}

async function main() {
    try {
        const { mistralModel } = await import("../agent/model");
        const { agentTools } = await import("../agent/tools");
        const { SYSTEM_PROMPT } = await import("../agent/prompt");
        const { drizzle } = await import("drizzle-orm/better-sqlite3");
        // @ts-ignore
        const { default: Database } = await import("better-sqlite3");
        const schema = await import("../model");

        const dbPath = path.resolve(__dirname, './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/6ba0406aa92c52e5df23a5a0c6ead6735c067543329502d78be23ddf78a4884e.sqlite');
        const sqlite = new Database(dbPath);
        const db = drizzle(sqlite, { schema });

        const tools = agentTools(db as any);
        console.log("Binding tools to model...");
        const boundModel = mistralModel.bindTools(tools);

        console.log("Invoking bound model with system prompt...");
        const { HumanMessage, SystemMessage } = await import("langchain");
        const response = await boundModel.invoke([
            new SystemMessage(SYSTEM_PROMPT),
            new HumanMessage("Bài viết nào liên quan chủ đề developer và IT")
        ]);
        console.log("Response:", JSON.stringify(response, null, 2));
    } catch (e) {
        console.error("Error during model execution:", e);
    }
}
main();
