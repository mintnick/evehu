
const corporations = require('../../models/corporations.js');

module.exports = async function (app) {
    let ids = await app.mysql.query(
        'select corporation_id from corporations '+
            'where is_deleted != 1 and '+
            'last_update < (NOW() - INTERVAL 1 DAY) '+
            'order by last_update '+
            'limit 100');
    if (ids.length == 0) return;
    ids = ids.map(id => id.corporation_id);
    for (const id of ids) await corporations.update(app, id);
};