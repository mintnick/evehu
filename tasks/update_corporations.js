const esi = require('../models/esi.js');
const corporations = require('../models/corporations.js');

module.exports = async function (app) {
    let ids = await app.mysql.query(
        'select corporation_id from corporations ' +
        'where is_deleted != 1 and ' +
        'is_active = 1 and ' +
        '(last_update < (NOW() - INTERVAL 1 DAY) or last_update is NULL) ' +
        'limit 1000');
    await updateCorp(app, ids);

    ids = await app.mysql.query(
        'select corporation_id from corporations '+
            'where is_deleted != 1 and '+
            '(last_update is NULL or last_update < (NOW() - INTERVAL 3 DAY)) '+
            'limit 1000');
    ids = ids.map(id => id.corporation_id);

    // let ids = await app.mysql.query(
    //     'select corporation_id from corporations where alliance_id = 562593865'
    // );
    await updateCorp(app, ids);
};

async function updateCorp(app, ids) {
    if (ids.length == 0) return;
    ids = ids.map(id => id.corporation_id);
    for (const id of ids) {
        let data = await esi(app, 'corp', id);
        if (data) await corporations.update(app, id, data);

        data = await esi(app, 'corp', id + '/alliancehistory');
        if (data) await corporations.updateHistory(app, id, data);
    }
}