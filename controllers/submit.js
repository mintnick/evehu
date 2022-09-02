const esi = require('../models/esi.js');

exports.get = async function (req, res, next) {
    res.render('submit', {title: "补充数据"})
};

exports.post = async function (req, res, next) {
    const type = req.body.type;
    const name = req.body.name;
    let msg = "";
    let link = "";
    let style = "";

    // if already exsits
    let id = await req.app.mysql.queryField('id', `select ${type}_id id from ${type}s where name = "${name}"`);
        if (id) {
            res.redirect(`/${type}/${id}`);
            return;
    }

    id = await esi.search(req.app, type, name);
    if (id) {
        const controller = require(`../models/${type}s.js`);
        await controller.add(req.app, id);
        link = `/${type}/${id}`;
        msg = `已添加，感谢你的贡献，`;
        style = "msg-success";
    } else {
        msg = "无效的名称，请检查名称和选择的类型";
        style = "msg-fail";
    }

    res.render('submit',
        {
            title: "补充数据",
            message: msg,
            link: link,
            style: style,
        })
};