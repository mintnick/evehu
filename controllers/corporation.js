module.exports = async function (req, res) {
    const corp_id = req.params.id;
    const data = {};

    // details
    const details = await req.app.mysql.query(
        'select c.alliance_id alliance_id, c.ceo_id ceo_id, c.creator_id creator_id, date_format(c.date_founded, "%Y年%m月%d日") date_founded, c.member_count member_count, c.name name, c.ticker ticker, c.diff_7days diff_7days, a.name alli_name '+
        'from corporations c left join alliances a on c.alliance_id = a.alliance_id '+
        'where c.corporation_id = ?', [corp_id]
        );
    if (details.length == 0) return;
    await req.app.mysql.query('update corporations set is_active = 1 where corporation_id = ?', [corp_id]);

    data.id = corp_id;
    data.details = details[0];
    data.title = data.details.name;
    
    // creator
    data.creator = await req.app.mysql.query(
        'select character_id id, name from characters where character_id = ?',
        [corp_id]
    );
    if (data.creator.length > 0) data.creator = data.creator[0];

    // chars
    data.characters = await req.app.mysql.query(
        'select c.character_id id, c.name name, date_format(ch.start_date, "%Y年%m月%d日") start_date '+
        'from characters c left join corporation_history ch on c.character_id = ch.character_id '+
        'where c.corporation_id = ? and ch.end_date is null order by start_date desc',
        [corp_id]
    );

    // history
    data.left = await req.app.mysql.query(
        'select c.character_id id, c.name name, date_format(ch.start_date, "%Y年%m月%d日") start_date, date_format(max(ch.end_date), "%Y年%m月%d日") end_date '+
        'from characters c join corporation_history ch on c.character_id = ch.character_id '+
        'where ch.corporation_id = ? and ch.end_date is not null ' +
        'group by ch.character_id, ch.start_date order by end_date desc',
        [corp_id]
    )
    
    // console.log(data.details);
    return data;
}