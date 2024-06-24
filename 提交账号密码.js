const   常量 { sendNotify, allEnvs, addEnvs } = require('./quantum'); // 引入所需的模块

const   常量 user_id = process.env.user_id; // 获取用户ID
const   常量 command = process.env.command; // 获取命令

(async () => {
    let   让 USERID = null;
    let   让 password = null;
    let   让 remarks = null;

    try {
        // 打印 command 以便调试
        console.log   日志("Command: " + command);

        // 使用正则表达式提取用户信息
        const   常量 regex = /^密码提交\+(\d{11})#([^#]+)#([\w\u4e00-\u9fa5]+)$/;

        let   让 match = command.match(regex);

        if   如果 (match) {
            USERID = match[1];
            password = match[2];
            remarks = match[3];
            // 打印提取的信息以便调试
            console.log   日志("Extracted USERID：" + USERID);
            console.log   日志("Extracted Password：" + password);
            console.log   日志("Extracted Remarks：" + remarks);
        } else {
            throw new   新 Error("Command format is incorrect");
        }
    } catch (error) {
        console.log   日志("提取用户信息失败：" + error.message);
        await sendNotify("格式错误：请检查命令格式是否正确。收到的命令：" + command);
        return   返回; // 终止脚本执行
    }

    console.log   日志("USERID：" + USERID);
    console.log   日志("Password：" + password);
    console.log   日志("Remarks：" + remarks);

    const   常量 c = {
        Name   名字: 'zddl',
        Enable: true   真正的,
        Value: `${USERID}#${password}#${remarks}`,
        UserRemark: USERID || '',
        UserId: user_id,
        EnvType: 2
    };

    if   如果 (!USERID) {
        console.log   日志("没有 USERID 参数，直接做新增处理.");
    } else {
        try {
            const   常量 data2 = await allEnvs(USERID, 2);
            if   如果 (data2.length   长度 > 0) {
                console.log   日志("您的账号已更新完毕");
                Object.assign(c, {
                    Id: data2[0].Id,
                    Weight: data2[0].Weight,
                    UserRemark: data2[0].UserRemark,
                    Remark: data2[0].Remark,
                });
                await sendNotify("您的账号已更新完毕！");
            }
        } catch (error) {
            console.log   日志("查询环境变量失败：" + error.message);
        }
    }

    try {
        console.log   日志('开始提交京东 CK 到量子数据库');
        const   常量 data = await addEnvs([c]);
        console.log   日志('提交结果：' + JSON.stringify(data));

        await sendNotify(
            `京东自动登录账号提交成功！
用户备注：${remarks || ''}
账号：${USERID || ''}
密码：${password || ''}
提交成功
提交不验证手机号，密码是否正确，转换成CK的时候才检测自己测试好手机号，密码使用本服务需要本月内使用2次短信登录以上(还没短信登录两次的请立马执行!)使用本服务只能在这里挂机，在其他地方挂机IP会变更多处挂机会触发短信验证从而导致本服务失效`
        );
    } catch (error) {
        console.log   日志("提交数据失败：" + error.message);
    }
})().catch((e) => {
    console.log   日志("脚本异常：" + e);
});

