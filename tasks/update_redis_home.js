const max_alli_id = 100000000,
    max_corp_id = 99000000,
    max_char_id = 2100000000;


module.exports = async function (app) {
    setRedis(app, 'large_alliances', 'select alliance_id id, name, member_count, diff_7days from alliances order by member_count desc limit 10');
    setRedis(app, 'growing_alliances', 'select alliance_id id, name, member_count, diff_7days from alliances where diff_7days IS NOT NULL order by diff_7days desc limit 10');
    setRedis(app, 'shrinking_alliances', 'select alliance_id id, name, member_count, diff_7days from alliances where diff_7days IS NOT NULL order by diff_7days limit 10');
    setRedis(app, 'new_alliances', 'select alliance_id id, name, date_founded birthday, member_count, diff_7days from alliances where alliance_id < ? order by date_founded desc limit 10', [max_alli_id]);

    setRedis(app, 'large_corporations', 'select corporation_id id, alliance_id, name, member_count, diff_7days from corporations where corporation_id > 98000000 order by member_count desc limit 10');
    setRedis(app, 'growing_corporations', 'select corporation_id id, alliance_id, name, member_count, diff_7days from corporations where diff_7days IS NOT NULL and corporation_id > 98000000 order by diff_7days desc limit 10');
    setRedis(app, 'shrinking_corporations', 'select corporation_id id, alliance_id, name, member_count, diff_7days from corporations where diff_7days IS NOT NULL and corporation_id > 98000000 order by diff_7days limit 10');
    setRedis(app, 'new_corporations', 'select corporation_id id, alliance_id, date_founded birthday, name, member_count, diff_7days from corporations where corporation_id < ?  and corporation_id > 98000000 order by date_founded desc limit 10', [max_corp_id]);

    setRedis(app, 'new_characters', 'select character_id id, alliance_id, corporation_id, name, birthday from characters where character_id < ? order by birthday desc limit 10', [max_char_id]);
    setRedis(app, 'moving_characters', 'SELECT h.record_id id, h.character_id ch_id, ch.name ch_name, c.corporation_id c_id, c.name c_name, h.end_date end_date FROM `corporation_history` h ' +
                                        'left join characters ch on h.character_id = ch.character_id ' +
                                        'left join corporations c on h.corporation_id = c.corporation_id ' +
                                        'where ch.birthday < (NOW() - INTERVAL 1 DAY) ' +
                                        'order by id desc limit 10;')
};

async function setRedis(app, key, query, values) {
    try {
        const result = await app.mysql.query(query, values);
        await app.redis.set(key, JSON.stringify(result));
    } catch (e) {
        console.log(e);
    }
}