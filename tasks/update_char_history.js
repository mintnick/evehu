const esi = require('../models/esi.js');
const characters = require('../models/characters.js');

module.exports = async function (app, id) {
    const data = await esi(app, 'char', id + '/corporationhistory');
    if (data) await characters.updateHistory(app, id, data);
};