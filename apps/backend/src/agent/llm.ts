import { createAgent } from 'langchain';
import { mistralModel } from './model';
import { SYSTEM_PROMPT } from './prompt';
import { agentTools } from './tools';
import { createDb } from '@/db';

export const buildAgent = (db: ReturnType<typeof createDb>) => {
    return createAgent({
        model: mistralModel,
        systemPrompt: SYSTEM_PROMPT,
        tools: agentTools(db),
    });
};
