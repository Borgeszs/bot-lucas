module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`${client.user.tag} está online!`);
    try {
      const mod = require('../utils/moderation');
      await mod.scheduleUnmutes(client);
      console.log('Scheduled unmutes.');
    } catch(e){ console.error('Schedule error', e); }
  }
};
