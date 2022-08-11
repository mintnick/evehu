const esi = require('../models/esi.js');
const corporations = require('../models/corporations.js');

module.exports = async function (app) {
    let ids = await app.mysql.query(
        'select corporation_id from corporations ' +
        'where id_deleted != 1 and ' +
        'is_active = 1 ' +
        'limit 100'
    );
    await updateCorps(app, ids);

    ids = await app.mysql.query(
        'select corporation_id from corporations '+
            'where is_deleted != 1 and '+
            '(last_update is NULL or last_update < (NOW() - INTERVAL 7 DAY)) '+
            'limit 1000');
    ids = ids.map(id => id.corporation_id);
    await updateCorps(app, ids);
};

async function updateCorps(app, ids) {
    if (ids.length == 0) return;
    ids = ids.map(id => id.corporation_id);
    for (const id of ids) {
        const data = await esi(app, 'corp', id);
        if (data) await corporations.update(app, id, data);
    }
}