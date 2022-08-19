
async function formatData(data) {
    data['date_founded'] = data['date_founded'].replace('T', ' ').slice(0, 19);

    return data;
};

exports.add = async function (app, alli_id, data) {
    try {
        data = await formatData(data);
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
};

exports.update = async function (app, alli_id, data) {
    try {
        data = await formatData(data);
        const {executor_corporation_id, member_count, is_deleted} = data;
        let result = await app.mysql.query(
            'update alliances set executor_corporation_id = ?, member_count = ?, last_update = NOW(), is_deleted = ? where alliance_id = ?',
            [executor_corporation_id, member_count, is_deleted, alli_id]
        );
        // if (result.affectedRows == 1) console.log('Alli ' + alli_id + ' updated');
    } catch (e) {
        console.log(e);
    }
};