const esi = require('../models/esi.js');
const alliances = require('../models/alliances.js');

module.exports = async function (app) {
    let ids = await app.mysql.query(
        'select alliance_id from alliances ' +
        'where is_deleted != 1 and ' + 
        'is_active = 1 ' +
        'limit 10'
    );
    await updateAllis(app, ids);

    ids = await app.mysql.query(
        'select alliance_id from alliances '+
        'where is_deleted != 1 and '+
        '(last_update is NULL or last_update < (NOW() - INTERVAL 1 DAY)) '+
        'limit 1000');
    await updateAllis(app, ids);
};

async function updateAllis(app, ids) {
    if (ids.length == 0) return;

    ids = ids.map(id => id.alliance_id);
    for (id of ids) {
        let data = await esi(app, 'alli', id);
        if (data) {
            const corps = await esi(app, 'alli', id + '/corporations');
            if (corps && corps.length > 0) {
                data['is_deleted'] = 0;
                data['member_count'] = await app.mysql.queryField(
                    'total',
                    'select sum(member_count) total from corporations '+
                        'where alliance_id = ?;',
                    [id]
                );
            } else {
                data['is_deleted'] = 1;
                data['member_count'] = 0;
            }

            await alliances.update(app, id, data);
        }
    }
}