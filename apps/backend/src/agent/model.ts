import { ChatMistralAI } from '@langchain/mistralai';
import { RunnableSequence } from '@langchain/core/runnables';
import { BaseMessage } from '@langchain/core/messages';

export const mistralModel = new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    model: 'mistral-large-latest',
    temperature: 0.1,
    maxTokens: 2048,
});

export const sanitizeMessagesForMistral = (messages: BaseMessage[]): BaseMessage[] => {
    return messages.map((msg) => {
        let content = msg.content;
        if (Array.isArray(content)) {
            const cleanContent = content.filter(
                (block) =>
                    block &&
                    typeof block === 'object' &&
                    (block.type === 'text' || block.type === 'image_url')
            );
            
            if (cleanContent.every((block) => block.type === 'text')) {
                content = cleanContent.map((block: any) => block.text).join('\n');
            } else {
                content = cleanContent;
            }
        }
        
        const cloned = new (msg.constructor as any)({
            content: content,
            name: (msg as any).name,
            id: msg.id,
            additional_kwargs: msg.additional_kwargs,
            response_metadata: msg.response_metadata,
            tool_calls: (msg as any).tool_calls,
            invalid_tool_calls: (msg as any).invalid_tool_calls,
            tool_call_id: (msg as any).tool_call_id,
        });
        return cloned;
    });
};

export const safeMistralModel = RunnableSequence.from([
    sanitizeMessagesForMistral,
    mistralModel,
]);

