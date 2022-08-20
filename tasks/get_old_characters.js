// 90,000,000	98,000,000	EVE characters created after 2010-11-03

const esi = require('../models/esi.js');
const characters = require('../models/characters.js');
const fs = require('fs');

const path = __dirname + '/../max_ids/old_char_id';

module.exports = async function (app) {
    try {
        let id = parseInt(fs.readFileSync(path).toString());
        const next = id + 10;
        while (id < 98000000 && id < next) {
            let data = await esi(app, 'char', id);
            if (data != undefined) {
                await characters.add(app, id, data);

                data = await esi(app, 'char', id + '/corporationhistory');
                if (data) await characters.updateHistory(app, id, data);
            }
            id++;
        }
        // console.log('max old char id: ' + id);
        fs.writeFileSync(path, id.toString());
    } catch(e) {
        console.log(e);
    }
};