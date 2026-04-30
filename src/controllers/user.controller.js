function getCurrentUser(req, res) {
    return res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
}

module.exports = {
    getCurrentUser
};
