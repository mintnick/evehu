module.exports = async function (app) {
    const names = {
        'Deep Core Mining Inc.': '深核矿业公司',
        'Caldari Provisions': '加达里后勤部',
        'Perkone': '佩克昂集团',
        // 'School of Applied Knowledge': '',
        // 'Science and Trade Institute': '',
        // 'Sebiestor Tribe': '',
        // 'Brutor Tribe': '',
        // 'Native Freshfood': '',
        'Viziam': '维鲜集团',
        'Imperial Shipment': '帝国运输',
        // 'Royal Amarr Institute': '',
        'Ministry of War': '军务部',
        'The Scope': '视角传媒',
        'Aliastra': '埃拉斯多集团',
        'Garoun Investment Bank': '加罗恩投资银行',
        // 'University of Caille': '',
        // 'CONCORD': '',
        // 'Hedion University': '',
        // 'Imperial Academy': '',
        // 'State War Academy': '',
        // 'Federal Navy Academy': '',
        // 'Center for Advanced Studies': '',
        // 'Republic Military School': '',
        // 'Republic University': '',
        // 'Pator Tech School': '',
        // 'Polaris Corporation': '',
        // '24th Imperial Crusade': '',
        // 'State Protectorate': '',
        // 'Federal Defense Union': '',
        // 'Tribal Liberation Force': '',
    };

    for (const [key, value] of Object.entries(names)){
        await app.mysql.query(
            `update corporations set name = ${value} where name = ${key} and corporation_id < 98000000`
        )
    }
};