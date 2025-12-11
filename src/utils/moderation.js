const db = require('./database');
const MUTE_ROLE_NAME = 'Muted';

async function ensureMuteRole(guild) {
  let role = guild.roles.cache.find(r => r.name === MUTE_ROLE_NAME);
  if (!role) {
    role = await guild.roles.create({ name: MUTE_ROLE_NAME, color: 'GREY', reason: 'Created by Bot Lucas' });
  }
  for (const [, channel] of guild.channels.cache) {
    try {
      await channel.permissionOverwrites.edit(role, {
        SendMessages: false,
        AddReactions: false,
        Connect: false,
        Speak: false,
        SendMessagesInThreads: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false
      }).catch(()=>{});
    } catch(e){}
  }
  return role;
}

async function applyMuteRole(guild, userId, durationMs, reason='Auto mute') {
  const member = await guild.members.fetch(userId).catch(()=>null);
  if (!member) throw new Error('Member not found');
  const role = await ensureMuteRole(guild);
  await member.roles.add(role, reason);
  const dbConn = await db.connect();
  const mutes = dbConn.collection('mutes');
  const unmuteAt = Date.now() + durationMs;
  await mutes.updateOne({ guildId: guild.id, userId }, { $set: { guildId: guild.id, userId, unmuteAt, reason } }, { upsert: true });
  return unmuteAt;
}

async function removeMuteRole(guild, userId) {
  const member = await guild.members.fetch(userId).catch(()=>null);
  if (!member) return false;
  const role = guild.roles.cache.find(r => r.name === MUTE_ROLE_NAME);
  if (!role) return false;
  await member.roles.remove(role, 'Auto unmute').catch(()=>{});
  const dbConn = await db.connect();
  await dbConn.collection('mutes').deleteOne({ guildId: guild.id, userId }).catch(()=>{});
  return true;
}

async function scheduleUnmutes(client) {
  const dbConn = await db.connect();
  const rows = await dbConn.collection('mutes').find({}).toArray().catch(()=>[]);
  for (const row of rows) {
    const delay = row.unmuteAt - Date.now();
    if (delay <= 0) {
      const g = client.guilds.cache.get(row.guildId) || await client.guilds.fetch(row.guildId).catch(()=>null);
      if (g) await removeMuteRole(g, row.userId).catch(()=>{});
      continue;
    }
    setTimeout(async ()=> {
      const g = client.guilds.cache.get(row.guildId) || await client.guilds.fetch(row.guildId).catch(()=>null);
      if (g) await removeMuteRole(g, row.userId).catch(()=>{});
    }, delay);
  }
}

module.exports = { ensureMuteRole, applyMuteRole, removeMuteRole, scheduleUnmutes };
