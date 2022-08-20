const titles = [
    'large_alliances',
    'growing_alliances',
    'shrinking_alliances',
    'new_alliances',

    'large_corporations',
    'growing_corporations',
    'shrinking_corporations',
    'new_corporations',

    'new_characters',
    'moving_characters',
]

module.exports = async function(req, res) {
    const data = {};
    for (const title of titles) {
        const value = await JSON.parse(await res.app.redis.get(title));
        if(value) data[title] = value;
    }
    data.title = 'Home';
    return data;
}