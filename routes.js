var express = require('express');
const app = require('./app');
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

function addGet(route, controllerFile, pugFile, age=600) {
    if (pugFile === undefined) pugFile = controllerFile;
    router.get(route, (req, res, next) => {
        res.set('Cache-Control', `public, max-age=${age}`);
        getData(req, res, next, controllerFile, pugFile)
    });
}

function addStatic(route, pugFile, title) {
    if (title == undefined) title = pugFile;
    router.get(route, (req, res, next) => {
        res.render(pugFile, {title: title});
    });
}

addGet('/', 'home');
addGet('/character/:id', 'character');
addGet('/corporation/:id', 'corporation', 'corporation', 1800);
addGet('/alliance/:id', 'alliance', 'alliance', 1800);

addStatic('/info/', 'info', '说明文档');
addStatic('/donate/', 'donate', '捐赠');
addStatic('/projects/', 'projects', '其它项目');

router.get('/autocomplete/', async function(req, res, next) {
    // console.log(req.query.query)
    const controller = require(res.app.root + '/controllers/autocomplete.js');
    await controller(req, res);
});

// form routes
const submitController = require('./controllers/submit.js');
router.get('/submit', submitController.get);
router.post('/submit', submitController.post);
// router.post('/submit', (req, res, next) => {
//     console.log(req)
// });

module.exports = router;