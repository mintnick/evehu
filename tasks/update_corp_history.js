const esi = require('../models/esi.js');
const corporations = require('../models/corporations.js');

module.exports = async function (app, id) {
    const data = await esi(app, 'corp', id + '/alliancehistory');
    if (data) await corporations.updateHistory(app, id, data);
};