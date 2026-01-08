const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logAction } = require('../../utils/logger');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const modRoleId = config.moderation.moderatorRoleId;
        if (modRoleId && modRoleId !== 'YOUR_MOD_ROLE_ID') {
            if (!interaction.member.roles.cache.has(modRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('⛔ Access Denied')
                    .setDescription('You do not have the required **Moderator** role to use this command.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }

        const target = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        let member;
        try {
            member = await interaction.guild.members.fetch(target.id);
        } catch (e) {
            return interaction.reply({ content: 'User not found in this guild.', ephemeral: true });
        }

        if (!member.moderatable) {
            return interaction.reply({ content: 'I cannot timeout this user.', ephemeral: true });
        }

        try {
            await member.timeout(duration * 60 * 1000, reason);
            await interaction.reply(`Timed out **${target.tag}** for ${duration} minutes. Reason: ${reason}`);

            const logEmbed = new EmbedBuilder()
                .setColor(0xFFFF00) // Yellow
                .setTitle('Member Timed Out')
                .addFields(
                    { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Duration', value: `${duration} minutes`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await logAction(interaction.client, interaction.guild.id, logEmbed);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to timeout user.', ephemeral: true });
        }
    },
};
