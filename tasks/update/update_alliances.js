// const esi = require('../../models/esi.js');
const alliances = require('../../models/alliances.js');

module.exports = async function (app) {
    let ids = await app.mysql.query(
        'select alliance_id from alliances '+
        'where is_deleted != 1 and '+
        'last_update < (NOW() - INTERVAL 1 DAY) '+
        'order by last_update '+
        'limit 100');
    if (ids.length == 0) return;

    ids = ids.map(id => id.alliance_id);
    for (id of ids) {
        await alliances.update(app, id);
    }
};