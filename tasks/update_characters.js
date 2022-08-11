const esi = require('../models/esi.js');
const characters = require('../models/characters.js');

module.exports = async function (app) {
    let ids = await app.mysql.query(
        'select character_id from characters ' +
        'where is_active = 1 ' +
        'limit 100'
    );
    await updateChars(app, ids);

    ids = await app.mysql.query(
        'select character_id from characters '+
        'where '+
        '(last_update is NULL or last_update < (NOW() - INTERVAL 7 DAY)) '+
        'limit 1000');
    await updateChars(app, ids);
};

async function updateChars(app, ids) {
    if (ids.length == 0) return;
    
    ids = ids.map(id => id.character_id);
    for (const id of ids) {
        const data = await esi(app, 'char', id);
        if (data) await characters.update(app, id, data);
    }
}