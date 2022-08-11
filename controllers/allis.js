const titles = [
    'large_alliances',
    'growing_alliances',
    'shrinking_alliances',
    'new_alliances'
]

module.exports = async function (req, res) {
    const data = {};
    for (const title of titles) {
        const value = await JSON.parse(await res.app.redis.get(title));
        data[title] = value;
    }
    data.title = 'Alliances';
    return data;
}