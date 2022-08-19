// 99,000,000	100,000,000	EVE alliances created after 2010-11-03

const esi = require('../models/esi.js');
const alliances = require('../models/alliances.js');

module.exports = async function (app) {
    try {
        await getUndefinedAlli(app);

        let id = await app.mysql.queryField('alli_id',
        'select max(alliance_id) alli_id from alliances '+
        'where alliance_id > 99000000 and alliance_id < 100000000');
        id = id ?? 99000000;
        const next = id + 3;
        while (id < 100000000 && id < next) {
            let data = await esi(app, 'alli', id);
            if (data) await alliances.add(app, id, data);
            id++;
        }
        // console.log('max alli id: ' + id);
    } catch (e) {
        console.log(e);
    }
};

async function getUndefinedAlli(app) {
    let alli_ids = await app.mysql.query(
        'select alliance_id alli_id from alliance_history a ' + 
        'where a.alliance_id not in ' + 
        '(select alliance_id from alliances) ' +
        'limit 100'
        );
    // console.log(corp_ids);
    if (alli_ids.length > 0) {
        alli_ids = alli_ids.map(alli => alli.alli_id);
        for (const id of alli_ids) {
            const data = await esi(app, 'alli', id);
            if (data) await alliances.add(app, id, data);
        }
    }
}