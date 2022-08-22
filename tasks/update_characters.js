const esi = require('../models/esi.js');
const characters = require('../models/characters.js');
const update_char_history = require('./update_char_history.js');

module.exports = async function (app) {
    let ids = await app.mysql.query(
        'select character_id from characters ' +
        'where is_active = 1 and ' +
        'last_update < (NOW() - INTERVAL 1 DAY) ' +
        'limit 100'
    );
    await updateChar(app, ids);

    ids = await app.mysql.query(
        'select character_id from characters ' +
        'where history_update is NULL ' +
        'limit 1000'
    );
    await updateChar(app, ids);

    ids = await app.mysql.query(
        'select character_id from characters '+
        'where '+
        'last_update < (NOW() - INTERVAL 7 DAY) '+
        'limit 10000');
    await updateChar(app, ids);

    // testing
    // let ids = await app.mysql.query(
    //     'select character_id from characters ' +
    //     'where corporation_id = 818701407 '
    // );
    // await updateChar(app, ids);
};

async function updateChar(app, ids) {
    if (ids.length == 0) return;
    
    ids = ids.map(id => id.character_id);
    for (const id of ids) {
        let data = await esi(app, 'char', id);
        if (data) {
            await characters.update(app, id, data);
            await update_char_history(app, id);
        } else {

        }
    }
}