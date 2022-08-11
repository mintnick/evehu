var express = require('express')
var router = express.Router()

async function getData(req, res, next, controllerFile, pugFile) {
    try {
        const filepath = res.app.root + '/controllers/' + controllerFile + '.js';
        const controller = require(filepath);
        let data = await controller(req, res);

        if (data === null || data === undefined) {
            res.sendStatus(404);
        } else if (typeof data === "object") {
            if (data.json !== undefined) res.json(data.json);
            else res.render(pugFile, data);
        } else if (typeof data === "string") {
            res.redirect(data);
        }
    } catch(e) {
        console.log(e);
    }
}

function addGet(route, controllerFile, pugFile) {
    if (pugFile === undefined) pugFile = controllerFile;
    router.get(route, (req, res, next) => {
        getData(req, res, next, controllerFile, pugFile)
    });
}

async function addStatic(route, pugFile) {
    router.get(route, (req, res, next) => {
        res.render(pugFile);
    });
}

addGet('/', 'home');
addGet('/corps/', 'corps');
addGet('/allis/', 'allis');
addGet('/character/:id', 'character');
addGet('/corporation/:id', 'corporation');
addGet('/alliance/:id', 'alliance');

addStatic('/info/', 'info');
addStatic('/donate/', 'donate');

router.get('/autocomplete/', async function(req, res, next) {
    console.log(req.query.query)
    const controller = require(res.app.root + '/controllers/autocomplete.js');
    await controller(req, res);
});

module.exports = router;