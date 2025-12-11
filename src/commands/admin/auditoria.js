module.exports = {
  data: { name: 'placeholder' },
  async execute(interaction) {
    await interaction.reply({ content: 'Placeholder — implementar', ephemeral: true });
  }
};
