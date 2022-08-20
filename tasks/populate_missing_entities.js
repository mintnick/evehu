const esi = require('../models/esi.js');
const characters = require('../models/characters.js');
const fs = require('fs/promises');

const path = __dirname + '/../max_ids/old_char_id';

module.exports = async function (app) {
    try {
        const min = parseInt(await (await fs.readFile(path)).toString());
        const max = 94089195;
        if (min >= max) return;

        let id = min;
        const next = min + 10;
        let ids = await app.mysql.query(`select character_id from characters where character_id > ${min} and character_id < ${max}`);
        ids = ids.map(x => x.character_id);
        while (id < next) {
            if (!ids.includes(id)) {
                let data = await esi(app, 'char', id);
                if (data) {
                    await characters.add(app, id, data);
    
                    data = await esi(app, 'char', id + '/corporationhistory');
                    if (data) await characters.updateHistory(app, id, data);
                }
            }
            id++;
        }
        await fs.writeFile(path, id.toString());
    } catch (e) {
        console.log(e);
    }
};