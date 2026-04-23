const profileService = require('../services/profile.service');
const { parseNaturalLanguageQuery } = require('../utils/queryParser');
const {
    parsePagination,
    parseProfileFilters,
    parseSorting
} = require('../utils/validateProfilesQuery');

async function getProfiles(req, res, next) {
    try {
        const paginationResult = parsePagination(req.query);
        if (paginationResult.error) {
            return res
                .status(paginationResult.error.statusCode)
                .json(paginationResult.error.body);
        }

        const filtersResult = parseProfileFilters(req.query);
        if (filtersResult.error) {
            return res
                .status(filtersResult.error.statusCode)
                .json(filtersResult.error.body);
        }

        const sortingResult = parseSorting(req.query);
        if (sortingResult.error) {
            return res
                .status(sortingResult.error.statusCode)
                .json(sortingResult.error.body);
        }

        const result = await profileService.getProfiles({
            page: paginationResult.page,
            limit: paginationResult.limit,
            filters: filtersResult.filters,
            sort_by: sortingResult.sort_by,
            order: sortingResult.order
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

async function searchProfiles(req, res, next) {
    try {
        const rawQuery =
            typeof req.query.q === 'string' ? req.query.q.trim() : '';

        if (!rawQuery) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing or empty parameter'
            });
        }

        const paginationResult = parsePagination(req.query);
        if (paginationResult.error) {
            return res
                .status(paginationResult.error.statusCode)
                .json(paginationResult.error.body);
        }

        const filters = parseNaturalLanguageQuery(rawQuery);

        if (!filters) {
            return res.status(400).json({
                status: 'error',
                message: 'Unable to interpret query'
            });
        }

        const result = await profileService.getProfiles({
            page: paginationResult.page,
            limit: paginationResult.limit,
            filters,
            sort_by: 'created_at',
            order: 'desc'
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
    getProfiles,
    searchProfiles
};