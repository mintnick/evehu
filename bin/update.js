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

app.sleep = (ms) => { return new Promise(resolve=>{ setTimeout(resolve,ms) });}
app.isDowntime = () => {
    const date = new Date();
    const hour = ('0' + date.getHours()).slice(-2);
    const minute = date.getMinutes();
    const time = hour + minute;
    return (time >= '1055' && time <= '1115');
}
app.isLateNight = () => {
    const date = new Date();
    const hour = date.getHours();
    return (hour > 0 && hour < 8);
}

let init = [
    // 'get/get_active_alliances.js',
    // 'get/get_alliances_corporations.js',
    // 'get/get_npc_corporations.js'

    // 'clear_characters.js',
    // 'util/rename_npc_corps.js'
]

// {filename : seconds}
let tasks = {
    // 'get/get_old_entities_char.js': 15,
    // // 'get_old_characters.js': 1, // finished
    'get/get_characters.js': 30,
    'get/get_corporations.js': 600,
    'get/get_alliances.js': 1800,

    // 'update/update_characters.js': 5,
    'update/update_corporations.js': 60,
    'update/update_alliances.js': 600,

    // 'update/update_delta.js': 14400, // (3am - 7am)
    'update/update_redis_home.js': 600,
    'update/update_char_by_affiliation.js': 10,

    // 'util/populate_missing_entities.js': 30,
    'util/populate_redis_affiliation.js': 600,
    // 'util/populate_char_history.js': 15,
};

let secondTasks = {
    'get/get_old_entities_char.js': 5,
    'util/populate_missing_entities.js': 10,
    
    'update/update_delta.js': 14400, // (3am - 7am)
};

function initialize() {
    for (const task of init) {
        let func = require('../tasks/' + task);
        func(app);
    }
}

async function runTask(task, func, app, runKey) {
    try {
        console.log(task + ' starts');
        await func(app);
    } catch (e) {
        console.log(task + ' failure:');
        console.log(e);
    } finally {
        // console.log('Finish: ' + task);
        await app.redis.del(runKey);
    }
}

async function update(app, taskList) {
    if (app.isDowntime() == false) {

        for (const [task, interval] of Object.entries(taskList)) {
            const curKey = 'crinstance:current:' + task + ":" + interval;
            const runKey = 'crinstance:running:' + task;
    
            if (await app.redis.get(curKey) != 'true' && await app.redis.get(runKey) != 'true') {
                await app.redis.setex(curKey, interval || 600, 'true');
                await app.redis.setex(runKey, 600, 'true');
    
                const func = require('../tasks/' + task);
                setTimeout(() => {runTask(task, func, app, runKey); }, 1);
            }
        }
    } else {
        console.log('server down, waiting');
        await app.sleep(300000);
    }

    if (app.debug == false) {
        if (app.isLateNight()) {
            await update(app, secondTasks);
        } else {
            await update(app, tasks);
        }
    }
}

async function clearRunKeys(app) {
    let keys = await app.redis.keys('crinstance:running*');
    for (const key of keys) await app.redis.del(key);
    
    keys = await app.redis.keys('crinstance:current*');
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