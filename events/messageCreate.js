const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

const spamMap = new Map();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // --- Bad Word Filter ---
        const content = message.content.toLowerCase();
        const foundBadWord = config.moderation.filteredWords.some(word => content.includes(word.toLowerCase()));

        if (foundBadWord) {
            try {
                await message.delete();
                const warningMsg = await message.channel.send(`${message.author}, watch your language!`);
                setTimeout(() => warningMsg.delete().catch(() => { }), 5000);
                return; // Stop processing to avoid spam triggering on deleted message
            } catch (error) {
                console.error('Failed to delete bad word message:', error);
            }
        }

        // --- Basic Anti-Spam (Rate Limiting) ---
        // Simple implementation: 5 messages in 5 seconds
        const { spamThreshold } = config.moderation || 5;
        const TIME_WINDOW = 5000; // 5 seconds

        if (!spamMap.has(message.author.id)) {
            spamMap.set(message.author.id, { count: 1, lastMessage: Date.now() });
        } else {
            const userData = spamMap.get(message.author.id);
            const now = Date.now();

            if (now - userData.lastMessage < TIME_WINDOW) {
                userData.count++;
                if (userData.count >= spamThreshold && userData.count < spamThreshold + 2) {
                    // Use threshold + 2 to avoid spamming the warning itself
                    await message.channel.send(`${message.author}, you are sending messages too fast!`);

                    // Optional: Timeout user (needs permissions)
                    /* 
                    try {
                        const member = await message.guild.members.fetch(message.author.id);
                        if (member.moderatable) await member.timeout(60 * 1000, 'Anti-spam');
                    } catch(e) {}
                    */
                }
            } else {
                // Reset if outside window
                userData.count = 1;
                userData.lastMessage = now;
            }
        }
    },
};
