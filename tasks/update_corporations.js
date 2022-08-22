const esi = require('../models/esi.js');
const corporations = require('../models/corporations.js');
const updateHistory = require('./update_corp_history.js');

module.exports = async function (app) {
    let ids = await app.mysql.query(
        'select corporation_id from corporations ' +
        'where is_deleted != 1 and ' +
        'is_active = 1 and ' +
        'last_update < (NOW() - INTERVAL 1 DAY) ' +
        'limit 100');
    await updateCorp(app, ids);

    ids = await app.mysql.query(
        'select corporation_id from corporations '+
            'where is_deleted != 1 and '+
            'last_update < (NOW() - INTERVAL 7 DAY) '+
            'limit 1000');
    await updateCorp(app, ids);

    // let ids = await app.mysql.query(
    //     'select corporation_id from corporations where alliance_id = 99000373'
    // );
    // await updateCorp(app, ids);
};

async function updateCorp(app, ids) {
    if (ids.length == 0) return;
    ids = ids.map(id => id.corporation_id);
    for (const id of ids) {
        let data = await esi(app, 'corp', id);
        if (data) {
            if (data['ceo_id'] == 1) data['name'] = data['name'] + '(已关闭)';
            await corporations.update(app, id, data);
            if (data['ceo_id'] != 1 && id > 98000000) await updateHistory(app, id);
        }
    }
}