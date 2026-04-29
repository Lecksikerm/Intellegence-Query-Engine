const { generateState } = require('../utils/oauthState');
const authService = require('../services/auth.service');

function githubLogin(req, res) {
    const state = generateState();

    res.cookie('github_oauth_state', state, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000
    });

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
        scope: 'read:user user:email',
        state
    });

    return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

async function githubCallback(req, res, next) {
    try {
        const { code, state } = req.query;
        const storedState = req.cookies.github_oauth_state;

        if (!code || !state || !storedState || state !== storedState) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid OAuth state'
            });
        }

        res.clearCookie('github_oauth_state');

        const { user, accessToken, refreshToken } =
            await authService.loginWithGithubCode(code);

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

module.exports = {
    githubLogin,
    githubCallback
};