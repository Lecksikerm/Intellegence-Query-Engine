const { randomUUID } = require('crypto');
const { generateState, verifyState } = require('../utils/oauthState');
const { generateCodeChallenge } = require('../utils/pkce');
const authService = require('../services/auth.service');
const {
    generateCliLoginExchangeToken,
    verifyCliLoginExchangeToken
} = require('../utils/jwt');

function buildGithubAuthUrl(state, codeChallenge) {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
        scope: 'read:user user:email',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

function setSessionCookies(res, accessToken, refreshToken) {
    const isProd = process.env.NODE_ENV === 'production';
    const sameSite = isProd ? 'none' : 'lax';
    const csrfToken = randomUUID();

    res.cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite,
        secure: isProd,
        maxAge: 5 * 60 * 1000
    });

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite,
        secure: isProd,
        maxAge: 30 * 60 * 1000
    });

    res.cookie('csrf_token', csrfToken, {
        httpOnly: false,
        sameSite,
        secure: isProd,
        maxAge: 30 * 60 * 1000
    });

    return csrfToken;
}

function issueCsrfToken(res) {
    const isProd = process.env.NODE_ENV === 'production';
    const sameSite = isProd ? 'none' : 'lax';
    const csrfToken = randomUUID();

    res.cookie('csrf_token', csrfToken, {
        httpOnly: false,
        sameSite,
        secure: isProd,
        maxAge: 30 * 60 * 1000
    });

    return csrfToken;
}

function githubLogin(req, res) {
    const interfaceType = req.query.interface === 'cli' ? 'cli' : 'web';
    const codeVerifier = String(req.query.code_verifier || '').trim();
    const cliRedirectUri = String(req.query.cli_redirect_uri || '').trim();

    if (!codeVerifier) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing or empty parameter'
        });
    }

    if (interfaceType === 'cli' && !cliRedirectUri) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing or empty parameter'
        });
    }

    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState({
        interfaceType,
        codeVerifier,
        cliRedirectUri: interfaceType === 'cli' ? cliRedirectUri : undefined
    });
    const authorizeUrl = buildGithubAuthUrl(state, codeChallenge);

    if (req.query.redirect === 'false') {
        return res.status(200).json({
            status: 'success',
            data: {
                authorizeUrl,
                state
            }
        });
    }

    return res.redirect(authorizeUrl);
}

async function githubCallback(req, res, next) {
    try {
        const { code, state } = req.query;
        if (!code || !state) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid OAuth state'
            });
        }

        let oauthSession;
        try {
            oauthSession = verifyState(state);
        } catch (_error) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid OAuth state'
            });
        }

        const { user, accessToken, refreshToken } =
            await authService.loginWithGithubCode(code, oauthSession.codeVerifier);

        if (oauthSession.interfaceType === 'web') {
            setSessionCookies(res, accessToken, refreshToken);
            const redirectBase = process.env.WEB_PORTAL_URL || 'http://localhost:5173';
            return res.redirect(`${redirectBase}/auth/success`);
        }

        const requestToken = generateCliLoginExchangeToken({
            user,
            accessToken,
            refreshToken
        });

        return res.redirect(
            `${oauthSession.cliRedirectUri}?request_token=${encodeURIComponent(requestToken)}&request_id=${encodeURIComponent(requestToken)}`
        );
    } catch (error) {
        next(error);
    }
}

async function completeCliLogin(req, res) {
    const requestToken =
        req.body?.request_token ||
        req.body?.requestToken ||
        req.body?.request_id;

    if (!requestToken) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing or empty parameter'
        });
    }

    let completion;
    try {
        completion = verifyCliLoginExchangeToken(requestToken);
    } catch (_error) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired login request'
        });
    }

    return res.status(200).json({
        status: 'success',
        data: completion
    });
}

async function refreshToken(req, res, next) {
    try {
        const incomingRefreshToken =
            req.body?.refreshToken || req.cookies?.refresh_token;

        if (!incomingRefreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing or empty parameter'
            });
        }

        const tokens = await authService.refreshSession(incomingRefreshToken);
        const csrfToken = setSessionCookies(res, tokens.accessToken, tokens.refreshToken);

        return res.status(200).json({
            status: 'success',
            data: {
                ...tokens,
                csrfToken
            }
        });
    } catch (error) {
        next(error);
    }
}

function logout(req, res) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('csrf_token');
    return res.status(200).json({
        status: 'success',
        message: 'Logged out'
    });
}

function me(req, res) {
    return res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
}

function csrfToken(req, res) {
    const csrf = issueCsrfToken(res);
    return res.status(200).json({
        status: 'success',
        data: {
            csrfToken: csrf
        }
    });
}

module.exports = {
    githubLogin,
    githubCallback,
    completeCliLogin,
    refreshToken,
    logout,
    me,
    csrfToken
};