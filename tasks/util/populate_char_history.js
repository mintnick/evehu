const characters = require('../../models/characters.js');

module.exports = async function (app) {
    let ids = await app.mysql.query(
        'select character_id from characters ' +
        'where history_update is NULL ' +
        'limit 100'
    );
    if (ids.length == 0) return;
    
    ids = ids.map(id => id.character_id);
    for (const id of ids) await characters.updateHistory(app, id);
}