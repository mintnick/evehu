module.exports = async function (app) {
    const names = {
        'Deep Core Mining Inc.': '深核矿业公司',
        'Caldari Provisions': '加达里后勤部',
        'Perkone': '佩克昂集团',
        'School of Applied Knowledge': '应用知识学院',
        'Science and Trade Institute': '科学及贸易学会',
        'Sebiestor Tribe': '赛毕斯托部族',
        'Brutor Tribe': '布鲁特部族',
        'Native Freshfood': '土产公司',
        'Viziam': '维鲜集团',
        'Imperial Shipment': '帝国运输',
        'Royal Amarr Institute': '艾玛皇家学院',
        'Ministry of War': '军务部',
        'The Scope': '视角传媒',
        'Aliastra': '埃拉斯多集团',
        'Garoun Investment Bank': '加罗恩投资银行',
        'University of Caille': '凯勒大学',
        'CONCORD': '统合部',
        'Hedion University': '赫迪农大学',
        'Imperial Academy': '帝国学院',
        'State War Academy': '国立军事学院',
        'Federal Navy Academy': '联邦海军学院',
        'Center for Advanced Studies': '高级教育中心',
        'Republic Military School': '共和军事学院',
        'Republic University': '共和大学',
        'Pator Tech School': '帕特工学院',
        'Polaris Corporation': '北极星',
        '24th Imperial Crusade': '帝国十字军第二十四军团',
        'State Protectorate': '合众国护卫军',
        'Federal Defense Union': '联邦防务联合会',
        'Tribal Liberation Force': '部族解放力量',
    };

    for (const [key, value] of Object.entries(names)){
        await app.mysql.query(
            `update corporations set name = "${value}" where name = "${key}" and corporation_id < 98000000`
        )
    }
};