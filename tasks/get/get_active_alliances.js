const esi = require('../../models/esi.js');
const alliances = require('../../models/alliances.js');

module.exports = async function (app) {
    try {
        let allAlliances = await esi(app, 'alli');
        if (allAlliances === undefined) return;

        for (const id of allAlliances) {
            await alliances.add(app, id);
        }
    } catch (e) {
        console.log(e);
    }
};