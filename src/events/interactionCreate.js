module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isCommand()) {
      const cmd = interaction.client.commands.get(interaction.commandName);
      if (!cmd) return;
      try { await cmd.execute(interaction); } catch(e){ console.error(e); if(!interaction.replied) interaction.reply({content:'Erro', ephemeral:true}); }
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'menu_membros') {
        const v = interaction.values[0];
        if (v === 'diversao') return interaction.update({ content: 'Diversão: coinflip, memes, gifs, rpg, musica', components: [] });
        if (v === 'utilidade') return interaction.update({ content: 'Utilidade: ticket, enquetes, pesquisa...', components: [] });
      } else if (interaction.customId === 'menu_admin') {
        const v = interaction.values[0];
        if (v === 'moderacao') return interaction.update({ content: 'Moderação: ban, kick, mute, clear', components: [] });
        if (v === 'administracao') return interaction.update({ content: 'Administração: autorole, painel, broadcast', components: [] });
      }
    }
  }
};
