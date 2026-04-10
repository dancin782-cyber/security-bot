require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
function getLogChannel(guild) {
  return guild.channels.cache.get(LOG_CHANNEL_ID);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== DATABASE======
mongoose.connect(process.env.MONGO_URI);

// ===== CONFIG =====
const owners = ["1137759529354940578"]; // replace with your ID
const whitelist = new Set();
const spamMap = new Map();
const joinMap = new Map();
const banMap = new Map();
const LOG_CHANNEL_ID = "1491837090965753977";
const { REST, Routes } = require("discord.js");
const slashCommands = require("./slashCommands");
const RoleBackup = require("./models/roleBackup");
const Warn = require("./models/warnModel");
const badWords = [
  "noob",
  "idiot",
  "stupid",
  "trash",
  "loser",
  "dumb",
  "shut up",
  "fuck u",
  "mtf",
  "sexy"
];

// ===== READY =====
client.on("ready", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: slashCommands.map(cmd => cmd.toJSON()) }
    );

    console.log("✅ Slash commands registered");
  } catch (err) {
    console.log(err);
  }
});

// ===== MESSAGE EVENT =====
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const userId = message.author.id;
  const isOwner = owners.includes(userId);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    return interaction.reply("🏓 Pong!");
  }

  if (interaction.commandName === "ban") {
    if (!owners.includes(interaction.user.id))
      return interaction.reply("❌ Not owner");

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason";

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply("User not found");

    await member.ban({ reason });

    interaction.reply(`🔨 Banned ${user.tag}`);
  }

  if (interaction.commandName === "kick") {
    if (!owners.includes(interaction.user.id))
      return interaction.reply("❌ Not owner");

    const user = interaction.options.getUser("user");

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply("User not found");

    await member.kick();

    interaction.reply(`👢 Kicked ${user.tag}`);
  }
});

  // ================= COMMANDS =================

// ================= ROLE GIVE =================
if (message.content.startsWith("!rolegive")) {
  if (!isOwner) return message.reply("❌ You are not owner");

  const member = message.mentions.members.first();
  const role = message.mentions.roles.first();

  if (!member || !role) return message.reply("❌ Mention user and role");

  if (!message.guild.members.me.permissions.has("ManageRoles"))
    return message.reply("❌ Missing permission");

  if (role.position >= message.guild.members.me.roles.highest.position)
    return message.reply("❌ Role is higher than bot");

  await member.roles.add(role);

  message.channel.send(`✅ Gave ${role.name} to ${member.user.tag}`);
}

// ================= ROLE REMOVE =================
if (message.content.startsWith("!roleremove")) {
  if (!isOwner) return message.reply("❌ You are not owner");

  const member = message.mentions.members.first();
  const role = message.mentions.roles.first();

  if (!member || !role) return message.reply("❌ Mention user and role");

  await member.roles.remove(role);

  message.channel.send(`❌ Removed ${role.name} from ${member.user.tag}`);
}

// ================= TEMP ROLE =================
if (message.content.startsWith("!temprole")) {
  if (!isOwner) return message.reply("❌ You are not owner");

  const args = message.content.split(" ");
  const member = message.mentions.members.first();
  const role = message.mentions.roles.first();
  const timeArg = args[3];

  if (!member || !role || !timeArg)
    return message.reply("❌ Usage: !temprole @user @role 10m");

  let duration;

  if (timeArg.endsWith("s")) duration = parseInt(timeArg) * 1000;
  else if (timeArg.endsWith("m")) duration = parseInt(timeArg) * 60 * 1000;
  else if (timeArg.endsWith("h")) duration = parseInt(timeArg) * 60 * 60 * 1000;
  else return message.reply("❌ Use s/m/h");

  await member.roles.add(role);

  message.channel.send(`⏳ Gave ${role.name} to ${member.user.tag} for ${timeArg}`);

  setTimeout(async () => {
    try {
      await member.roles.remove(role);
      message.channel.send(`⌛ Removed ${role.name} from ${member.user.tag}`);
    } catch (err) {}
  }, duration);
}

// ================= MUTE =================
if (message.content.startsWith("!mute")) {
  if (!isOwner) return message.reply("❌ You are not owner");

  const args = message.content.split(" ");
  const member = message.mentions.members.first();
  if (!member) return message.reply("❌ Mention a user");

  const timeArg = args[2];
  const reason = args.slice(3).join(" ") || "No reason";

  if (!timeArg) return message.reply("❌ Provide time (e.g. 10m)");

  let duration;

  if (timeArg.endsWith("s")) duration = parseInt(timeArg) * 1000;
  else if (timeArg.endsWith("m")) duration = parseInt(timeArg) * 60 * 1000;
  else if (timeArg.endsWith("h")) duration = parseInt(timeArg) * 60 * 60 * 1000;
  else return message.reply("❌ Use s/m/h (e.g. 10m)");

  if (!member.moderatable) return message.reply("❌ Cannot mute this user");

  await member.timeout(duration, reason);

  message.channel.send(`🔇 ${member.user.tag} muted for ${timeArg}. Reason: ${reason}`);
}

// ================= UNMUTE =================
if (message.content.startsWith("!unmute")) {
  if (!isOwner) return message.reply("❌ You are not owner");

  const member = message.mentions.members.first();
  if (!member) return message.reply("❌ Mention a user");

  await member.timeout(null);

  message.channel.send(`🔊 ${member.user.tag} has been unmuted.`);
}

// WARN COMMAND
if (message.content.startsWith("!warn")) {
  if (!isOwner) return message.reply("❌ You are not owner");

  const args = message.content.split(" ");
  const user = message.mentions.users.first();
  const reason = args.slice(2).join(" ") || "No reason";

  if (!user) return message.reply("❌ Mention a user");

  let data = await Warn.findOne({
    userId: user.id,
    guildId: message.guild.id
  });

  if (!data) {
    data = new Warn({
      userId: user.id,
      guildId: message.guild.id,
      warnings: []
    });
  }

  data.warnings.push({ reason });
  await data.save();

  message.channel.send(
    `⚠️ ${user.tag} has been warned. Total warnings: ${data.warnings.length}`
  );
}

// ================= KICK =================
if (message.content.startsWith("!kick")) {
  if (!isOwner) return message.reply("❌ You are not owner");

  const user = message.mentions.members.first();
  const reason = message.content.split(" ").slice(2).join(" ") || "No reason";

  if (!user) return message.reply("❌ Mention a user");
  if (!user.kickable) return message.reply("❌ Cannot kick this user");

  await user.kick(reason);

  message.channel.send(`👢 ${user.user.tag} has been kicked. Reason: ${reason}`);
}

// ================= BAN =================
if (message.content.startsWith("!ban")) {
  if (!isOwner) return message.reply("❌ You are not owner");

  const user = message.mentions.members.first();
  const reason = message.content.split(" ").slice(2).join(" ") || "No reason";

  if (!user) return message.reply("❌ Mention a user");
  if (!user.bannable) return message.reply("❌ Cannot ban this user");

  await user.ban({ reason });

  message.channel.send(`🔨 ${user.user.tag} has been banned. Reason: ${reason}`);
}

// VIEW WARNINGS
if (message.content.startsWith("!warnings")) {
  const user = message.mentions.users.first();
  if (!user) return message.reply("❌ Mention a user");

  const data = await Warn.findOne({
    userId: user.id,
    guildId: message.guild.id
  });

  if (!data || data.warnings.length === 0) {
    return message.channel.send(`✅ ${user.tag} has no warnings`);
  }

  let list = data.warnings
    .map((w, i) => `${i + 1}. ${w.reason}`)
    .join("\n");

  message.channel.send(`📊 Warnings for ${user.tag}:\n${list}`);
}

// CLEAR WARNINGS
if (message.content.startsWith("!clearwarn")) {
  if (!isOwner) return message.reply("❌ You are not owner");

  const user = message.mentions.users.first();
  if (!user) return message.reply("❌ Mention a user");

  await Warn.deleteOne({
    userId: user.id,
    guildId: message.guild.id
  });

  message.channel.send(`🗑️ Cleared warnings for ${user.tag}`);
}

  if (message.content.startsWith("!wl")) {
    if (!isOwner) return message.reply("❌ You are not owner");

    const user = message.mentions.users.first();
    if (!user) return message.reply("❌ Mention a user");

    whitelist.add(user.id);
    return message.channel.send(`✅ ${user.tag} added to whitelist`);
  }

  if (message.content.startsWith("!unwl")) {
    if (!isOwner) return message.reply("❌ You are not owner");

    const user = message.mentions.users.first();
    if (!user) return message.reply("❌ Mention a user");

    whitelist.delete(user.id);
    return message.channel.send(`❌ ${user.tag} removed from whitelist`);
  }

  if (message.content === "!ping") {
    return message.reply("🏓 Pong!");
  }

  // ================= WHITELIST BYPASS =================
  if (whitelist.has(userId) || isOwner) return;

// ================= WORD FILTER =================
const content = message.content.toLowerCase();

// basic bypass for small words
if (content.length > 3) {
  if (badWords.some(word => content.includes(word))) {
    try {
      await message.delete();

      if (message.member.moderatable) {
        await message.member.timeout(2 * 60 * 1000, "Bad language");
      }

      message.channel.send(`🚫 ${message.author}, inappropriate language is not allowed.`);
    } catch (err) {}
    return;
  }
}

// ================= MASS MENTION PROTECTION =================
if (message.mentions.users.size >= 5) {
  try {
    if (message.member.moderatable) {
      await message.member.timeout(5 * 60 * 1000, "Mass Mention Spam");
      message.channel.send(`🚫 ${message.author} got timed out for mass mentioning.`);
    }
  } catch (err) {}
  return;
}

  // ================= LINK FILTER =================
  const linkRegex = /(https?:\/\/|discord\.gg\/)/gi;

  if (linkRegex.test(message.content)) {
    try {
      await message.delete();
      await message.channel.send(`🚫 ${message.author}, links are not allowed.`);
    } catch (err) {}
    return;
  }

  // ================= CAPS FILTER =================
  const msg = message.content;

  if (msg.length > 5) {
    const upper = msg.replace(/[^A-Z]/g, "").length;
    const percent = upper / msg.length;

    if (percent >= 0.7) {
      try {
        if (message.member.moderatable) {
          await message.member.timeout(5 * 60 * 1000, "Excessive Caps");
          message.channel.send(`🚫 ${message.author} got timed out for caps.`);
        }
      } catch (err) {}
      return;
    }
  }

  // ================= ANTI-SPAM =================
  if (!spamMap.has(userId)) spamMap.set(userId, []);

  const timestamps = spamMap.get(userId);
  const now = Date.now();

  const filtered = timestamps.filter(time => now - time < 5000);
  filtered.push(now);

  spamMap.set(userId, filtered);

  if (filtered.length >= 5) {
    try {
      if (message.member.moderatable) {
        await message.member.timeout(5 * 60 * 1000, "Spamming");
        message.channel.send(`🚫 ${message.author} got timed out for spam.`);
      }
    } catch (err) {}

    spamMap.delete(userId);
    return;
  }
});

// ================= RAID MODE =================
client.on("guildMemberAdd", async (member) => {
  const guildId = member.guild.id;

  if (!joinMap.has(guildId)) {
    joinMap.set(guildId, []);
  }

  const now = Date.now();
  const joins = joinMap.get(guildId);

  // keep only last 30 sec joins
  const recent = joins.filter(time => now - time < 20000);

  recent.push(now);
  joinMap.set(guildId, recent);

  // RAID DETECT
  if (recent.length >= 20) {
    const channel = member.guild.systemChannel;

    if (channel) {
      channel.send("🚨 Raid detected! Too many users joining.");
    }

    // Optional: lock all channels (basic)
    member.guild.channels.cache.forEach(async (ch) => {
      try {
        await ch.permissionOverwrites.edit(member.guild.roles.everyone, {
          SendMessages: false
        });
      } catch (err) {}
    });
  }
});

// ================= ANTI-CHANNEL DELETE (RESTORE + PUNISH) =================
client.on("channelDelete", async (channel) => {
  try {
    // ===== RESTORE CHANNEL =====
    await channel.guild.channels.create({
      name: channel.name,
      type: channel.type,
      parent: channel.parent,
      position: channel.position
    });

    // ===== FETCH WHO DID IT =====
    const logs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: 12 // CHANNEL_DELETE
    });

    const entry = logs.entries.first();
    if (!entry) return;

    const { executor } = entry;
    if (!executor) return;

    // ignore bot itself
    if (executor.id === channel.client.user.id) return;

    const member = await channel.guild.members.fetch(executor.id);

    // ===== PUNISH =====
    if (member.bannable) {
      await member.ban({ reason: "Anti-Nuke: Channel Delete" });
    } else if (member.kickable) {
      await member.kick("Anti-Nuke: Channel Delete");
    }

    // ===== LOG =====
    const system = channel.guild.systemChannel;
    if (system) {
      system.send(`💣 ${executor.tag} punished for deleting channel. Channel restored.`);
    }

  } catch (err) {
    console.log(err);
  }
});

// ================= ADVANCED ANTI-ROLE DELETE =================
client.on("roleDelete", async (role) => {
  try {
    const data = await RoleBackup.findOne({
      roleId: role.id,
      guildId: role.guild.id
    });

    if (!data) return;

    // recreate role
    const newRole = await role.guild.roles.create({
      name: data.name,
      colors: [parseInt(data.color)],
      permissions: BigInt(data.permissions)
    });

    // restore members
    for (const memberId of data.members) {
      try {
        const member = await role.guild.members.fetch(memberId);
        await member.roles.add(newRole);
      } catch (err) {}
    }

    // punish executor
    const logs = await role.guild.fetchAuditLogs({
      limit: 1,
      type: 32
    });

    const entry = logs.entries.first();
    if (!entry) return;

    const { executor } = entry;
    if (!executor) return;

    const member = await role.guild.members.fetch(executor.id);

    if (member.bannable) {
      await member.ban({ reason: "Anti-Nuke: Role Delete" });
    }

    const system = role.guild.systemChannel;
    if (system) {
      system.send(`💣 ${executor.tag} banned. Role fully restored.`);
    }

  } catch (err) {
    console.log(err);
  }
});

// ================= ROLE BACKUP TRACK =================
client.on("ready", async () => {
  client.guilds.cache.forEach(async (guild) => {
    guild.roles.cache.forEach(async (role) => {
      if (role.managed) return;

      const members = role.members.map(m => m.id);

      await RoleBackup.findOneAndUpdate(
        { roleId: role.id, guildId: guild.id },
        {
          roleId: role.id,
          guildId: guild.id,
          members,
          name: role.name,
          color: role.color,
          permissions: role.permissions.bitfield.toString()
        },
        { upsert: true }
      );
    });
  });

  console.log("✅ Role backup initialized");
});

// ================= STRICT ANTI-BAN SPAM =================
client.on("guildBanAdd", async (ban) => {
  const guild = ban.guild;

  const logs = await guild.fetchAuditLogs({
    limit: 1,
    type: 22 // MEMBER_BAN_ADD
  });

  const entry = logs.entries.first();
  if (!entry) return;

  const { executor } = entry;
  if (!executor) return;

  const userId = executor.id;

  // ignore bot + owner
  if (userId === guild.client.user.id) return;
  if (owners.includes(userId)) return;

  if (!banMap.has(userId)) {
    banMap.set(userId, []);
  }

  const now = Date.now();
  const bans = banMap.get(userId);

  // keep only last 1 second
  const recent = bans.filter(time => now - time < 1000);
  recent.push(now);

  banMap.set(userId, recent);

  // 🚨 DETECT: 5 bans in 1 second
  if (recent.length >= 5) {
    try {
      const member = await guild.members.fetch(userId);

      if (member.bannable) {
        await member.ban({ reason: "💣 Anti-Nuke: Mass Ban Detected" });
      }

      const system = guild.systemChannel;
      if (system) {
        system.send(`💣 ${executor.tag} instantly banned for mass banning users!`);
      }

      banMap.delete(userId);
    } catch (err) {
      console.log(err);
    }
  }
});

client.on("messageDelete", async (message) => {
  if (!message.guild || message.author?.bot) return;

  const logChannel = getLogChannel(message.guild);
  if (!logChannel) return;

  logChannel.send(`🗑️ Message deleted from ${message.author.tag}: ${message.content}`);
});

client.on("messageUpdate", async (oldMsg, newMsg) => {
  if (!oldMsg.guild || oldMsg.author?.bot) return;

  const logChannel = getLogChannel(oldMsg.guild);
  if (!logChannel) return;

  logChannel.send(`✏️ Message edited by ${oldMsg.author.tag}\nBefore: ${oldMsg.content}\nAfter: ${newMsg.content}`);
});

client.on("guildBanAdd", async (ban) => {
  const logChannel = getLogChannel(ban.guild);
  if (!logChannel) return;

  logChannel.send(`🔨 User banned: ${ban.user.tag}`);
});

client.on("guildMemberRemove", async (member) => {
  const logs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: 20 // MEMBER_KICK
  });

  const entry = logs.entries.first();
  if (!entry) return;

  const { executor, target } = entry;

  if (target.id === member.id) {
    const logChannel = getLogChannel(member.guild);
    if (!logChannel) return;

    logChannel.send(`👢 ${member.user.tag} was kicked by ${executor.tag}`);
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
