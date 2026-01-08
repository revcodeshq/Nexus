const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logAction } = require('../../utils/logger');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Select a member and ban them.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for banning'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
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

        let member;
        try {
            member = await interaction.guild.members.fetch(target.id);
        } catch (error) {
            // User might no longer be in guild, but can still be banned by ID if we used ID option, 
            // but here we used getUser which returns a User object. 
            // Discord js ban method works on GuildMemberManager not Member, passing user/id works.
        }

        // Check bannable if member is in guild
        if (member && !member.bannable) {
            return interaction.reply({ content: 'I cannot ban this user. They may have a higher role or I lack permissions.', ephemeral: true });
        }

        try {
            await interaction.guild.members.ban(target, { reason });
            await interaction.reply({ content: `Successfully banned **${target.tag}** for: ${reason}`, ephemeral: false });

            const logEmbed = new EmbedBuilder()
                .setColor(0xFF0000) // Red
                .setTitle('Member Banned')
                .addFields(
                    { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await logAction(interaction.client, interaction.guild.id, logEmbed);

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error trying to ban this user.', ephemeral: true });
        }
    },
};
