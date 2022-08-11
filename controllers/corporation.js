async function getData(req, res) {
    return {id: req.params.id};
}

module.exports = getData