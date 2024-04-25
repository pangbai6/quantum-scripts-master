/**
 * 本脚本支持环境变量 及说明
 * ADD_COOKIE_USE_SCORE  添加CK需要多少积分。（设置为0 或者 不设置时则表示不需要积分。）
 * 
 * 因 GetJDUserInfoUnion 接口限流，调整方案，先查询有效性，只要有效均保存环境变量。
 * 
 **/

let ADD_COOKIE = process.env.ADD_COOKIE || "pt_key=AAJmGTyZADDThzz5aoEz1wlfQHIAvPRcyboyLVvizY9yOK_syYXKLtOc63FFrSRBst6_meXG2II; pt_pin=jd_gnjxWdxXYJyI;";

let user_id = process.env.user_id;
let ADD_COOKIE_USE_SCORE = (process.env.ADD_COOKIE_USE_SCORE || 0) * 1;

if (process.env.JD_COOKIE) {
    jdCookies = process.env.JD_COOKIE.split("&");
}

var cookies = [];
const { sendNotify, getUserInfo, uuid, deductionIntegral
} = require('./quantum');

const { addOrUpdateJDCookie, islogin, GetJDUserInfoUnion } = require('./jd_base');

!(async () => {
    if (ADD_COOKIE_USE_SCORE > 0) {
        user = (await getUserInfo()) || {};
        if (!user || user.MaxEnvCount < ADD_COOKIE_USE_SCORE) {
            await sendNotify(`该操作需要${ADD_COOKIE_USE_SCORE}积分
您当前积分剩余：${user.MaxEnvCount}`)
            return;
        }
    }
    cookies = ADD_COOKIE.split("&");
    for (let i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        if (cookie) {
            var pt_key = "";
            var pt_pin = ""
            if (cookie.indexOf("pt_pin") < 0) {
                cookie = cookie + "pt_pin=" + uuid(8) + ";"
            }
            cookie = cookie.replace(/[\r\n]/g, "");
            try {
                pt_key = cookie.match(/pt_key=([^; ]+)(?=;?)/)[1]
                pt_pin = cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]
            }
            catch (e) {
                console.log("CK： " + cookie + "格式不对，已跳过");
                continue;
            }
            if (!pt_key || !pt_pin) {
                continue;
            }
            user_id = cookie.match(/qq=([^; ]+)(?=;?)/)
            if (user_id) {
                user_id = user_id[1];
            } else {
                user_id = process.env.user_id;
            }
            //处理pt_pin中带中文的问题
            var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
            if (reg.test(pt_pin)) {
                pt_pin = encodeURI(pt_pin);
            }
            cookie = `pt_key=${pt_key};pt_pin=${pt_pin};`
            let UserName = pt_pin
            let UserName2 = decodeURI(UserName);

            let loginState = false;
            try {
                loginState = await islogin(cookie);
            } catch (e) {
                console.log("检测CK出现异常，" + cookie);
                console.log("异常信息，" + JSON.stringify(e));
                await sendNotify("检查账号登录状态异常，建议稍后重新提交。");
                continue;
            }
            if (!loginState) {
                await sendNotify(`【${cookie}】提交失败，Cookie可能过期了`)
            }

            if (ADD_COOKIE_USE_SCORE && ADD_COOKIE_USE_SCORE > 0) {
                var result = await deductionIntegral(ADD_COOKIE_USE_SCORE)
                if (result.Code != 200) {
                    await sendNotify(result.Message);
                    return false;
                }
            }

            let nickName = UserName2;

            var jdInfo = await GetJDUserInfoUnion(cookie);
            let msg = "京东账号提交成功！";
            if (jdInfo.retcode == 0) {
                msg += `
用户等级：${jdInfo.data.userInfo.baseInfo.levelName}
剩余京豆：${jdInfo.data.assetInfo.beanNum}
京东昵称：${jdInfo.data.userInfo.baseInfo.nickname || nickName}`
                try {
                    if (jdInfo.data.assetInfo.redBalance && parseInt(jdInfo.data.assetInfo.redBalance) > 0) {
                        msg += "\r\n剩余红包：" + jdInfo.data.assetInfo.redBalance
                    }
                } catch {

                }
            } else {
                msg += `
暂无法查询账户基本信息，建议稍后查询！`
            }
            await sendNotify(msg);
            await addOrUpdateJDCookie(cookie, process.env.user_id, jdInfo.data.userInfo.baseInfo.nickname || nickName);
        }
    }
})().catch((e) => {
    console.log("addCookie.js 出现异常：" + e);
});