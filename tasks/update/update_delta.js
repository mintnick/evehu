
module.exports = async function (app) {
    // update between 4am and 8am
    const hour = (new Date()).getHours();
    if (hour < 3 || hour > 6) return;

    try {
        await app.mysql.query(
            'update corporations set '+
                'mc_7 = mc_6, mc_6 = mc_5, mc_5 = mc_4, mc_4 = mc_3, mc_3 = mc_2, mc_2 = member_count, '+
                'diff_7days = member_count - mc_7 '+
                'where is_deleted != 1'
        )

        await app.mysql.query(
            'update alliances set '+
                'mc_7 = mc_6, mc_6 = mc_5, mc_5 = mc_4, mc_4 = mc_3, mc_3 = mc_2, mc_2 = member_count, '+
                'diff_7days = member_count - mc_7 '+
                'where is_deleted != 1'
        )

        console.log('Delta updated');
    } catch (e) {
        console.log(e);
    }
};