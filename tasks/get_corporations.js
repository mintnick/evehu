// 98,000,000	99,000,000	EVE corporations created after 2010-11-03

const esi = require('../models/esi.js');
const corporations = require('../models/corporations.js');
const updateHistory = require('./update_corp_history.js');
const fs = require('fs/promises')

const path = __dirname + '/../max_ids/corp_id';

module.exports = async function (app) {
    try {
        await getUndefinedCorps(app);

        let id = await app.mysql.queryField('corp_id', 'select max(corporation_id) corp_id from corporations where corporation_id > 98000000 and corporation_id < 99000000');
        id = id ?? 98000000;
        // let id = parseInt(await fs.readFile(path).toString());
        const next = id + 3;
        while (id < 98200000 && id < next) {
            let data = await esi(app, 'corp', id);
            if (data) {
                await corporations.add(app, id, data);
                await updateHistory(app, id);
            }
            id++;
        }
        // await fs.writeFile(path, id.toString());
    } catch (e) {
        console.log(e);
    }
};

async function getUndefinedCorps (app) {
    let corp_ids = await app.mysql.query(
        'select corporation_id corp_id from corporation_history c ' + 
        'where c.corporation_id not in ' + 
        '(select corporation_id from corporations) ' +
        'limit 100'
        );
    if (corp_ids.length > 0) {
        corp_ids = corp_ids.map(corp => corp.corp_id);
        for (const id of corp_ids) {
            let data = await esi(app, 'corp', id);
            if (data) {
                await corporations.add(app, id, data);
                await updateHistory(app, id);
            }
        }
    }
}