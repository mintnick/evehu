module.exports.add = add;
module.exports.update = update;

const esi = require("./esi.js");

async function add(app, alli_id) {
    try {
        let data = await esi(app, 'alli', alli_id);
        if (!data) return;

        data['date_founded'] = data['date_founded'].replace('T', ' ').slice(0, 19);

        const {creator_corporation_id, creator_id, executor_corporation_id, date_founded, name, ticker} = data;
        let result = await app.mysql.query(
            'insert ignore alliances '+
            '(alliance_id, creator_corporation_id, creator_id, executor_corporation_id, '+
            'date_founded, name, ticker, last_update) '+
            'values (?, ?, ?, ?, ?, ?, ?, NOW())',
            [alli_id, creator_corporation_id, creator_id, executor_corporation_id, date_founded, name, ticker]
        )
        // if (result.affectedRows == 1) console.log('Alli ' + alli_id + ' added');
    } catch (e) {
        console.log(e);
    }
}

async function update(app, alli_id) {
    try {
        let data = await esi(app, 'alli', alli_id);
        if (!data) return;

        const corps = await esi(app, 'alli', id + '/corporations');
        if (corps && corps.length == 0) {
            data['name'] = data['name'] + '(已关闭)';
            data['is_deleted'] = 1;
            data['member_count'] = 0;
        } else {
            data['is_deleted'] = 0;
            data['member_count'] = await app.mysql.queryField(
                'total',
                'select sum(member_count) total from corporations '+
                    'where alliance_id = ?;',
                [alli_id]
            );
        }
        data['date_founded'] = data['date_founded'].replace('T', ' ').slice(0, 19);

        const {executor_corporation_id, member_count, is_deleted} = data;
        let result = await app.mysql.query(
            'update alliances set executor_corporation_id = ?, member_count = ?, last_update = NOW(), is_deleted = ? where alliance_id = ?',
            [executor_corporation_id, member_count, is_deleted, alli_id]
        );
        // if (result.affectedRows == 1) console.log('Alli ' + alli_id + ' updated');
    } catch (e) {
        console.log(e);
    }
}