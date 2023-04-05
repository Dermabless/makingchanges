import { ChatGPTConversation } from 'chatgpt';
/**
 * send message to chatGPT
 */
export declare const send: (id: number | string, context: string, onResponse?: ((contents: string) => void) | undefined) => Promise<string>;
/**
 * create a new conversation
 */
export declare const create: (id: number | string) => Promise<ChatGPTConversation>;
//# sourceMappingURL=conversation.d.ts.map