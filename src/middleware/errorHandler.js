module.exports = (err, req, res, next) => {
    console.error('ERROR:', err);

    const statusCode = err.statusCode || 500;
    const message =
        process.env.NODE_ENV === 'production'
            ? (err.statusCode ? err.message : 'Server failure')
            : (err.message || 'Server failure');

    res.status(statusCode).json({
        status: 'error',
        message
    });
};