const esi = require('../../models/esi.js');
const corporations = require('../../models/corporations.js');

module.exports = async function (app) {
    try {
        let alli_ids = await app.mysql.query('select alliance_id from alliances limit 100');
        if (alli_ids.length == 0) return;

        alli_ids = alli_ids.map(id => id.alliance_id);
        for (id of alli_ids) {
            const corp_ids = await esi(app, 'alli', id + '/corporations');
            for (const corp_id of corp_ids) {
                await corporations.add(app, corp_id);
            }
        }
    } catch (e) {
        console.log(e);
    }
};