const botMemory = new Map();
export const editMessage = async (ctx, chatId, messageId, message) => {
    const key = `${chatId}-${messageId}`;
    if (botMemory.get(key)) {
        return;
    }
    botMemory.set(key, true);
    await ctx.telegram
        .editMessageText(chatId, messageId, undefined, message)
        .catch(console.error)
        .finally(() => botMemory.delete(key));
};
//# sourceMappingURL=bot.js.map