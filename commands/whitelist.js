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
                    emoji: false
                }
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("⚙️ Whitelist Panel")
            .setDescription(`Manage whitelist for <@${user.id}>`)
            .setColor("Blue");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`toggle_mention_${user.id}`)
                .setLabel("Mention")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(`toggle_link_${user.id}`)
                .setLabel("Links")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(`toggle_spam_${user.id}`)
                .setLabel("Spam")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(`toggle_emoji_${user.id}`)
                .setLabel("Emoji")
                .setStyle(ButtonStyle.Primary)
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
};
