const Whitelist = require('../models/Whitelist');

module.exports = {
    name: 'wl',
    async execute(message, args) {

        const user = message.mentions.users.first();
        if (!user) return message.reply("Mention user");

        let data = await Whitelist.findOne({ userId: user.id });

        if (!data) {
            data = new Whitelist({ userId: user.id });
        }

        data.fullAccess = true;

        data.features = {
            mention: true,
            webhook: true,
            backup: true,
            security: true
        };

        await data.save();

        message.reply(`${user} now has FULL whitelist`);
    }
};
