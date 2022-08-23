const alliances = require('../../models/alliances.js');

module.exports = async function (app) {
    try {
        await getUndefinedAlli(app);

        let id = await app.mysql.queryField('alli_id',
        'select max(alliance_id) alli_id from alliances '+
        'where alliance_id > 99000000 and alliance_id < 100000000');
        id = id ?? 99000000;
        const next = id + 3;
        while (id < next && id < 100000000) {
            await alliances.add(app, id);
            id++;
        }
        // console.log('max alli id: ' + id);
    } catch (e) {
        console.log(e);
    }
};

async function getUndefinedAlli(app) {
    let alli_ids = await app.mysql.query(
        'select distinct(alliance_id) alli_id from alliance_history ' + 
        'where alliance_id not in ' + 
        '(select alliance_id from alliances) ' +
        'limit 10'
        );
    // console.log(corp_ids);
    if (alli_ids.length > 0) {
        alli_ids = alli_ids.map(alli => alli.alli_id);
        for (const id of alli_ids) {
            await alliances.add(app, id);
        }
    }
}