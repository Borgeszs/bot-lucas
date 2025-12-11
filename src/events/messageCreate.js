module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    const prefix = process.env.PREFIX || '!';
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmdName = args.shift().toLowerCase();
    const cmd = message.client.commands.get(cmdName);
    if (!cmd) return;
    try {
      if (cmd.executeMessage) return cmd.executeMessage(message, args);
      if (cmd.run) return cmd.run(message.client, message, args);
      message.reply('Comando disponível apenas via slash por enquanto.');
    } catch(e){ console.error('prefix command error', e); message.reply('Erro ao executar comando.'); }
  }
};
