const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
    userId: String,
    features: {
        mention: { type: Boolean, default: false },
        webhook: { type: Boolean, default: false },
        backup: { type: Boolean, default: false },
        security: { type: Boolean, default: false }
    },
    fullAccess: { type: Boolean, default: false }
});

module.exports = mongoose.model('Whitelist', whitelistSchema);
