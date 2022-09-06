module.exports.add = add;
module.exports.update = update;
module.exports.updateHistory = updateHistory;

const esi = require('./esi.js');

async function formatData(data) {
    if (data['alliance_id'] === undefined) data['alliance_id'] = null;
    if (data['faction_id'] === undefined) data['faction_id'] = null
    data['security_status'].toFixed(2);
    if (data['corporation_id'] == 1000001) data['name'] += '(已删除)';
    return data;
}

async function isoToMysql(dateString) {
    return dateString.replace('T', ' ').slice(0, 19);
}

async function add(app, char_id) {
    try {
        let data = await esi(app, 'char', char_id);
        if (!data) return;

        data = await formatData(data);
        const {alliance_id, corporation_id, name, birthday, security_status, faction_id} = data;
        let result = await app.mysql.query(
            'insert ignore into characters ' +
            '(character_id, alliance_id, corporation_id, name, birthday, security_status, faction_id, last_update) ' +
            'values(?, ?, ?, ?, ?, ?, ?, NOW())',
            [char_id, alliance_id, corporation_id, name, birthday, security_status, faction_id]
        );
        if (result.affectedRows == 1) console.log('Char ' + char_id + ' added');

        await updateHistory(app, char_id);
    } catch (e) {
        console.log(e);
    }
}

async function update(app, char_id) {
    try {
        let data = await esi(app, 'char', char_id);
        if (!data) {
            await app.mysql.query(`update characters set last_update = NOW() where character_id = ${char_id}`);
            console.log('ESI get null: char ' + char_id);
            return;
        }

        data = await formatData(data);
        const {alliance_id, corporation_id, security_status, faction_id} = data;
        let result = await app.mysql.query(
            'update characters set '+
            'alliance_id = ?, corporation_id = ?, security_status = ?, faction_id = ? '+
            'where character_id = ?',
            [alliance_id, corporation_id, security_status, faction_id, char_id]
        );
        // if (result.affectedRows == 1) console.log('Char ' + char_id + ' updated');

        await updateHistory(app, char_id);
    } catch (e) {
        console.log(e);
    }
}

async function updateHistory(app, char_id) {
    try {
        let data = await esi(app, 'char', char_id + '/corporationhistory');
        if (!data || data.length == 0) {
            await app.mysql.query(`update characters set last_update = NOW() where character_id = ${char_id}`);
            console.log('ESI get null: char history' + char_id);
            return;
        }

        // console.log(data);
        const last_record_id = data[0].record_id;
        const check = await app.mysql.query('select * from corporation_history where record_id = ?', [last_record_id]);
        // console.log(check);

        if (check.length == 0) {
            data = data.reverse();
            let i = 0;
            while (i < data.length - 1) {
                let {record_id, corporation_id, start_date} = data[i];
                let end_date = data[i+1]['start_date'];
                start_date = await isoToMysql(start_date);
                end_date = await isoToMysql(end_date);
                await app.mysql.query(
                    'insert ignore into corporation_history '+
                        '(record_id, character_id, corporation_id, start_date, end_date) '+
                        'values (?, ?, ?, ?, ?) '+
                        'on duplicate key update '+
                        'end_date = ?',
                    [record_id, char_id, corporation_id, start_date, end_date, end_date]
                )

                i++;
            }
            let {record_id, corporation_id, start_date} = data[i];
            start_date = await isoToMysql(start_date);
            let result = await app.mysql.query(
                'insert ignore into corporation_history '+
                '(record_id, character_id, corporation_id, start_date) '+
                'values (?, ?, ?, ?)',
                [record_id, char_id, corporation_id, start_date]
                )
            // if (result.affectedRows == 1) console.log(`Char ${char_id} history updated`);
        }

        await app.mysql.query(
            'update characters set last_update = NOW() where character_id = ?',
            [char_id]
        );
    } catch (e) {
        console.log(e);
    }
}
