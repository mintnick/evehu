const utf8 = require('utf8');

module.exports = async function (req, res) {
    const alli_id = req.params.id;
    const data = {};
    const details = await req.app.mysql.query('select * from alliances where alliance_id = ?', [alli_id]);
    if (details.length == 0) return;

    data.details = details[0];
    const t = (data.details.date_founded).toLocaleDateString("zh").split('/');
    data.details.date_founded = `${t[0]}年 ${t[1]}月 ${t[2]}日`
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

    data.history = await req.app.mysql.query(
        'select * from alliance_history where alliance_id = ?',
        [data.alli_id]
    );

    data.title = data.details.name;
    // console.log(data);
    return data;
}