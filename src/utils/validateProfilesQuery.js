const {
    ALLOWED_GENDERS,
    ALLOWED_AGE_GROUPS,
    ALLOWED_SORT_FIELDS,
    ALLOWED_SORT_ORDERS
} = require('./profileFields');

function badRequest(message = 'Missing or empty parameter') {
    return {
        statusCode: 400,
        body: {
            status: 'error',
            message
        }
    };
}

function unprocessable(message = 'Invalid query parameters') {
    return {
        statusCode: 422,
        body: {
            status: 'error',
            message
        }
    };
}

function parsePagination(query) {
    const rawPage = query.page ?? '1';
    const rawLimit = query.limit ?? '10';

    if (rawPage === '' || rawLimit === '') {
        return { error: badRequest() };
    }

    const page = Number(rawPage);
    const limit = Number(rawLimit);

    if (!Number.isInteger(page) || page < 1) {
        return { error: unprocessable() };
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        return { error: unprocessable() };
    }

    return { page, limit };
}

function parseProfileFilters(query) {
    const filters = {};

    if (query.gender !== undefined) {
        if (query.gender === '') {
            return { error: badRequest() };
        }

        const gender = String(query.gender).toLowerCase();

        if (!ALLOWED_GENDERS.includes(gender)) {
            return { error: unprocessable() };
        }

        filters.gender = gender;
    }

    if (query.age_group !== undefined) {
        if (query.age_group === '') {
            return { error: badRequest() };
        }

        const ageGroup = String(query.age_group).toLowerCase();

        if (!ALLOWED_AGE_GROUPS.includes(ageGroup)) {
            return { error: unprocessable() };
        }

        filters.age_group = ageGroup;
    }

    if (query.country_id !== undefined) {
        if (query.country_id === '') {
            return { error: badRequest() };
        }

        const countryId = String(query.country_id).toUpperCase();

        if (!/^[A-Z]{2}$/.test(countryId)) {
            return { error: unprocessable() };
        }

        filters.country_id = countryId;
    }

    if (query.min_age !== undefined) {
        if (query.min_age === '') {
            return { error: badRequest() };
        }

        const minAge = Number(query.min_age);

        if (!Number.isInteger(minAge) || minAge < 0) {
            return { error: unprocessable() };
        }

        filters.min_age = minAge;
    }

    if (query.max_age !== undefined) {
        if (query.max_age === '') {
            return { error: badRequest() };
        }

        const maxAge = Number(query.max_age);

        if (!Number.isInteger(maxAge) || maxAge < 0) {
            return { error: unprocessable() };
        }

        filters.max_age = maxAge;
    }

    if (
        filters.min_age !== undefined &&
        filters.max_age !== undefined &&
        filters.min_age > filters.max_age
    ) {
        return { error: unprocessable() };
    }

    if (query.min_gender_probability !== undefined) {
        if (query.min_gender_probability === '') {
            return { error: badRequest() };
        }

        const minGenderProbability = Number(query.min_gender_probability);

        if (
            !Number.isFinite(minGenderProbability) ||
            minGenderProbability < 0 ||
            minGenderProbability > 1
        ) {
            return { error: unprocessable() };
        }

        filters.min_gender_probability = minGenderProbability;
    }

    if (query.min_country_probability !== undefined) {
        if (query.min_country_probability === '') {
            return { error: badRequest() };
        }

        const minCountryProbability = Number(query.min_country_probability);

        if (
            !Number.isFinite(minCountryProbability) ||
            minCountryProbability < 0 ||
            minCountryProbability > 1
        ) {
            return { error: unprocessable() };
        }

        filters.min_country_probability = minCountryProbability;
    }

    return { filters };
}

function parseSorting(query) {
    let sort_by = 'created_at';
    let order = 'desc';

    if (query.sort_by !== undefined) {
        if (query.sort_by === '') {
            return { error: badRequest() };
        }

        const sortField = String(query.sort_by);

        if (!ALLOWED_SORT_FIELDS.includes(sortField)) {
            return { error: unprocessable() };
        }

        sort_by = sortField;
    }

    if (query.order !== undefined) {
        if (query.order === '') {
            return { error: badRequest() };
        }

        const sortOrder = String(query.order).toLowerCase();

        if (!ALLOWED_SORT_ORDERS.includes(sortOrder)) {
            return { error: unprocessable() };
        }

        order = sortOrder;
    }

    return { sort_by, order };
}

module.exports = {
    parsePagination,
    parseProfileFilters,
    parseSorting
};