
const corporations = require('../../models/corporations.js');

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
            'limit 100');
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
        await corporations.update(app, id);
    }
}