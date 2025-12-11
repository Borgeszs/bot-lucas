const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('menuadmin').setDescription('Menu Admin').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const menu = new StringSelectMenuBuilder().setCustomId('menu_admin').setPlaceholder('Escolha').addOptions([
      { label: 'Moderação', description: 'Ban, kick, mute...', value: 'moderacao' },
      { label: 'Administração', description: 'Autorole, broadcast...', value: 'administracao' },
      { label: 'Inteligência', description: 'Tradução, auditoria...', value: 'inteligencia' }
    ]);
    const row = new ActionRowBuilder().addComponents(menu);
    await interaction.reply({ content: 'Menu Admin:', components: [row], ephemeral: true });
  }
};
