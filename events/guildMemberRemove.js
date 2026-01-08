const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        // Try to find a channel named 'welcome', 'general', or use system channel
        let channel = member.guild.channels.cache.find(ch => ch.name === 'welcome' || ch.name === 'general');
        if (!channel && member.guild.systemChannel) {
            channel = member.guild.systemChannel;
        }

        if (config.channels.welcomeChannelId && config.channels.welcomeChannelId !== 'YOUR_WELCOME_CHANNEL_ID') {
            const configChannel = member.guild.channels.cache.get(config.channels.welcomeChannelId);
            if (configChannel) channel = configChannel;
        }

        if (!channel) return;

        const goodbyeEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setDescription(`**${member.user.tag}** has left the server.`)
            .setTimestamp();

        channel.send({ embeds: [goodbyeEmbed] }).catch(console.error);
    },
};
