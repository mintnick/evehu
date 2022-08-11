const esi = require('../models/esi.js');
const corporations = require('../models/corporations.js');

module.exports = async function (app) {
    try {
        let alli_ids = await app.mysql.query('select alliance_id from alliances where last_update < (NOW() - INTERVAL 5 MINUTE)');
        alli_ids = alli_ids.map(id => id.alliance_id);
        for (id of alli_ids) {
            // console.log(id);
            const corp_ids = await esi(app, 'alli', id + '/corporations');
            // console.log(corp_ids);
            for (const corp_id of corp_ids) {
                const data = await esi(app, 'corp', corp_id);
                await corporations.add(app, corp_id, data);
            }
        }
    } catch (e) {
        console.log(e);
    }
};