const utf8 = require('utf8');

module.exports = async function (req, res) {
    const alli_id = req.params.id;
    const data = {};

    // details
    const details = await req.app.mysql.query(
        'select creator_corporation_id, creator_id, executor_corporation_id, date_format(date_founded, "%Y年%m月%d日") date_founded, name, ticker, member_count, diff_7days '+
        'from alliances '+
        'where alliance_id = ?', 
        [alli_id]);
    if (details.length == 0) res.render('404');
    // await req.app.mysql.query('update alliances set is_active = 1 where alliance_id = ?', [alli_id]);

    data.id = alli_id;
    data.details = details[0];
    data.title = data.details.name;

    // creator
    data.creator = await req.app.mysql.query(
        'select character_id id, name from characters where character_id = ?',
        [data.details.creator_id]
    );
    if (data.creator.length > 0) data.creator = data.creator[0];

    // corps
    data.corporations = await req.app.mysql.query(
        'select corporation_id id, name, member_count, diff_7days ' + 
        'from corporations where alliance_id = ? order by name',
        [alli_id]
        );
    data.details.corp_count = data.corporations.length;

    if (data.details.executor_corporation_id > 1) {
        const exec_corp = await req.app.mysql.query(
            'select corporation_id, name from corporations where corporation_id = ?',
            [data.details.executor_corporation_id]
            );
        if (exec_corp.length) data.exec_corp = exec_corp[0];

        const creator_corp = await req.app.mysql.query(
            'select corporation_id, name from corporations where corporation_id = ?',
            [data.details.creator_corporation_id]
        );
        if (creator_corp.length) data.creator_corp = creator_corp[0];
    }

    // history

    data.join = await req.app.mysql.query(
        'select distinct(c.corporation_id) id, c.name, DATE_FORMAT(ah.start_date, "%Y年%m月%d日") start_date '+
        'from corporations c left join alliance_history ah on c.corporation_id = ah.corporation_id '+
        'where ah.alliance_id = ? and ah.end_date is null order by start_date desc',
        [alli_id]
    );

    data.left = await req.app.mysql.query(
        'select ah.corporation_id id, c.name, date_format(ah.start_date, "%Y年%m月%d日") start_date, date_format(max(ah.end_date), "%Y年%m月%d日") end_date '+
        'from corporations c join alliance_history ah on c.corporation_id = ah.corporation_id '+
        'where ah.alliance_id = ? and ah.end_date is not null '+
        'group by ah.corporation_id, ah.start_date order by end_date desc',
        [alli_id]
    );
    // data.history = await req.app.mysql.query(
    //     'select * from alliance_history where alliance_id = ?',
    //     [alli_id]
    // );

    // console.log(data.left);
    return data;
}