
module.exports = async function(req, res) {
    const char_id = req.params.id;
    const data = {};

    // details
    const details = await req.app.mysql.query(
        'select c.alliance_id alliance_id, c.corporation_id corporation_id, c.name name, date_format(c.birthday, "%Y年%m月%d日") date_founded, co.name corp_name, a.name alli_name '+
        'from characters c left join corporations co on c.corporation_id = co.corporation_id '+
        'left join alliances a on c.alliance_id = a.alliance_id '+
        'where character_id = ?',
        [char_id]
    );
    if (details.length == 0) res.render('404');
    // await req.app.mysql.query('update characters set is_active = 1 where character_id = ?', [char_id]);

    data.id = char_id;
    data.details = details[0];
    data.title = data.details.name;

    data.history = await req.app.mysql.query(
        'select ch.corporation_id id, c.name name, date_format(ch.start_date, "%Y年%m月%d日") start_date, date_format(ch.end_date, "%Y年%m月%d日") end_date '+
        'from corporation_history ch join corporations c on ch.corporation_id = c.corporation_id '+
        'where ch.character_id = ? order by start_date desc',
        [char_id]
    )
    // console.log(data.details);

    return data;
}