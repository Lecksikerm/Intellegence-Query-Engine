const { verifyAccessToken } = require('../utils/jwt');

function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.access_token;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (cookieToken) {
            token = cookieToken;
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        const decoded = verifyAccessToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized'
        });
    }
}

function requireRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Forbidden'
            });
        }

        next();
    };
}

module.exports = {
    protect,
    requireRoles
};