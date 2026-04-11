const { EmbedBuilder } = require('discord.js');
const Whitelist = require('../models/Whitelist');

module.exports = {
    name: 'whitelist',
    async execute(message, args) {

        const user = message.mentions.users.first();
        if (!user) return message.reply("Mention a user");

        let data = await Whitelist.findOne({ userId: user.id });

        if (!data) {
            data = new Whitelist({ userId: user.id });
            await data.save();
        }

        const embed = new EmbedBuilder()
            .setTitle("Whitelist Panel")
            .setDescription(`Manage whitelist for ${user}`)
            .addFields(
                { name: "Mention", value: data.features.mention ? "✅" : "❌", inline: true },
                { name: "Webhook", value: data.features.webhook ? "✅" : "❌", inline: true },
                { name: "Backup", value: data.features.backup ? "✅" : "❌", inline: true },
                { name: "Security", value: data.features.security ? "✅" : "❌", inline: true }
            );

        message.channel.send({ embeds: [embed] });
    }
};
