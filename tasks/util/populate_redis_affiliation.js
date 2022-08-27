
var m = false;

module.exports = async function (app) {
    if (m == false) {
        m = true;
        if (parseInt(await app.redis.scard('evehu:affiliates')) == 0) {
            const today = new Date().getDate().toString();
            if ((await app.redis.get('evehu:affiliates:day')) != today) {
                await app.redis.del('evehu:affiliates');
                console.log('Reset evehu:affiliates set');
                await app.redis.setex('evehu:affiliates:day', 86400, today);
            }
        }

        try {
            let chars = await app.mysql.query('select character_id from characters where (last_update < (NOW() - INTERVAL 1 DAY) or history_update is null) and corporation_id != 1000001');
            for (let i = 0; i < chars.length; i++) {
                const row = chars[i];
                await app.redis.sadd('evehu:affiliates', row.character_id);
                await app.mysql.query(`update characters set last_update = NOW() where character_id = ${row.character_id}`);
            }
            console.log('Affiliate prepared ', chars.length, 'characters');
        } finally {
            m = false;
        }
    }
}