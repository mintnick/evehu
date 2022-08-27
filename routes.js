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
        res.set('Cache-Control', 'public, max-age=600');
        getData(req, res, next, controllerFile, pugFile)
    });
}

function addStatic(route, pugFile, title) {
    if (title == undefined) title = pugFile;
    router.get(route, (req, res, next) => {
        res.render(pugFile, {title: title});
    });
}

function addPost(route, controllerFile, pugFile) {
    if (pugFile === undefined) pugFile = controllerFile;
    router.post(route, (req, res, next) => {
        postData(req, res, next, controllerFile, pugFile)
    });
}

async function postData(req, res, next, controllerFile, pugFile) {
    try {
        const filepath = res.app.root + '/controllers/' + controllerFile + '.js';
        const controller = require(filepath);
        const data = await controller(req, res);
        if (data) res.render(pugFile, data);
        res.render('/');
    } catch (e) {
        console.log(e);
    }
}


addGet('/', 'home');
addGet('/corps/', 'corps');
addGet('/allis/', 'allis');
addGet('/character/:id', 'character');
addGet('/corporation/:id', 'corporation');
addGet('/alliance/:id', 'alliance');

addStatic('/info/', 'info', '说明');
addStatic('/donate/', 'donate', '捐赠');
addStatic('/submit/', 'submit', '添加');

addPost('/post', 'submit', 'submit')

router.get('/autocomplete/', async function(req, res, next) {
    console.log(req.query.query)
    const controller = require(res.app.root + '/controllers/autocomplete.js');
    await controller(req, res);
});

module.exports = router;