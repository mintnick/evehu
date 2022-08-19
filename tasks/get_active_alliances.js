const esi = require('../models/esi.js');
const alliances = require('../models/alliances.js');

module.exports = async function (app) {
    try {
        let allAlliances = await esi(app, 'alli');
        if (allAlliances === undefined) return;
        for (const id of allAlliances) {
            let data = await esi(app, 'alli', id);
            if (data) await alliances.add(app, id, data);
        }
    } catch (e) {
        console.log(e);
    }
};