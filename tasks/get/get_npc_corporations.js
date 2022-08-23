// 1,000,000	2,000,000	NPC corporations

const corporations = require('../../models/corporations.js');

module.exports = async function (app) {
    try {
        let id = 1000000;
        while (id < 2000000) {
            await corporations.add(app, id);
            id++;
        }
    } catch (e) {
        console.log(e);
    }
};