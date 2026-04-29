const crypto = require('crypto');

function base64UrlEncode(buffer) {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function generateCodeVerifier() {
    return base64UrlEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(codeVerifier) {
    return base64UrlEncode(
        crypto.createHash('sha256').update(codeVerifier).digest()
    );
}

module.exports = {
    generateCodeVerifier,
    generateCodeChallenge
};