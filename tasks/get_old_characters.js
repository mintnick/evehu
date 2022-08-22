// 90,000,000	98,000,000	EVE characters created after 2010-11-03

const esi = require('../models/esi.js');
const characters = require('../models/characters.js');
const update_char_history = require('./update_char_history.js');
const fs = require('fs/promises');

const path = __dirname + '/../max_ids/old_char_id';

module.exports = async function (app) {
    try {
        let id = parseInt((await fs.readFile(path)).toString());
        const next = id + 10;
        while (id < 98000000 && id < next) {
            let data = await esi(app, 'char', id);
            if (data != undefined) {
                await characters.add(app, id, data);
                await update_char_history(app, id);
            }
            id++;
        }
        await fs.writeFile(path, id.toString());
    } catch(e) {
        console.log(e);
    }
};