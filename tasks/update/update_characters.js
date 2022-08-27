
const characters = require('../../models/characters.js');

module.exports = async function (app) {
    // let ids = await app.mysql.query(
    //     'select character_id from characters ' +
    //     'where is_active = 1 ' +
    //     'order by last_update ' +
    //     'limit 100'
    // );
    // await updateChar(app, ids);

    // let ids = await app.mysql.query(
    //     'select character_id from characters ' +
    //     'where history_update is NULL ' +
    //     'limit 100'
    // );
    // await updateChar(app, ids);

    let ids = await app.mysql.query(
        'select character_id from characters '+
        'where corporation_id != 1000001 '+
        'order by last_update '+
        'limit 100');
    if (ids.length == 0) return;

    ids = ids.map(id => id.character_id);
    for (const id of ids) await characters.update(app, id);

    // testing
    // let ids = await app.mysql.query(
    //     'select character_id from characters ' +
    //     'where corporation_id = 818701407 '
    // );
    // await updateChar(app, ids);
};

// async function updateChar(app, ids) {
//     if (ids.length == 0) return;
    
//     ids = ids.map(id => id.character_id);
//     for (const id of ids) {
//         await characters.update(app, id);
//     }
// }