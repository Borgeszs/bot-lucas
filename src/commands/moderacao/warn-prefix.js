const db = require('../../utils/database');
const modUtils = require('../../utils/moderation');
const WARN_THRESHOLDS = { 2:{action:'mute', days:1}, 3:{action:'mute', days:2}, 4:{action:'ban'} };

module.exports = {
  name: 'warn',
  async executeMessage(message, args) {
    if (!message.member.permissions.has('ModerateMembers') && !message.member.permissions.has('BanMembers')) return message.reply('Sem permissão.');
    if (!args[0]) return message.reply('Uso: !warn add @user motivo OR !warn list @user');
    const sub = args[0].toLowerCase();
    const dbConn = await require('../../utils/database').connect();
    const warns = dbConn.collection('warns');

    if (sub === 'list') {
      const mention = args[1]; if (!mention) return message.reply('Use: !warn list @user'); const id = mention.replace(/[<@!>]/g,'');
      const doc = await warns.findOne({ guildId: message.guild.id, userId: id });
      if (!doc || !doc.history || doc.history.length===0) return message.reply('Sem warns.');
      const lines = doc.history.map((h,i)=>`#${i+1} — ${new Date(h.at).toLocaleString()} — por <@${h.moderator}> — ${h.reason}`).reverse().join('\\n');
      return message.channel.send(`Warns de <@${id}> (total ${doc.count}):\\n${lines}`);
    }

    // add
    const mention = args[1]; if (!mention) return message.reply('Marque um usuário.');
    const id = mention.replace(/[<@!>]/g,''); const reason = args.slice(2).join(' ') || 'Sem motivo';
    const now = Date.now(); const key = { guildId: message.guild.id, userId: id };
    const res = await warns.findOneAndUpdate(key, { $inc:{count:1}, $push:{ history:{ at:now, moderator: message.author.id, reason } }, $setOnInsert:{ guildId: message.guild.id, userId: id } }, { upsert:true, returnDocument:'after' });
    const count = res.value?.count || 1;
    await message.channel.send(`<@${id}> recebeu warn #${count}. Motivo: ${reason}`);

    if (WARN_THRESHOLDS[count]) {
      const rule = WARN_THRESHOLDS[count];
      if (rule.action === 'mute') {
        const ms = rule.days * 24 * 60 * 60 * 1000;
        try { const unmuteAt = await modUtils.applyMuteRole(message.guild, id, ms, `Warn auto #${count}`); message.channel.send(`<@${id}> mutado por ${rule.days} dia(s).`); } catch(e){ console.error(e); message.channel.send('Falha ao aplicar mute.'); }
      } else if (rule.action === 'ban') {
        try { const member = await message.guild.members.fetch(id).catch(()=>null); if (member) { await member.ban({ reason:`Warn auto #${count}` }); message.channel.send(`<@${id}> banido automaticamente.`); } } catch(e){ console.error(e); message.channel.send('Falha ao banir.'); }
      }
    }
  }
};
