import { ChatMistralAI } from '@langchain/mistralai';

export const mistralModel = new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    model: 'mistral-medium-latest',
    temperature: 0.1,
    maxTokens: 2048,
});
