
module.exports = async function (app) {
    setRedis(app, 'large_alliances', 'select alliance_id id, name, member_count, diff_7days from alliances order by member_count desc limit 10');
    setRedis(app, 'growing_alliances', 'select alliance_id id, name, member_count, diff_7days from alliances where diff_7days IS NOT NULL and diff_7days >= 0 order by diff_7days desc limit 10');
    setRedis(app, 'shrinking_alliances', 'select alliance_id id, name, member_count, diff_7days from alliances where diff_7days IS NOT NULL and diff_7days <= 0 order by diff_7days limit 10');
    setRedis(app, 'new_alliances', 'select alliance_id id, name, date_format(date_founded, "%Y年%m月%d日 %H:%i") birthday, member_count from alliances order by birthday desc limit 10');

    setRedis(app, 'large_corporations', 'select corporation_id id, name, member_count, diff_7days from corporations where corporation_id > 98000000 order by member_count desc limit 10');
    setRedis(app, 'growing_corporations', 'select corporation_id id, name, member_count, diff_7days from corporations where diff_7days IS NOT NULL and corporation_id > 98000000 and diff_7days >= 0 order by diff_7days desc limit 10');
    setRedis(app, 'shrinking_corporations', 'select corporation_id id, name, member_count, diff_7days from corporations where diff_7days IS NOT NULL and corporation_id > 98000000 and diff_7days <= 0 order by diff_7days limit 10');
    setRedis(app, 'new_corporations', 'select corporation_id id, name, date_format(date_founded, "%Y年%m月%d日 %H:%i") birthday, member_count from corporations order by birthday desc limit 10');
    setRedis(app, 'recent_corp_joining', 'SELECT h.record_id id, h.corporation_id co_id, co.name co_name, a.alliance_id a_id, a.name a_name, date_format(h.start_date, "%Y年%m月%d日 %H:%i") date FROM `alliance_history` h left join corporations co on h.corporation_id = co.corporation_id left join alliances a on h.alliance_id = a.alliance_id where a.alliance_id is not null and h.end_date is null order by date desc limit 10');
    setRedis(app, 'recent_corp_leaving', 'SELECT h.record_id id, h.corporation_id co_id, co.name co_name, a.alliance_id a_id, a.name a_name, date_format(h.end_date, "%Y年%m月%d日 %H:%i") date FROM `alliance_history` h left join corporations co on h.corporation_id = co.corporation_id left join alliances a on h.alliance_id = a.alliance_id where a.alliance_id is not null and h.end_date is not null order by date desc limit 10');

    setRedis(app, 'new_characters', 'select character_id id, name, date_format(birthday, "%Y年%m月%d日 %H:%i") birthday from characters order by birthday desc limit 10');
    setRedis(app, 'recent_char_leaving', 'SELECT h.record_id id, h.character_id ch_id, ch.name ch_name, c.corporation_id c_id, c.name c_name, date_format(h.end_date, "%Y年%m月%d日 %H:%i") date FROM `corporation_history` h left join characters ch on h.character_id = ch.character_id left join corporations c on h.corporation_id = c.corporation_id where h.end_date is not null and h.corporation_id > 98000000 order by date desc limit 10');
    setRedis(app, 'recent_char_joining', 'SELECT h.record_id id, h.character_id ch_id, ch.name ch_name, c.corporation_id c_id, c.name c_name, date_format(h.start_date, "%Y年%m月%d日 %H:%i") date FROM `corporation_history` h left join characters ch on h.character_id = ch.character_id left join corporations c on h.corporation_id = c.corporation_id where h.end_date is null and h.corporation_id > 98000000 order by date desc limit 10');

    // console.log('Redis home updated');
};

async function setRedis(app, key, query, values) {
    try {
        const result = await app.mysql.query(query, values);
        await app.redis.set(key, JSON.stringify(result));
    } catch (e) {
        console.log(e);
    }
}