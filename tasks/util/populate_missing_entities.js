const esi = require('../../models/esi.js');
const characters = require('../../models/characters.js');
const fs = require('fs/promises');

const path = __dirname + '/../../max_ids/old_char_id';

module.exports = async function (app) {
    try {
        const min = parseInt((await fs.readFile(path)).toString());
        const max = 94089195;
        if (min >= max) return;

        let id = min;
        const next = min + 1000;
        let ids = await app.mysql.query(`select character_id from characters where character_id > ${min} and character_id < ${next}`);
        ids = ids.map(x => x.character_id);
        while (id < next && id < max) {
            if (!ids.includes(id)) {
                await characters.add(app, id);
            }
            id++;
        }
        await fs.writeFile(path, id.toString());
    } catch (e) {
        console.log(e);
    }
};