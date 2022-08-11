const esi = require('../models/esi.js');
const corporations = require('../models/corporations.js');

module.exports = async function(app) {
    try {
        let ids = await app.mysql.query(
            'select corporation_id from corporations '+
                'where is_deleted != 1 and '+
                'corporation_id > 98000000 and '+
                '(history_update is NULL or history_update < (NOW() - INTERVAL 1 DAY)) '+
                'limit 10000'
            );
        ids = ids.map(id => id.corporation_id);
        for (const id of ids) {
            const data = await esi(app, 'corp', id + '/alliancehistory')
            if (data) await corporations.updateHistory(app, id, data);
        }
    } catch (e) {
        console.log(e);
    }
}