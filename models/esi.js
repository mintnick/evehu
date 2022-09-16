
const baseUrl = 'https://esi.evepc.163.com/latest/';

module.exports = async function (app, type, id) {
    let url = baseUrl;
    switch (type) {
        case 'char':
            url += 'characters/';
            break;
        case 'corp':
            url += 'corporations/';
            break;
        case 'alli':
            url += 'alliances/';
            break;
        default:
            return;
    }
    if (id === undefined) id = '';
    let res = await app.phin(url + id);
    if (res.statusCode == 200) {
        return JSON.parse(res.body);
    }
    if (type == 'char' && res.statusCode == 404 && (JSON.parse(res.body)).error == "Character has been deleted!") {
        return "deleted";
    }
    // console.log(res);
};

async function affiliation(app, ids) {
    const params = {url: baseUrl + 'characters/affiliation/', method: 'post', data: ids};
    let res = await app.phin(params);
    if (res.statusCode == 200) return JSON.parse(res.body);
};
module.exports.affiliation = affiliation;

async function search(app, type, name) {
    // https://esi.evepc.163.com/latest/search/?categories=alliance&datasource=serenity&search=The%20Army%20of%20Mango%20Alliance&strict=true
    const encodedName = encodeURI(name);
    let url = baseUrl + "search/?categories=" + type + "&datasource=serenity&search=" + encodedName + "&strict=true";
    const res = await app.phin(url);
    if (res.statusCode == 200) {
        const json = JSON.parse(res.body);
        if (json[type] != undefined) return json[type][0];
    }
};
module.exports.search = search;