const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Try to find a channel named 'welcome', 'general', or use system channel
        let channel = member.guild.channels.cache.find(ch => ch.name === 'welcome' || ch.name === 'general');
        if (!channel && member.guild.systemChannel) {
            channel = member.guild.systemChannel;
        }

        // Or use explicit ID if configured
        if (config.channels.welcomeChannelId && config.channels.welcomeChannelId !== 'YOUR_WELCOME_CHANNEL_ID') {
            const configChannel = member.guild.channels.cache.get(config.channels.welcomeChannelId);
            if (configChannel) channel = configChannel;
        }

        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Welcome!')
            .setDescription(`Welcome to the server, ${member}! We are glad to have you here.`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        channel.send({ embeds: [welcomeEmbed] }).catch(console.error);
    },
};
