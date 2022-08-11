// 100,000,000	2,100,000,000	EVE characters, corporations and alliances created before 2010-11-03

const esi = require('../models/esi.js');
const characters = require('../models/characters.js');
const corporations = require('../models/corporations.js');
const alliances = require('../models/alliances.js');
const fs = require('fs');

const path = __dirname + '/../max_ids/old_entity_id'
module.exports = async function f(app) {
    try {
        let id = parseInt(fs.readFileSync(path).toString());
        const next = id + 10;
        while (id < 2100000000 && id < next) {
            id++;
            
            let data = await esi(app, 'char', id);
            if (data != undefined) characters.add(app, id, data);

            // data = await esi(app, 'corp', id);
            // if (data != undefined) {
            //     corporations.add(app, id, data);
            //     continue;
            // }

            // data = await esi(app, 'alli', id);
            // if (data) {
            //     alliances.add(app, id, data);
            // }
        }
        // console.log('max old entity id: ' + id);
        fs.writeFileSync(path, id.toString());
    } catch (e) {
        console.log(e);
    }
}
