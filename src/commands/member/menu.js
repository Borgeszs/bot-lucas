const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('menu').setDescription('Menu de membros: Diversão e Utilidade'),
  async execute(interaction) {
    const menu = new StringSelectMenuBuilder().setCustomId('menu_membros').setPlaceholder('Escolha').addOptions([
      { label: 'Diversão', description: 'Jogos, memes e música', value: 'diversao' },
      { label: 'Utilidade', description: 'Tickets, pesquisas, lembretes', value: 'utilidade' }
    ]);
    const row = new ActionRowBuilder().addComponents(menu);
    await interaction.reply({ content: 'Selecione uma categoria:', components: [row], ephemeral: true });
  }
};
