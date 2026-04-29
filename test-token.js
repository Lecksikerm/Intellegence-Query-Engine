require('dotenv').config();
const { generateAccessToken } = require('./src/utils/jwt');

const token = generateAccessToken({
    id: '123',
    role: 'analyst'
});

console.log(token);