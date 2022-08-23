// 98,000,000	99,000,000	EVE corporations created after 2010-11-03

const corporations = require('../../models/corporations.js');
const fs = require('fs/promises')
const path = '../../max_ids/corp_id';
const max = 98200000;

module.exports = async function (app) {
    try {
        await getUndefinedCorps(app);

        let id = await app.mysql.queryField('corp_id', `select max(corporation_id) corp_id from corporations where corporation_id > 98000000 and corporation_id < 99000000`);
        // id = id ?? 98000000;
        id += 1;
        // let id = parseInt(await fs.readFile(path).toString());
        const next = id + 5;
        while (id < next && id < max) {
            await corporations.add(app, id);
            id++;
        }
        // await fs.writeFile(path, id.toString());
    } catch (e) {
        console.log(e);
    }
};

async function getUndefinedCorps (app) {
    let corp_ids = await app.mysql.query(
        'select distinct(corporation_id) corp_id from corporation_history ' + 
        'where corporation_id not in ' + 
        '(select corporation_id from corporations) ' +
        'limit 10'
        );
    if (corp_ids.length > 0) {
        corp_ids = corp_ids.map(corp => corp.corp_id);
        for (const id of corp_ids) {
            await corporations.add(app, id);
        }
    }
}