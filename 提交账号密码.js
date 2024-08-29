//旁白改 偷ck注意使用
const axios = require('axios');
const { sendNotify, allEnvs, addEnvs } = require('./quantum');

const user_id = process.env.user_id;
const command = process.env.command;

(async () => {
    let USERID = null;
    let password = null;
    let remarks = null;

    try {
        const regex1 = /^(\d{11})#([\s\S]+?)#([\s\S]*)[-+]?$/;
        const regex2 = /^密码提交\+(\d{11})#([\s\S]+?)#([\s\S]*)$/;

        let match;

        match = command.match(regex1);
        if (!match) {
            match = command.match(regex2);
            if (!match) {
                throw new Error("Command format is incorrect");
            }
        }

        USERID = match[1];
        password = match[2];
        remarks = match[3];

        console.log("Extracted USERID：" + USERID);
        console.log("Extracted Password：" + password);
        console.log("Extracted Remarks：" + remarks);
        const url = `http://192.168.31.16:8000/?username=${USERID}&password=${password}`;
        const response = await axios.get(url);

        // Handling Response
        if (response.data.includes("账号或密码不正确")) {
            throw new Error("密码错误，请重新提交");
        } else if (response.data.includes("pt_key=")) {
            await sendNotify(`账号已验证成功，已保存至数据库`);
        } else if (response.data.includes("风险")) {
            throw new Error("账号密码登录风险，请发:登录 登录成功后尝试账号密码");
        }



    } catch (error) {
        const errorMessage = error.message;
        console.error(errorMessage);
        await sendNotify(" 错误信息：" + errorMessage);
        return;
    }

    console.log("USERID：" + USERID);
    console.log("Password：" + password);
    console.log("Remarks：" + remarks);



    const c = {
        Name: 'zddl',
        Enable: true,
        Value: `${USERID}#${password}#${remarks}`,
        UserRemark: USERID || '',
        UserId: user_id,
        EnvType: 2
    };

    try {
        if (USERID) {
            const data2 = await allEnvs(USERID, 2);
            if (data2.length > 0) {
                Object.assign(c, {
                    Id: data2[0].Id,
                    Weight: data2[0].Weight,
                    UserRemark: data2[0].UserRemark,
                    Remark: data2[0].Remark,
                });
            }
        } else {
            console.log("没有 USERID 参数，直接做新增处理.");
        }

        console.log('开始提交京东 CK 到量子数据库');
        const data = await addEnvs([c]);
        console.log('提交结果：' + JSON.stringify(data));
        // 假设 sendNotify 函数接收一个消息作为参数并发送通知
        await sendNotify(`京东自动登录账号提交成功！\n用户备注：${remarks || ''}\n账号：${USERID || ''}\n密码：${password || ''}\n提交成功 请发送登录 进行短信登录一次\n查询账号信息 请发:我的京东`);
    } catch (error) {
        console.error("操作失败：" + error.message);
        await sendNotify("操作失败：" + error.message);
    }
})().catch((e) => {
    console.error("脚本异常：" + e);
    sendNotify("脚本异常：" + e);
});











