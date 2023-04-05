import { ChatGPTAPI } from 'chatgpt';
import { env } from './utils/env';
// store conversation
const memory = new Map();
const api = new ChatGPTAPI({
    sessionToken: env.CHATGPT_TOKEN,
});
const check = () => {
    return api.ensureAuth();
};
/**
 * send message to chatGPT
 */
export const send = async (id, context, onResponse) => {
    const sId = id.toString();
    let conversation = memory.get(sId);
    if (!conversation) {
        conversation = await create(sId);
    }
    return conversation.sendMessage(context, {
        timeoutMs: 2 * 60 * 1000,
        onConversationResponse(even) {
            onResponse?.(even.message?.content.parts[0] || '');
        },
    });
};
/**
 * create a new conversation
 */
export const create = async (id) => {
    const sId = id.toString();
    const conversation = api.getConversation();
    await check();
    memory.set(sId, conversation);
    return conversation;
};
//# sourceMappingURL=conversation.js.map