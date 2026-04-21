const prisma = require('../config/prisma');

async function getProfiles({ page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const [total, profiles] = await Promise.all([
        prisma.profile.count(),
        prisma.profile.findMany({
            skip,
            take: limit,
            orderBy: {
                created_at: 'desc'
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

module.exports = {
    getProfiles
};