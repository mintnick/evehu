const titles = [
    'large_alliances',
    'growing_alliances',
    'shrinking_alliances',
    'new_alliances',

    'large_corporations',
    'growing_corporations',
    'shrinking_corporations',
    'new_corporations',
    'recent_corp_joining',
    'recent_corp_leaving',

    'new_characters',
    'recent_char_joining',
    'recent_char_leaving',
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