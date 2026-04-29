const axios = require('axios');
const prisma = require('../config/prisma');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require('../utils/jwt');

async function exchangeCodeForGithubToken(code, codeVerifier) {
    const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GITHUB_CALLBACK_URL,
            code_verifier: codeVerifier
        },
        {
            headers: {
                Accept: 'application/json'
            }
        }
    );

    if (!response.data.access_token) {
        throw new Error('Failed to exchange GitHub code');
    }

    return response.data.access_token;
}

async function getGithubUser(githubAccessToken) {
    const response = await axios.get('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${githubAccessToken}`,
            Accept: 'application/vnd.github+json'
        }
    });

    return response.data;
}

async function getGithubPrimaryEmail(githubAccessToken) {
    const response = await axios.get('https://api.github.com/user/emails', {
        headers: {
            Authorization: `Bearer ${githubAccessToken}`,
            Accept: 'application/vnd.github+json'
        }
    });

    const primaryEmail = response.data.find(
        (email) => email.primary && email.verified
    );

    return primaryEmail ? primaryEmail.email : null;
}

async function findOrCreateGithubUser(githubProfile, email) {
    const githubId = String(githubProfile.id);

    let user = await prisma.user.findUnique({
        where: {
            github_id: githubId
        }
    });

    if (user) {
        return user;
    }

    return prisma.user.create({
        data: {
            github_id: githubId,
            email,
            name: githubProfile.name || githubProfile.login,
            avatar_url: githubProfile.avatar_url,
            role: 'analyst'
        }
    });
}

async function createSessionTokens(user) {
    const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
    });

    const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            user_id: user.id,
            expires_at: expiresAt
        }
    });

    return {
        accessToken,
        refreshToken
    };
}

async function loginWithGithubCode(code, codeVerifier) {
    const githubAccessToken = await exchangeCodeForGithubToken(
        code,
        codeVerifier
    );

    const githubProfile = await getGithubUser(githubAccessToken);

    let email = githubProfile.email;

    if (!email) {
        email = await getGithubPrimaryEmail(githubAccessToken);
    }

    if (!email) {
        throw new Error('GitHub email is required');
    }

    const user = await findOrCreateGithubUser(githubProfile, email);
    const tokens = await createSessionTokens(user);

    return {
        user,
        ...tokens
    };
}

async function refreshSession(refreshToken) {
    let decoded;

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        const err = new Error('Invalid refresh token');
        err.statusCode = 401;
        throw err;
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
    });

    if (!storedToken || storedToken.expires_at < new Date()) {
        const err = new Error('Invalid refresh token');
        err.statusCode = 401;
        throw err;
    }

    await prisma.refreshToken.delete({
        where: { token: refreshToken }
    });

    const tokens = await createSessionTokens(storedToken.user);

    return {
        user: {
            id: storedToken.user.id,
            email: storedToken.user.email,
            name: storedToken.user.name,
            role: storedToken.user.role,
            avatar_url: storedToken.user.avatar_url
        },
        ...tokens
    };
}

module.exports = {
    loginWithGithubCode,
    refreshSession
};