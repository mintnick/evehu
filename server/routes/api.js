var express = require('express');
var router = express.Router();

const getById = require('./getById')

router.get('/:type/:id', (req, res) => {
  const type = req.params.type, id = Number(req.params.id);
  if (['alliance', 'corporation', 'character'].includes(type) && Number.isInteger(id)) {
    res.send(getById(type, id));
  }
  else {
    res.sendStatus(404);
  }
});



module.exports = router