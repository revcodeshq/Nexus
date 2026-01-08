const { Events, ChannelType, PermissionsBitField, ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, Collection } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // --- Command Handling ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            // Cooldowns
            const { cooldowns } = interaction.client;
            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldown = 3;
            const cooldownAmount = (command.cooldown ?? defaultCooldown) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
                }
            }
            return;
        }

        // --- Button Handling (Tickets) ---
        if (interaction.isButton()) {
            const { customId } = interaction;

            if (customId === 'create_ticket') {
                // Check if user already has a ticket? (Optional, skipping for simplicity)

                const guild = interaction.guild;
                const user = interaction.user;

                // Create Ticket Channel
                try {
                    const channel = await guild.channels.create({
                        name: `ticket-${user.username}`,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            {
                                id: guild.id,
                                deny: [PermissionsBitField.Flags.ViewChannel],
                            },
                            {
                                id: user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                            },
                            // Allow bot to see
                            {
                                id: interaction.client.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                            }
                        ],
                    });

                    const embed = new EmbedBuilder()
                        .setTitle(`Ticket for ${user.username}`)
                        .setDescription('Support will be with you shortly. Click the button below to close this ticket.')
                        .setColor(0x00FF00);

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('close_ticket')
                                .setLabel('Close Ticket')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('🔒')
                        );

                    await channel.send({ content: `${user}`, embeds: [embed], components: [row] });
                    await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });

                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'Failed to create ticket channel. Missing permissions?', ephemeral: true });
                }
            } else if (customId === 'close_ticket') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    // Check if it's the ticket owner? Usually mods or owner close. 
                    // For now allow anyone inside or restrict to ManageChannels.
                    // A ticket system usually lets the user close their own ticket.
                    // Let's check if the topic or name allows us to identify ownership or just allow it.
                    // Simplest: just allow close.
                }

                await interaction.reply({ content: 'Closing ticket in 5 seconds...' });
                setTimeout(() => {
                    interaction.channel.delete().catch(console.error);
                }, 5000);
            }
        }
    },
};
