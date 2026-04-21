const profileService = require('../services/profile.service');
const {
    ALLOWED_GENDERS,
    ALLOWED_AGE_GROUPS
} = require('../utils/profileFields');

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

        const filters = {};

        if (req.query.gender !== undefined) {
            if (req.query.gender === '') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing or empty parameter'
                });
            }

            const gender = String(req.query.gender).toLowerCase();

            if (!ALLOWED_GENDERS.includes(gender)) {
                return res.status(422).json({
                    status: 'error',
                    message: 'Invalid query parameters'
                });
            }

            filters.gender = gender;
        }

        if (req.query.age_group !== undefined) {
            if (req.query.age_group === '') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing or empty parameter'
                });
            }

            const ageGroup = String(req.query.age_group).toLowerCase();

            if (!ALLOWED_AGE_GROUPS.includes(ageGroup)) {
                return res.status(422).json({
                    status: 'error',
                    message: 'Invalid query parameters'
                });
            }

            filters.age_group = ageGroup;
        }

        if (req.query.country_id !== undefined) {
            if (req.query.country_id === '') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing or empty parameter'
                });
            }

            const countryId = String(req.query.country_id).toUpperCase();

            if (countryId.length !== 2) {
                return res.status(422).json({
                    status: 'error',
                    message: 'Invalid query parameters'
                });
            }

            filters.country_id = countryId;
        }

        if (req.query.min_age !== undefined) {
            if (req.query.min_age === '') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing or empty parameter'
                });
            }

            const minAge = Number(req.query.min_age);

            if (!Number.isInteger(minAge) || minAge < 0) {
                return res.status(422).json({
                    status: 'error',
                    message: 'Invalid query parameters'
                });
            }

            filters.min_age = minAge;
        }

        if (req.query.max_age !== undefined) {
            if (req.query.max_age === '') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing or empty parameter'
                });
            }

            const maxAge = Number(req.query.max_age);

            if (!Number.isInteger(maxAge) || maxAge < 0) {
                return res.status(422).json({
                    status: 'error',
                    message: 'Invalid query parameters'
                });
            }

            filters.max_age = maxAge;
        }

        if (
            filters.min_age !== undefined &&
            filters.max_age !== undefined &&
            filters.min_age > filters.max_age
        ) {
            return res.status(422).json({
                status: 'error',
                message: 'Invalid query parameters'
            });
        }

        if (req.query.min_gender_probability !== undefined) {
            if (req.query.min_gender_probability === '') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing or empty parameter'
                });
            }

            const minGenderProbability = Number(
                req.query.min_gender_probability
            );

            if (
                !Number.isFinite(minGenderProbability) ||
                minGenderProbability < 0 ||
                minGenderProbability > 1
            ) {
                return res.status(422).json({
                    status: 'error',
                    message: 'Invalid query parameters'
                });
            }

            filters.min_gender_probability = minGenderProbability;
        }

        if (req.query.min_country_probability !== undefined) {
            if (req.query.min_country_probability === '') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing or empty parameter'
                });
            }

            const minCountryProbability = Number(
                req.query.min_country_probability
            );

            if (
                !Number.isFinite(minCountryProbability) ||
                minCountryProbability < 0 ||
                minCountryProbability > 1
            ) {
                return res.status(422).json({
                    status: 'error',
                    message: 'Invalid query parameters'
                });
            }

            filters.min_country_probability = minCountryProbability;
        }

        const result = await profileService.getProfiles({
            page,
            limit,
            filters
        });

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