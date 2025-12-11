require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

if (!process.env.TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
  console.error('Set TOKEN, CLIENT_ID and GUILD_ID in .env');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
for (const folder of fs.readdirSync(commandsPath)) {
  for (const file of fs.readdirSync(path.join(commandsPath, folder)).filter(f => f.endsWith('.js'))) {
    const cmd = require(path.join(commandsPath, folder, file));
    if (cmd && cmd.data) commands.push(cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log('Registering commands to guild:', process.env.GUILD_ID);
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
    console.log('Commands registered.');
  } catch (err) {
    console.error(err);
  }
})();
