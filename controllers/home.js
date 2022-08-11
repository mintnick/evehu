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

const date_titles = ['birthday', 'end_date', 'start_date', 'date_founded']

module.exports = async function(req, res) {
    const data = {};
    for (const title of titles) {
        const value = await JSON.parse(await res.app.redis.get(title));
        if (value) {
            for (const i of value) 
                if(i.birthday) {
                    const array = i.birthday.slice(0, 10).split('-')
                        year = array[0], month = parseInt(array[1]), day = array[2],
                        time = i.birthday.slice(11, 19);
                    i.birthday = `${year}年${month}月${day}日 ${time}`;
                }
        }

        
        data[title] = value;
    }
    data.title = 'Home';
    return data;
}