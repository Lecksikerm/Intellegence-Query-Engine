require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DATA_FILE = path.join(__dirname, 'data', 'seed_profiles.json');

const ALLOWED_GENDERS = new Set(['male', 'female']);
const ALLOWED_AGE_GROUPS = new Set(['child', 'teenager', 'adult', 'senior']);

function normalizeString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeGender(value) {
    return normalizeString(value).toLowerCase();
}

function normalizeAgeGroup(value) {
    return normalizeString(value).toLowerCase();
}

function normalizeCountryId(value) {
    return normalizeString(value).toUpperCase();
}

function normalizeFloat(value, fieldName) {
    const num = Number(value);

    if (!Number.isFinite(num)) {
        throw new Error(`Invalid numeric value for ${fieldName}`);
    }

    return num;
}

function normalizeInt(value, fieldName) {
    const num = Number(value);

    if (!Number.isInteger(num)) {
        throw new Error(`Invalid integer value for ${fieldName}`);
    }

    return num;
}

function assertNoDuplicateNames(profiles) {
    const seen = new Set();

    for (const rawProfile of profiles) {
        const name = normalizeString(rawProfile.name);

        if (!name) continue;

        if (seen.has(name)) {
            throw new Error(`Duplicate name found in seed file: ${name}`);
        }

        seen.add(name);
    }
}

function extractProfiles(parsed) {
    if (Array.isArray(parsed)) {
        return parsed;
    }

    if (parsed && Array.isArray(parsed.profiles)) {
        return parsed.profiles;
    }

    if (parsed && Array.isArray(parsed.data)) {
        return parsed.data;
    }

    return null;
}

function validateAndTransformProfile(profile) {
    const name = normalizeString(profile.name);
    const gender = normalizeGender(profile.gender);
    const gender_probability = normalizeFloat(
        profile.gender_probability,
        'gender_probability'
    );
    const age = normalizeInt(profile.age, 'age');
    const age_group = normalizeAgeGroup(profile.age_group);
    const country_id = normalizeCountryId(profile.country_id);
    const country_name = normalizeString(profile.country_name);
    const country_probability = normalizeFloat(
        profile.country_probability,
        'country_probability'
    );

    if (!name) {
        throw new Error('Profile name is required');
    }

    if (!ALLOWED_GENDERS.has(gender)) {
        throw new Error(`Invalid gender for profile: ${name}`);
    }

    if (!ALLOWED_AGE_GROUPS.has(age_group)) {
        throw new Error(`Invalid age_group for profile: ${name}`);
    }

    if (!country_id || country_id.length !== 2) {
        throw new Error(`Invalid country_id for profile: ${name}`);
    }

    if (!country_name) {
        throw new Error(`country_name is required for profile: ${name}`);
    }

    if (age < 0) {
        throw new Error(`Invalid age for profile: ${name}`);
    }

    return {
        name,
        gender,
        gender_probability,
        age,
        age_group,
        country_id,
        country_name,
        country_probability
    };
}

async function main() {
    if (!fs.existsSync(DATA_FILE)) {
        throw new Error(`Seed file not found at: ${DATA_FILE}`);
    }

    const rawFile = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(rawFile);
    const profiles = extractProfiles(parsed);

    if (!profiles) {
        throw new Error(
            'Seed file must contain a JSON array of profiles or an object with profiles/data array'
        );
    }

    assertNoDuplicateNames(profiles);

    if (profiles.length !== 2026) {
        console.warn(
            `Warning: expected 2026 profiles, but found ${profiles.length}`
        );
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const rawProfile of profiles) {
        const profile = validateAndTransformProfile(rawProfile);

        const existingProfile = await prisma.profile.findUnique({
            where: { name: profile.name },
            select: { id: true }
        });

        if (existingProfile) {
            await prisma.profile.update({
                where: { name: profile.name },
                data: {
                    gender: profile.gender,
                    gender_probability: profile.gender_probability,
                    age: profile.age,
                    age_group: profile.age_group,
                    country_id: profile.country_id,
                    country_name: profile.country_name,
                    country_probability: profile.country_probability
                }
            });

            updatedCount += 1;
        } else {
            await prisma.profile.create({
                data: {
                    id: uuidv4(),
                    ...profile
                }
            });

            createdCount += 1;
        }
    }

    const total = await prisma.profile.count();

    console.log('Seeding completed successfully.');
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Total records in database: ${total}`);
}

main()
    .catch((error) => {
        console.error('Seeding failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });