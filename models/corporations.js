
module.exports.add = add;
module.exports.update = update;
module.exports.updateHistory = updateHistory;

const esi = require('./esi.js');

async function formatData(data) {
    data['date_founded'] = (data['date_founded'])?
        data['date_founded'].replace('T', ' ').slice(0, 19) : null;
    data['is_deleted'] = (data['ceo_id'] == 1) ? 1 : 0 ;
    if (data['ceo_id'] == 1) data['name'] += '(已关闭)';

    return data;
}

async function isoToMysql(dateString) {
    return dateString.replace('T', ' ').slice(0, 19);
}

async function add(app, corp_id) {
    try {
        let data = await esi(app, 'corp', corp_id);
        if (!data) return;

        data = await formatData(data);
        const {alliance_id, ceo_id, creator_id, date_founded, member_count, name, ticker, is_deleted} = data;
        let result = await app.mysql.query(
            'insert ignore corporations '+
            '(corporation_id, alliance_id, ceo_id, creator_id, '+
            'date_founded, member_count, name, ticker, is_deleted, last_update) '+
            'values(?, ?, ?, ? ,?, ?, ?, ? ,?, NOW())',
            [corp_id, alliance_id, ceo_id, creator_id, date_founded, member_count, name, ticker, is_deleted]
        );
        if (result.affectedRows == 1) console.log('Corp ' + corp_id + ' added');

        if (corp_id > 98000000) await updateHistory(app, corp_id);
    } catch (e) {
        console.log(e);
    }
}

async function update(app, corp_id) {
    try {
        let data = await esi(app, 'corp', corp_id);
        if (!data) return;

        data = await formatData(data);
        const {alliance_id, ceo_id, member_count, is_deleted} = data;
        let result = await app.mysql.query(
            'update corporations set '+
            'alliance_id = ?, ceo_id = ?, member_count = ?, last_update = NOW(), is_deleted = ? '+
            'where corporation_id = ?',
            [alliance_id, ceo_id, member_count, is_deleted, corp_id]
        );
        // if (result.affectedRows == 1) console.log('Corp ' + corp_id + ' updated');

        if (corp_id > 98000000) await updateHistory(app, corp_id);
    } catch (e) {
        console.log(e);
    }
}

async function updateHistory(app, corp_id) {
    try {
        let data = await esi(app, 'corp', corp_id + '/alliancehistory');
        if (!data || data.length == 0) return;

        let i = 0;
        const last_record_id = data[i].record_id;
        const check = await app.mysql.query('select * from alliance_history where record_id = ? ', [last_record_id]);
        if (check.length == 0) {
            data = data.reverse();
            while (i < data.length - 1) {
                // sometimes corp quit alliance will generate two identical records
                if (data[i]['starte_date'] === data[i+1]['start_date']) continue;
    
                let {record_id, start_date} = data[i];
                const alliance_id = data[i]['alliance_id'] ?? null;
                let end_date = data[i+1]['start_date'];
                start_date = await isoToMysql(start_date);
                end_date = await isoToMysql(end_date);
                await app.mysql.query(
                    'insert ignore into alliance_history '+
                        '(record_id, corporation_id, alliance_id, start_date, end_date) '+
                        'values (?, ?, ?, ?, ?) '+
                        'on duplicate key update '+
                        'end_date = ?',
                    [record_id, corp_id, alliance_id, start_date, end_date, end_date]
                )
    
                i++;
            }
            let {record_id, start_date} = data[i];
            const alliance_id = data[i]['alliance_id'] ?? null;
            start_date = await isoToMysql(start_date);
            let result = await app.mysql.query(
                'insert ignore into alliance_history '+
                '(record_id, corporation_id, alliance_id, start_date) '+
                'values (?, ?, ?, ?)',
                [record_id, corp_id, alliance_id, start_date]
                )
            // if (result.affectedRows == 1) console.log(`Corp ${corp_id} history updated`);
        }
        await app.mysql.query(
            'update corporations set history_update = NOW() where corporation_id = ?',
            [corp_id]
        );
    } catch (e) {
        console.log(e);
    }
}
