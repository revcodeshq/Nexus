const config = require('../config.json');

async function logAction(client, guildId, embed) {
    const channelId = config.channels.logChannelId;
    // content check if configured
    if (!channelId || channelId === 'YOUR_LOG_CHANNEL_ID') return;

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const channel = guild.channels.cache.get(channelId);
    if (channel) {
        await channel.send({ embeds: [embed] }).catch(console.error);
    } else {
        console.warn(`Log channel with ID ${channelId} not found in guild ${guildId}`);
    }
}

module.exports = { logAction };
