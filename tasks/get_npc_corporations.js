// 1,000,000	2,000,000	NPC corporations

const esi = require('../models/esi.js');
const corporations = require('../models/corporations.js');

module.exports = async function (app) {
    try {
        let id = 1000000;
        while (id < 2000000) {
            const data = await esi(app, 'corp', id);
            if (data && data['member_count']) await corporations.add(app, id, data);
            id++;
        }
    } catch (e) {
        console.log(e);
    }
};