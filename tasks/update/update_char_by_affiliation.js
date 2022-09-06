const esi = require('../../models/esi.js');
const characters = require('../../models/characters.js');

var flag = false;
const aff = 'evehu:affiliates';

module.exports = async function (app) {
    if (app.isDowntime()) return;

    if (flag == false) {
        flag = true;
        
        try {
            let chars = await app.redis.srandmember(aff, 1000);
            const ids = chars.map(i => parseInt(i));
            for (const char of chars) await app.redis.srem(aff, char);
            
            const data = await esi.affiliation(app, ids);
            if (!data) return;

            for (let i = 0; i < ids.length; i++) {
                const aff_corp_id = data[i].corporation_id;
                const last_corp_id = await app.mysql.queryField('corp_id', `select corporation_id corp_id from characters where character_id = ${ids[i]}`);
                if (aff_corp_id == last_corp_id) continue;
                
                await characters.update(app, ids[i]);
                await app.sleep(10);
            }
        } finally {
            flag = false;
        }
    }
}