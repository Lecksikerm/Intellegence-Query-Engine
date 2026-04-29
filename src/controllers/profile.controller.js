const profileService = require('../services/profile.service');
const { parseNaturalLanguageQuery } = require('../utils/queryParser');
const { profilesToCsv } = require('../utils/csv');
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

function formatV2Pagination(result) {
    return {
        page: result.page,
        per_page: result.limit,
        total_items: result.total,
        total_pages: result.totalPages,
        has_next_page: result.hasNextPage,
        has_previous_page: result.hasPreviousPage
    };
}

async function getProfilesV2(req, res, next) {
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
            data: result.data,
            pagination: formatV2Pagination(result)
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

async function searchProfilesV2(req, res, next) {
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
            data: result.data,
            pagination: formatV2Pagination(result)
        });
    } catch (error) {
        next(error);
    }
}

async function exportProfiles(req, res, next) {
    try {
        const profiles = await profileService.getAllProfilesForExport();
        const csv = profilesToCsv(profiles);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="profiles.csv"'
        );

        return res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProfiles,
    getProfilesV2,
    searchProfiles,
    searchProfilesV2,
    exportProfiles
};