
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
    // console.log(res);
};

async function affiliation(app, ids) {
    const params = {url: baseUrl + 'characters/affiliation/', method: 'post', data: ids};
    let res = await app.phin(params);
    if (res.statusCode == 200) return JSON.parse(res.body);
}
module.exports.affiliation = affiliation;