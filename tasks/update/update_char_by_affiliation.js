const esi = require('../../models/esi.js');
const characters = require('../../models/characters.js');

var flag = false;
const aff = 'evehu:affiliates';
const aff_add = 'evehu:old_address';

module.exports = async function (app) {
    if (app.isDowntime()) return;

    if (flag == false) {
        flag = true;
        
        try {
            let chars = await app.redis.lpop(aff, 100);
            let adds = await app.redis.lpop(aff_add, 100);
            if (!chars) return;

            const ids = chars.map(i => parseInt(i));
            const old_add_ids = adds.map(i => parseInt(i));

            // store the char - corp pair, because the response from affiliates can be random order
            const old_data = {};
            for (let i = 0; i < ids.length; i++) {
                old_data[ids[i]] = old_add_ids[i];
            }
            
            const data = await esi.affiliation(app, ids);
            if (!data) return;
            // console.log(data);

            for (let i = 0; i < ids.length; i++) {
                const char_id = data[i].character_id;
                const aff_corp_id = data[i].corporation_id;
                const old_corp_id = old_data[char_id];
                // console.log(ids[i] + ' : ' +aff_corp_id + ' : ' + old_corp_id);
                // const last_corp_id = await app.mysql.queryField('corp_id', `select corporation_id corp_id from characters where character_id = ${ids[i]}`);
                if (aff_corp_id == old_corp_id) continue;
                await characters.update(app, ids[i]);
            }
        } finally {
            flag = false;
        }
    }
}