import { createAgent } from 'langchain';
import { safeMistralModel } from './model';
import { SYSTEM_PROMPT } from './prompt';
import { agentTools } from './tools';
import { createDb } from '@/db';

export const buildAgent = (db: ReturnType<typeof createDb>) => {
    return createAgent({
        model: safeMistralModel,
        systemPrompt: SYSTEM_PROMPT,
        tools: agentTools(db),
    });
};
