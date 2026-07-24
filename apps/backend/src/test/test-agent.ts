import * as fs from 'fs';
import * as path from 'path';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
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
        const { buildAgent } = await import("../agent/llm");
        const { HumanMessage } = await import("langchain");
        const { drizzle } = await import("drizzle-orm/better-sqlite3");
        // @ts-ignore
        const { default: Database } = await import("better-sqlite3");
        const schema = await import("../model");

        const dbPath = path.resolve(process.cwd(), './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/6ba0406aa92c52e5df23a5a0c6ead6735c067543329502d78be23ddf78a4884e.sqlite');
        const sqlite = new Database(dbPath);
        const db = drizzle(sqlite, { schema });

        const agent = buildAgent(db as any);
        console.log("Invoking agent...");
        const response = await agent.invoke({
            messages: [
                new HumanMessage("Bài viết nào liên quan chủ đề Hono hoặc Cloudflare")
            ]
        });
        fs.writeFileSync('agent-output.json', JSON.stringify(response, null, 2));
        console.log("Saved output to agent-output.json");
    } catch (e) {
        console.error("Error during agent execution:", e);
    }
}
main();
