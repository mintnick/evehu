const esi = require('../models/esi.js');
const characters = require('../models/characters.js');

module.exports = async function (app) {
    const min = 90000000, max = 94089195;
    let ids = app.mysql.query(`select character_id from characters where character_id > ${min} and character_id < ${max}`);
    ids = ids.map(x => x.character_id);
    for (let id = min; id < max; id++) {
        if (!ids.includes(id)) {
            let data = await esi(app, 'char', id);
            if (data) {
                await characters.add(app, id, data);

                data = await esi(app, 'char', id + '/corporationhistory');
                if (data) await characters.updateHistory(app, id, data);
            }
        }
    }
};