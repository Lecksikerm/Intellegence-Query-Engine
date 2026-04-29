const axios = require('axios');
const prisma = require('../config/prisma');
const {
    generateAccessToken,
    generateRefreshToken
} = require('../utils/jwt');

async function exchangeCodeForGithubToken(code) {
    const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GITHUB_CALLBACK_URL
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

    if (primaryEmail) {
        return primaryEmail.email;
    }

    return null;
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

    user = await prisma.user.create({
        data: {
            github_id: githubId,
            email,
            name: githubProfile.name || githubProfile.login,
            avatar_url: githubProfile.avatar_url,
            role: 'analyst'
        }
    });

    return user;
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

async function loginWithGithubCode(code) {
    const githubAccessToken = await exchangeCodeForGithubToken(code);
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

module.exports = {
    loginWithGithubCode
};