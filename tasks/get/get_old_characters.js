// 90,000,000	98,000,000	EVE characters created after 2010-11-03

const characters = require('../../models/characters.js');
const fs = require('fs/promises');

const path = '../../max_ids/old_char_id';

module.exports = async function (app) {
    try {
        let id = parseInt((await fs.readFile(path)).toString());
        const next = id + 10;
        while (id < next && id < 98000000) {
            await characters.add(app, id, data);
            id++;
        }
        await fs.writeFile(path, id.toString());
    } catch(e) {
        console.log(e);
    }
};