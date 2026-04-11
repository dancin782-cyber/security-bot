const Whitelist = require('../models/Whitelist');

module.exports = {
    name: "wl",
    async execute(message, args) {

        const user = message.mentions.users.first();
        if (!user) return message.reply("❌ Mention user");

        let data = await Whitelist.findOne({ userId: user.id });

        if (!data) {
            data = await Whitelist.create({ userId: user.id });
        }

        // ENABLE ALL FEATURES
        data.features = {
            ban: true,
            kick: true,
            roleDelete: true,
            roleCreate: true,
            channelDelete: true,
            channelCreate: true,
            webhook: true,
            mention: true,
            emoji: true,
            link: true,
            spam: true
        };

        await data.save();

        message.reply(`✅ ${user.tag} is now FULLY WHITELISTED`);
    }
};
