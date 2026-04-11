const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Whitelist = require('../models/Whitelist');

module.exports = {
    name: "whitelist",
    async execute(message, args) {

        const user = message.mentions.users.first();
        if (!user) return message.reply("❌ Mention a user");

        let data = await Whitelist.findOne({ userId: user.id });

        if (!data) {
            data = await Whitelist.create({
                userId: user.id,
                features: {
                    mention: false,
                    link: false,
                    spam: false,
                    emoji: false,

                    ban: false,
                    kick: false,
                    prune: false,
                    botAdd: false,
                    serverUpdate: false,
                    memberUpdate: false,
                    roleUpdate: false,
                    channelCreate: false,
                    channelDelete: false,
                    channelUpdate: false,
                    roleCreate: false,
                    roleDelete: false,
                    webhookCreate: false,
                    webhookDelete: false,
                    webhookUpdate: false,
                    sticker: false
                }
            });
        }

        const f = data.features;

        const embed = new EmbedBuilder()
            .setTitle("⚙️ Advanced Whitelist Panel")
            .setDescription(`Managing: <@${user.id}>\n\n` +
                `Ban: ${f.ban ? "✅" : "❌"} | Kick: ${f.kick ? "✅" : "❌"} | Prune: ${f.prune ? "✅" : "❌"}\n` +
                `Bot Add: ${f.botAdd ? "✅" : "❌"} | Server: ${f.serverUpdate ? "✅" : "❌"}\n` +
                `Channel C/D/U: ${f.channelCreate?"✅":"❌"}/${f.channelDelete?"✅":"❌"}/${f.channelUpdate?"✅":"❌"}\n` +
                `Role C/D/U: ${f.roleCreate?"✅":"❌"}/${f.roleDelete?"✅":"❌"}/${f.roleUpdate?"✅":"❌"}\n` +
                `Webhook C/D/U: ${f.webhookCreate?"✅":"❌"}/${f.webhookDelete?"✅":"❌"}/${f.webhookUpdate?"✅":"❌"}\n` +
                `Mention: ${f.mention?"✅":"❌"} | Emoji: ${f.emoji?"✅":"❌"} | Sticker: ${f.sticker?"✅":"❌"}`
            )
            .setColor("Blue");

        // 🔥 ROW 1
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`toggle_ban_${user.id}`).setLabel("Ban").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_kick_${user.id}`).setLabel("Kick").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_prune_${user.id}`).setLabel("Prune").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_botAdd_${user.id}`).setLabel("Bot Add").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_serverUpdate_${user.id}`).setLabel("Server").setStyle(ButtonStyle.Primary)
        );

        // 🔥 ROW 2
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`toggle_channelCreate_${user.id}`).setLabel("Ch Create").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_channelDelete_${user.id}`).setLabel("Ch Delete").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_channelUpdate_${user.id}`).setLabel("Ch Update").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_roleCreate_${user.id}`).setLabel("Role Create").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_roleDelete_${user.id}`).setLabel("Role Delete").setStyle(ButtonStyle.Primary)
        );

        // 🔥 ROW 3
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`toggle_roleUpdate_${user.id}`).setLabel("Role Update").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_webhookCreate_${user.id}`).setLabel("Webhook C").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_webhookDelete_${user.id}`).setLabel("Webhook D").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_webhookUpdate_${user.id}`).setLabel("Webhook U").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_mention_${user.id}`).setLabel("@everyone").setStyle(ButtonStyle.Primary)
        );

        // 🔥 ROW 4
        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`toggle_emoji_${user.id}`).setLabel("Emoji").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`toggle_sticker_${user.id}`).setLabel("Sticker").setStyle(ButtonStyle.Primary)
        );

        message.channel.send({
            embeds: [embed],
            components: [row1, row2, row3, row4]
        });
    }
};
