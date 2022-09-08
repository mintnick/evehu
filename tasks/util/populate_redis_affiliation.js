
var m = false;
const aff = 'evehu:affiliates';
const aff_add = 'evehu:old_address';

module.exports = async function (app) {
    if (m == false) {
        m = true;
        if (parseInt(await app.redis.llen(aff)) == 0 || parseInt(await app.redis.llen(aff_add)) == 0) {
            try {
                await app.redis.del(aff);
                await app.redis.del(aff_add);
                let chars = await app.mysql.query('select character_id, corporation_id from characters where last_update < (NOW() - INTERVAL 1 DAY) and corporation_id != 1000001 order by last_update limit 100000');
                for (let i = 0; i < chars.length; i++) {
                    const row = chars[i];
                    await app.redis.rpush(aff, row.character_id);
                    await app.redis.rpush(aff_add, row.corporation_id);
                    await app.mysql.query(`update characters set last_update = NOW() where character_id = ${row.character_id}`);
                }
                console.log('Affiliate prepared ', chars.length, 'characters');
            } finally {
                m = false;
            }
        }
        
    }
}