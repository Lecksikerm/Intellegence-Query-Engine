const prisma = require('../config/prisma');

async function getProfiles({
    page = 1,
    limit = 10,
    filters = {},
    sort_by = 'created_at',
    order = 'desc'
}) {
    const skip = (page - 1) * limit;

    const where = {};

    if (filters.gender) {
        where.gender = filters.gender;
    }

    if (filters.age_group) {
        where.age_group = filters.age_group;
    }

    if (filters.country_id) {
        where.country_id = filters.country_id;
    }

    if (filters.min_age !== undefined || filters.max_age !== undefined) {
        where.age = {};

        if (filters.min_age !== undefined) {
            where.age.gte = filters.min_age;
        }

        if (filters.max_age !== undefined) {
            where.age.lte = filters.max_age;
        }
    }

    if (filters.min_gender_probability !== undefined) {
        where.gender_probability = {
            gte: filters.min_gender_probability
        };
    }

    if (filters.min_country_probability !== undefined) {
        where.country_probability = {
            gte: filters.min_country_probability
        };
    }

    const [total, profiles] = await Promise.all([
        prisma.profile.count({ where }),
        prisma.profile.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sort_by]: order
            }
        })
    ]);

    return {
        page,
        limit,
        total,
        data: profiles
    };
}

async function searchProfiles({
    query,
    page = 1,
    limit = 10,
    filters = {},
    sort_by = 'created_at',
    order = 'desc'
}) {
    const skip = (page - 1) * limit;

    const where = {};

    if (query) {
        where.name = {
            contains: query,
            mode: 'insensitive'
        };
    }

    if (filters.gender) {
        where.gender = filters.gender;
    }

    if (filters.age_group) {
        where.age_group = filters.age_group;
    }

    if (filters.country_id) {
        where.country_id = filters.country_id;
    }

    if (filters.min_age !== undefined || filters.max_age !== undefined) {
        where.age = {};

        if (filters.min_age !== undefined) {
            where.age.gte = filters.min_age;
        }

        if (filters.max_age !== undefined) {
            where.age.lte = filters.max_age;
        }
    }

    if (filters.min_gender_probability !== undefined) {
        where.gender_probability = {
            gte: filters.min_gender_probability
        };
    }

    if (filters.min_country_probability !== undefined) {
        where.country_probability = {
            gte: filters.min_country_probability
        };
    }

    const [total, profiles] = await Promise.all([
        prisma.profile.count({ where }),
        prisma.profile.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sort_by]: order
            }
        })
    ]);

    return {
        page,
        limit,
        total,
        data: profiles
    };
}

async function getAllProfilesForExport() {
    return prisma.profile.findMany({
        orderBy: {
            created_at: 'desc'
        }
    });
}

module.exports = {
    getProfiles,
    searchProfiles,
    getAllProfilesForExport
};