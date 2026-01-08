const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logAction } = require('../../utils/logger');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Select a member and kick them.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for kicking'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
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
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        // Fetch the guild member to check kickable status
        let member;
        try {
            member = await interaction.guild.members.fetch(target.id);
        } catch (e) {
            return interaction.reply({ content: 'User not found in this guild.', ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: 'I cannot kick this user. They may have a higher role or I lack permissions.', ephemeral: true });
        }

        await member.kick(reason);
        await interaction.reply({ content: `Successfully kicked **${target.tag}** for: ${reason}`, ephemeral: false });

        const logEmbed = new EmbedBuilder()
            .setColor(0xFFA500) // Orange
            .setTitle('Member Kicked')
            .addFields(
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        await logAction(interaction.client, interaction.guild.id, logEmbed);
    },
};
