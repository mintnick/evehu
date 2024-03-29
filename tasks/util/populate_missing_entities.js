
const characters = require('../../models/characters.js');
const corporations = require('../../models/corporations.js');
const alliances = require('../../models/alliances.js');

const fs = require('fs/promises');

const path = __dirname + '/../../max_ids/old_char_id';
// const path = __dirname + '/../../max_ids/old_entity_id';

module.exports = async function (app) {
    try {
        // missing chars
        const min = parseInt((await fs.readFile(path)).toString());
        const max = 94090000;
        // const max = 2113175024;
        if (min >= max) return;

        let id = min;
        const next = min + 1000;
        let ids = await app.mysql.query(`select character_id from characters where character_id > ${min} and character_id < ${next}`);
        ids = ids.map(x => x.character_id);
        while (id < next && id < max) {
            if (!ids.includes(id)) {
                await characters.add(app, id);
            }
            id++;
        }
        await fs.writeFile(path, id.toString());

        // missing CEOs
        let ceo_ids = await app.mysql.query(`select ceo_id from corporations where ceo_id != 1 and corporation_id > 98000000 and ceo_id not in (select character_id from characters) limit 10`);
        if (ceo_ids.length > 0) {
            ceo_ids = ceo_ids.map(x => x.ceo_id);
            for (const id of ceo_ids) {
                await characters.add(app, id);
            }
        }

        // missing corp creators
        let creator_ids = await app.mysql.query('select creator_id from corporations where corporation_id > 98000000 and creator_id not in (select character_id from characters) limit 10');
        if (creator_ids.length > 0) {
            creator_ids = creator_ids.map(x => x.creator_id);
            for (const id of creator_ids) {
                await characters.add(app, id);
            }
        }

        // missing alli creators
        let alli_creator_ids = await app.mysql.query('select creator_id from alliances where creator_id not in (select character_id from characters) limit 10');
        if (alli_creator_ids.length > 0) {
            alli_creator_ids = alli_creator_ids.map(x => x.creator_id);
            for (const id of alli_creator_ids) {
                await characters.add(app, id);
            }
        }

        // missing corps
        let corp_ids = await app.mysql.query(
            'select distinct(corporation_id) corp_id from corporation_history ' + 
            'where corporation_id not in ' + 
            '(select corporation_id from corporations) ' +
            'limit 10'
        );
        if (corp_ids.length > 0) {
            corp_ids = corp_ids.map(i => i.corp_id);
            for(const id of corp_ids) await corporations.add(app, id);
        }

        // missing allis
        let alli_ids = await app.mysql.query(
            'select distinct(alliance_id) alli_id from alliance_history ' + 
            'where alliance_id not in ' + 
            '(select alliance_id from alliances) ' +
            'limit 10'
        );
        if (alli_ids.length > 0) {
            alli_ids = alli_ids.map(i => i.alli_id);
            for(const id of alli_ids) await alliances.add(app, id);
        }

        // allis with NULL member count, get its corps
        // alli_ids = await app.mysql.query(
        //     'select alliance_id from alliances '+
        //     'where is_deleted != 1 and member_count is null '+
        //     'limit 10'
        // );
        // if (alli_ids.length > 0) {
        //     alli_ids = alli_ids.map(i => i.alliance_id);
        //     for (const id of alli_ids) {
        //         const corp_ids = await esi(app, 'alli', id + '/corporations');
        //         if (corp_ids && corp_ids.length > 0) {
        //             for (const corp_id of corp_ids) {
        //                 await corporations.add(app, corp_id);
        //             }
        //         }
        //     }
        // }
    } catch (e) {
        console.log(e);
    }
};