const jwt = require('jsonwebtoken');
const OAUTH_STATE_SECRET = process.env.ACCESS_TOKEN_SECRET;

function generateState(payload) {
    return jwt.sign(payload, OAUTH_STATE_SECRET, {
        expiresIn: '10m'
    });
}

function verifyState(state) {
    return jwt.verify(state, OAUTH_STATE_SECRET);
}

module.exports = {
    generateState,
    verifyState
};