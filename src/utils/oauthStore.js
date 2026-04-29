const { randomUUID } = require('crypto');

const oauthSessions = new Map();
const cliCompletions = new Map();
const TEN_MINUTES_MS = 10 * 60 * 1000;

function saveOauthSession({
    state,
    codeVerifier,
    interfaceType,
    cliRedirectUri
}) {
    oauthSessions.set(state, {
        codeVerifier,
        interfaceType,
        cliRedirectUri,
        expiresAt: Date.now() + TEN_MINUTES_MS
    });
}

function consumeOauthSession(state) {
    const session = oauthSessions.get(state);
    oauthSessions.delete(state);

    if (!session || session.expiresAt < Date.now()) {
        return null;
    }

    return session;
}

function createCliCompletion(payload) {
    const requestId = randomUUID();

    cliCompletions.set(requestId, {
        ...payload,
        expiresAt: Date.now() + TEN_MINUTES_MS
    });

    return requestId;
}

function consumeCliCompletion(requestId) {
    const completion = cliCompletions.get(requestId);
    cliCompletions.delete(requestId);

    if (!completion || completion.expiresAt < Date.now()) {
        return null;
    }

    return completion;
}

module.exports = {
    saveOauthSession,
    consumeOauthSession,
    createCliCompletion,
    consumeCliCompletion
};
