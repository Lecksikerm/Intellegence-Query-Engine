const { generateState } = require('../utils/oauthState');
const {
    generateCodeVerifier,
    generateCodeChallenge
} = require('../utils/pkce');
const authService = require('../services/auth.service');

function githubLogin(req, res) {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    res.cookie('github_oauth_state', state, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000
    });

    res.cookie('github_pkce_verifier', codeVerifier, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000
    });

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
        scope: 'read:user user:email',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });

    return res.redirect(
        `https://github.com/login/oauth/authorize?${params.toString()}`
    );
}

async function githubCallback(req, res, next) {
    try {
        const { code, state } = req.query;
        const storedState = req.cookies.github_oauth_state;
        const codeVerifier = req.cookies.github_pkce_verifier;

        if (!code || !state || !storedState || state !== storedState) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid OAuth state'
            });
        }

        if (!codeVerifier) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing PKCE verifier'
            });
        }

        res.clearCookie('github_oauth_state');
        res.clearCookie('github_pkce_verifier');

        const { user, accessToken, refreshToken } =
            await authService.loginWithGithubCode(code, codeVerifier);

        return res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar_url: user.avatar_url
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
}

async function refreshToken(req, res, next) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing or empty parameter'
            });
        }

        const tokens = await authService.refreshSession(refreshToken);

        return res.status(200).json({
            status: 'success',
            data: tokens
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    githubLogin,
    githubCallback,
    refreshToken
};