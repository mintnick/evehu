const utf8 = require('utf8');
const app = require('../app');

module.exports = async function (req, res) {
    // const name = utf8.encode(req.query.query);
    const name = req.query.query;
    console.log(name);

    let result = [];
    const chars = await search(res, 'character', name, false);
    const corps = await search(res, 'corporation', name, false);
    const corptickers = await search(res, 'corporation', name, true);
    const allis = await search(res, 'alliance', name, false);
    const allitickers = await (search(res, 'alliance', name, true));

    if (chars.length) result = result.concat(chars);
    if (corps.length) result = result.concat(corps);
    if (corptickers.length) result = result.concat(corptickers);
    if (allis.length) result = result.concat(allis);
    if (allitickers.legnth) result = result.concat(allitickers);

    res.json({ 'suggestions': result });
}

async function search(res, type, name, ticker) {
    try {
        let secondSort = (type == 'character' ? ' ' : ', member_count desc');
        let column = (ticker ? ' ticker ' : ' name ');
        let query = `select ${type}_id id, name from ${type}s where ${column} = ? or ${column} like ? order by name ${secondSort} limit 10`;
        console.log(query);
        let result = await res.app.mysql.query(query, [name, name + '%']);

        let response = [];
        
        let groupName = '';
        switch (type) {
            case 'character':
                groupName = '角色';
                break;
            case 'corporation':
                groupName = '公司';
                break;
            case 'alliance':
                groupName = '联盟';
                break;
            default:
                break;
        }
        for (const row of result) {
            response.push({
                value: row.name,
                data: {
                    'type': type,
                    groupBy: groupName,
                    id: row.id
                }
            })
        }
        return response;
    } catch (e) {
        console.log(e);
        return [];
    }
}