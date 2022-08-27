// 2,100,000,000	2,147,483,647	DUST characters, EVE characters created after 2016-05-30

const characters = require('../../models/characters.js');
// const fs = require('fs/promises');

const max = 2120000000;
// const path = __dirname + '../../max_ids/char_id';

module.exports = async function (app) {
    try {
        let id = await app.mysql.queryField('char_id', 'select max(character_id) char_id from characters where character_id > 2100000000 and character_id < 2147483647')
        if (!id) id = 2112000000;
        id += 1;
        // let id = parseInt(await fs.readFile(path).toString());
        const next = id + 10;
        while (id < next && id < max) {
            await characters.add(app, id);
            id++;
        }
        // await fs.writeFile(path, id.toString());
    } catch (e) {
        console.log(e);
    }
};