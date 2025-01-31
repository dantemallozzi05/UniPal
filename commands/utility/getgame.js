const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getgame')
        .setDescription("Will tell you the game you are currently playing."),
    async execute(interaction) {
        // store the user who ran command in order to obtain activity
        const member = await interaction.guild.members.fetch(interaction.user.id);

        if (!member.presence || !member.presence.activities.length) {
            await interaction.reply({ content: "You're not currently playing any game.", flags: MessageFlags.Ephemeral });
            return;
        }

        const game = member.presence.activities.find(activity => activity.type === 'PLAYING');

        if (game) {
            await interaction.reply({ content: `You're currently playing **${game.name}**.`, flags: MessageFlags.Ephemeral });  
        }
        else {
            await interaction.reply({ content: "You're not currently playing any game.", flags: MessageFlags.Ephemeral });
        }
    },
};