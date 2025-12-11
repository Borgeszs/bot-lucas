const { SlashCommandBuilder } = require('discord.js');
module.exports = { data: new SlashCommandBuilder().setName('ping').setDescription('Pong'), async execute(interaction){ const sent = await interaction.reply({ content: 'Pong...', fetchReply:true }); interaction.editReply({ content: `Pong — ${sent.createdTimestamp - interaction.createdTimestamp}ms` }); } };
