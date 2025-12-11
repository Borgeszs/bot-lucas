require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();

// carregar comandos
const commandsPath = path.join(__dirname, 'commands');
for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(folderPath, file));
    // suporte para cmd.data (slash) ou cmd.name (prefix)
    const key = (cmd.data && cmd.data.name) ? cmd.data.name : (cmd.name || file.replace('.js',''));
    client.commands.set(key, cmd);
  }
}

// carregar eventos
const eventsPath = path.join(__dirname, 'events');
for (const f of fs.readdirSync(eventsPath).filter(x => x.endsWith('.js'))) {
  const e = require(path.join(eventsPath, f));
  if (e.once) client.once(e.name, (...args) => e.execute(...args, client));
  else client.on(e.name, (...args) => e.execute(...args, client));
}

// safe handlers
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

if (!process.env.TOKEN) {
  console.error('Missing TOKEN in .env — copy .env.example to .env and fill values');
  process.exit(1);
}
client.login(process.env.TOKEN);
