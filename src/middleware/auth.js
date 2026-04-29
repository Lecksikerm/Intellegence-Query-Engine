const { verifyAccessToken } = require('../utils/jwt');

function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        const token = authHeader.split(' ')[1];

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

function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
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
    requireRole
};