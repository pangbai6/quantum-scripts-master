/**
 * 
 * 用户提交饿了么CK
 * ADD_ELEMECOOKIE_USE_SCORE 添加饿了么 CK需要多少积分。（设置为0 或者 不设置时则表示不需要积分。）
 * 
 * */


let ADD_ELEMECOOKIE_USE_SCORE = (process.env.ADD_ELEMECOOKIE_USE_SCORE || 0) * 1;
const { sendNotify, allEnvs, addEnvs, getUserInfo, updateUserInfo } = require('./quantum');

let user_id = process.env.user_id; //用户id
let command = process.env.command;

!(async () => {
    var USERID = null;
    try {
        USERID = command.match(/USERID=([^; ]+)(?=;?)/)[1];
    } catch {
        console.log("提交的信息中获取USERID失败！");
    }
    console.log("USERID：" + USERID);
    var c = {
        Name: 'elmck',
        Enable: true,
        Value: command,
        UserRemark: USERID || "",
        UserId: user_id,
        EnvType: 2
    };
    if (!USERID) {
        console.log("没有 USERID 参数，直接做新增处理.");
    } else {
        let data2 = await allEnvs(USERID, 2);
        if (data2.length > 0) {
            console.log("重复的饿了么用户 CK，执行更新操作");
            c.Id = data2[0].Id;
            c.Weight = data2[0].Weight;
            c.UserRemark = data2[0].UserRemark;
            c.Remark = data2[0].Remark;
            await sendNotify("您的饿了么CK已更新完毕！");
        }
    }

    if (ADD_ELEMECOOKIE_USE_SCORE > 0) {
        let user = await getUserInfo();
        if (user) {
            user.MaxEnvCount -= ADD_ELEMECOOKIE_USE_SCORE;
            if (user.MaxEnvCount < 0) {
                await sendNotify(`该操作需要${ADD_ELEMECOOKIE_USE_SCORE}积分，您当前积分剩余${user.MaxEnvCount + ADD_ELEMECOOKIE_USE_SCORE}`);
                return;
            }
            console.log(`扣除用户积分：${ADD_ELEMECOOKIE_USE_SCORE}，剩余积分：${user.MaxEnvCount}`);
            await updateUserInfo(user);
        } else {
            console.log("获取用户信息失败，无法扣除积分。");
            return;
        }
    }

    console.log('开始提交饿了么 CK 到量子数据库');
    let data = await addEnvs([c]);
    console.log('提交结果：' + JSON.stringify(data));

    await sendNotify(
        '饿了么代挂乐园币提交成功！\n' +
        '用户ID：' + (USERID || '') +
        '\n饿了么每天数据查询请发：饿了么查询'
    );
})().catch((e) => { console.log("脚本异常：" + e); });



