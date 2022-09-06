const alliances = require('../../models/alliances.js');

module.exports = async function (app) {
    try {
        let id = await app.mysql.queryField('alli_id',
            'select max(alliance_id) alli_id from alliances '+
            'where alliance_id > 99000000 and alliance_id < 100000000'
            );
        id = id ?? 99000000;
        const next = id + 3;
        while (id < next && id < 100000000) {
            await alliances.add(app, id);
            id++;
        }
    } catch (e) {
        console.log(e);
    }
};
