// 100,000,000	2,100,000,000	EVE characters, corporations and alliances created before 2010-11-03

const esi = require('../models/esi.js');
const characters = require('../models/characters.js');
const update_char_history = require('./update_char_history.js');
const fs = require('fs/promises');

const path = __dirname + '/../max_ids/old_entity_id'
module.exports = async function f(app) {
    try {
        let id = parseInt((await fs.readFile(path)).toString());
        const next = id + 10;
        while (id < 2100000000 && id < next) {
            id++;
            
            let data = await esi(app, 'char', id);
            if (data != undefined) {
                await characters.add(app, id, data);
                await update_char_history(app, id);
            }
        }
        await fs.writeFile(path, id.toString());

        // let id = 102149490;
        // let data = await esi(app, 'char', id);
        // if (data != undefined) characters.add(app, id, data);
    } catch (e) {
        console.log(e);
    }
};
