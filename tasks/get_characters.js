// 2,100,000,000	2,147,483,647	DUST characters, EVE characters created after 2016-05-30

const esi = require('../models/esi.js');
const characters = require('../models/characters.js');
const fs = require('fs');

const max_id = 2147483647;
const path = __dirname + '/../max_ids/char_id'

module.exports = async function (app) {
    try {
        // let id = await app.mysql.queryField('char_id', 'select max(character_id) char_id from characters where character_id > 2100000000 and character_id < ?', [max_id])
        // if (!id) id = 2100000000;
        let id = parseInt(fs.readFileSync(path).toString());
        const next = id + 10;
        while (id < max_id && id < next) {
            id++;
            let data = await esi(app, 'char', id);
            if (data) await characters.add(app, id, data);
        }
        // console.log('max char id: ' + id);
        fs.writeFileSync(path, id.toString())
    } catch (e) {
        console.log(e);
    }
};