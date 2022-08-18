const MySQLDB = require('../models/mysqldb.js');
const redis = require('async-redis').createClient();
const phin = require('phin').defaults({'method': 'get', 'headers': { 'User-Agent': 'evehu' }})

const app = {}

app.mysql = new MySQLDB({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'evehu'
})
app.redis = redis;
app.phin = phin;
app.debug = false;

let init = [
    // 'get_active_alliances.js',
    // 'get_alliances_corporations.js',
    // 'get_npc_corporations.js'

    // 'clear_characters.js',
]

// {filename : seconds}
let tasks = {
    // 'get_old_entities_char.js': 1,
    // 'get_old_characters.js': 1, // finished
    // 'get_characters.js': 300,
    // 'get_corporations.js': 600,
    // 'get_alliances.js': 3600,

    // 'update_characters.js': 1,
    'update_corporations.js': 1,
    // 'update_alliances.js': 3600,

    // 'update_delta.js': 14400, // (4am - 8am)
    // 'update_redis_home.js': 3600,
}

function initialize() {
    for (const task of init) {
        let func = require('../tasks/' + task);
        func(app);
    }
}

async function runTask(task, func, app, runKey) {
    try {
        // console.log('Task ' + task + ' started');
        await func(app);
    } catch (e) {
        console.log(task + ' failure:');
        console.log(e);
    } finally {
        await app.redis.del(runKey);
    }
}

async function update(app, tasks) {
    for (const [task, interval] of Object.entries(tasks)) {
        const curKey = 'crinstance:current:' + task + ":" + interval;
        const runKey = 'crinstance:running:' + task;

        if (await app.redis.get(curKey) != 'true' && await app.redis.get(runKey) != 'true') {
            await app.redis.setex(curKey, interval || 300, 'true');
            await app.redis.setex(runKey, 300, 'true');

            const func = require('../tasks/' + task);
            setTimeout(() => {runTask(task, func, app, runKey); }, 1);
        }
    }

    // if (app.debug == false) update(app, tasks);
}

async function clearRunKeys(app) {
    const keys = await app.redis.keys('crinstance:running*');
    for (const key of keys) await app.redis.del(key);
    setTimeout(() => { update(app, tasks); }, 1);
}

async function debug(task) {
    app.debug = true;
    console.log('Debugging ' + task);
    const f = require('../tasks/' + process.argv[2]);
    await runTask(process.argv[2], f, app, '0', '0');
    await app.sleep(1000);
    console.log('Exiting debug');
    process.exit();
}

// initialize();
setTimeout(() => { clearRunKeys(app); }, 1);