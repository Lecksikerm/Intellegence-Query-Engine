const profileService = require('../services/profile.service');

async function getProfiles(req, res, next) {
    try {
        const rawPage = req.query.page ?? '1';
        const rawLimit = req.query.limit ?? '10';

        if (rawPage === '' || rawLimit === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Missing or empty parameter'
            });
        }

        const page = Number(rawPage);
        const limit = Number(rawLimit);

        if (!Number.isInteger(page) || page < 1) {
            return res.status(422).json({
                status: 'error',
                message: 'Invalid query parameters'
            });
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
            return res.status(422).json({
                status: 'error',
                message: 'Invalid query parameters'
            });
        }

        const result = await profileService.getProfiles({ page, limit });

        return res.status(200).json({
            status: 'success',
            page: result.page,
            limit: result.limit,
            total: result.total,
            data: result.data
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProfiles
};