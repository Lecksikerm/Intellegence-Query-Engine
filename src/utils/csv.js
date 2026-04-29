function escapeCsvValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);

    if (
        stringValue.includes(',') ||
        stringValue.includes('"') ||
        stringValue.includes('\n')
    ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}

function profilesToCsv(profiles) {
    const headers = [
        'id',
        'name',
        'gender',
        'gender_probability',
        'age',
        'age_group',
        'country_id',
        'country_name',
        'country_probability',
        'created_at'
    ];

    const rows = profiles.map((profile) =>
        headers
            .map((header) => escapeCsvValue(profile[header]))
            .join(',')
    );

    return [headers.join(','), ...rows].join('\n');
}

module.exports = {
    profilesToCsv
};