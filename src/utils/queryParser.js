const { COUNTRY_NAME_TO_ID } = require('./countryMap');

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeQuery(query) {
    return String(query)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
}

function detectGender(normalizedQuery) {
    const hasMale = /\bmale\b|\bmales\b/.test(normalizedQuery);
    const hasFemale = /\bfemale\b|\bfemales\b/.test(normalizedQuery);

    if (hasMale && hasFemale) {
        return undefined;
    }

    if (hasMale) {
        return 'male';
    }

    if (hasFemale) {
        return 'female';
    }

    return undefined;
}

function detectAgeGroup(normalizedQuery) {
    if (/\bchild\b|\bchildren\b/.test(normalizedQuery)) {
        return 'child';
    }

    if (/\bteenager\b|\bteenagers\b/.test(normalizedQuery)) {
        return 'teenager';
    }

    if (/\badult\b|\badults\b/.test(normalizedQuery)) {
        return 'adult';
    }

    if (/\bsenior\b|\bseniors\b/.test(normalizedQuery)) {
        return 'senior';
    }

    return undefined;
}

function detectYoungRange(normalizedQuery) {
    if (/\byoung\b/.test(normalizedQuery)) {
        return {
            min_age: 16,
            max_age: 24
        };
    }

    return {};
}

function detectAgeBounds(normalizedQuery) {
    const filters = {};

    const aboveMatch = normalizedQuery.match(/\babove\s+(\d+)\b/);
    const belowMatch = normalizedQuery.match(/\bbelow\s+(\d+)\b/);
    const underMatch = normalizedQuery.match(/\bunder\s+(\d+)\b/);
    const overMatch = normalizedQuery.match(/\bover\s+(\d+)\b/);

    if (aboveMatch) {
        filters.min_age = Number(aboveMatch[1]);
    }

    if (overMatch) {
        filters.min_age = Number(overMatch[1]);
    }

    if (belowMatch) {
        filters.max_age = Number(belowMatch[1]);
    }

    if (underMatch) {
        filters.max_age = Number(underMatch[1]);
    }

    return filters;
}

function detectCountry(normalizedQuery) {
    const sortedCountryNames = Object.keys(COUNTRY_NAME_TO_ID).sort(
        (a, b) => b.length - a.length
    );

    for (const countryName of sortedCountryNames) {
        const pattern = new RegExp(`\\bfrom\\s+${escapeRegex(countryName)}\\b`);

        if (pattern.test(normalizedQuery)) {
            return COUNTRY_NAME_TO_ID[countryName];
        }
    }

    return undefined;
}

function parseNaturalLanguageQuery(query) {
    const normalizedQuery = normalizeQuery(query);

    if (!normalizedQuery) {
        return null;
    }

    const filters = {};

    const gender = detectGender(normalizedQuery);
    const ageGroup = detectAgeGroup(normalizedQuery);
    const countryId = detectCountry(normalizedQuery);
    const youngRange = detectYoungRange(normalizedQuery);
    const ageBounds = detectAgeBounds(normalizedQuery);

    if (gender) {
        filters.gender = gender;
    }

    if (ageGroup) {
        filters.age_group = ageGroup;
    }

    if (countryId) {
        filters.country_id = countryId;
    }

    if (youngRange.min_age !== undefined) {
        filters.min_age = youngRange.min_age;
    }

    if (youngRange.max_age !== undefined) {
        filters.max_age = youngRange.max_age;
    }

    if (ageBounds.min_age !== undefined) {
        filters.min_age = ageBounds.min_age;
    }

    if (ageBounds.max_age !== undefined) {
        filters.max_age = ageBounds.max_age;
    }

    if (
        filters.min_age !== undefined &&
        filters.max_age !== undefined &&
        filters.min_age > filters.max_age
    ) {
        return null;
    }

    if (Object.keys(filters).length === 0) {
        return null;
    }

    return filters;
}

module.exports = {
    parseNaturalLanguageQuery
};