const esi = require('../models/esi.js');
const characters = require('../models/characters.js');

module.exports = async function(app) {
    try {
        let ids = await app.mysql.query(
            'select character_id from characters '+
                'where not_update != 1 and '+
                '(history_update is NULL or history_update < (NOW() - INTERVAL 1 DAY)) '+
                'limit 1000'
            );
        ids = ids.map(id => id.character_id);
        for (const id of ids) {
            const data = await esi(app, 'char', id + '/corporationhistory')
            if (data) await characters.updateHistory(app, id, data);
        }
    } catch (e) {
        console.log(e);
    }
}