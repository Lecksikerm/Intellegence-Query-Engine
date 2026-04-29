const crypto = require('crypto');

function generateState() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    generateState
};