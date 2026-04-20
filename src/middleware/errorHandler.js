module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Server failure';

    res.status(statusCode).json({
        status: 'error',
        message
    });
};