const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '5m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '30m';
const CLI_LOGIN_EXCHANGE_TTL = '2m';

function generateAccessToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_TTL
    });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_TTL
    });
}

function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

function generateCliLoginExchangeToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: CLI_LOGIN_EXCHANGE_TTL
    });
}

function verifyCliLoginExchangeToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateCliLoginExchangeToken,
    verifyCliLoginExchangeToken
};