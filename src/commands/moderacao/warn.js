const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');
const modUtils = require('../../utils/moderation');

const WARN_THRESHOLDS = { 2:{action:'mute', days:1}, 3:{action:'mute', days:2}, 4:{action:'ban'} };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Gerencia warns (add/list)')
    .addSubcommand(s=>s.setName('add').setDescription('Adiciona warn').addUserOption(o=>o.setName('user').setDescription('Usuário').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Motivo')))
    .addSubcommand(s=>s.setName('list').setDescription('Lista warns').addUserOption(o=>o.setName('user').setDescription('Usuário').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild;
    const dbConn = await db.connect();
    const warns = dbConn.collection('warns');

    if (sub === 'add') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'Sem motivo';
      const now = Date.now();
      const key = { guildId: guild.id, userId: user.id };
      const res = await warns.findOneAndUpdate(key, { $inc:{count:1}, $push:{history:{at:now, moderator: interaction.user.id, reason}}, $setOnInsert:{guildId:guild.id, userId:user.id} }, { upsert:true, returnDocument:'after' });
      const count = res.value?.count || 1;
      await interaction.reply({ content: `${user.tag} recebeu warn #${count}. Motivo: ${reason}` });

      if (WARN_THRESHOLDS[count]) {
        const rule = WARN_THRESHOLDS[count];
        if (rule.action === 'mute') {
          const ms = rule.days * 24 * 60 * 60 * 1000;
          try {
            const unmuteAt = await modUtils.applyMuteRole(guild, user.id, ms, `Warn auto #${count}`);
            await interaction.followUp({ content: `${user.tag} mutado por ${rule.days} dia(s). Unmute em ${new Date(unmuteAt).toLocaleString()}` });
          } catch(e){ console.error(e); await interaction.followUp({ content:'Falha ao aplicar mute.', ephemeral:true }); }
        } else if (rule.action === 'ban') {
          try { const member = await guild.members.fetch(user.id).catch(()=>null); if (member) { await member.ban({ reason:`Warn auto #${count}` }); await interaction.followUp({ content:`${user.tag} banido automaticamente.` }); } } catch(e){ console.error(e); await interaction.followUp({ content:'Falha ao banir.', ephemeral:true }); }
        }
      }
      return;
    }

    if (sub === 'list') {
      const user = interaction.options.getUser('user');
      const doc = await warns.findOne({ guildId: guild.id, userId: user.id });
      if (!doc || !doc.history || doc.history.length === 0) return interaction.reply({ content:`${user.tag} não tem warns.`, ephemeral:true });
      const lines = doc.history.map((h,i)=>`#${i+1} — ${new Date(h.at).toLocaleString()} — por <@${h.moderator}> — ${h.reason}`).reverse().join('\\n');
      return interaction.reply({ content:`Warns de ${user.tag} (total ${doc.count}):\\n\\n${lines}` });
    }
  }
};
