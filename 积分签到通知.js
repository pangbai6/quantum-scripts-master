const   常量 {
    api,
    getEnvs,
    sleep,
    sendNotify
} = require   需要('./quantum'   ”。/量子');

// 导入 md5 模块
const   常量 md5 = require   需要('md5');

// 生成随机字符串函数
function   函数 randomString(length) {
    const   常量 chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let   让 result = ''   ”;
    for   为 (let   让 i = 0; i < length; i++) {
        result += chars.charAt(Math.floor   地板上(Math.random   随机() * chars.length   长度));
    }
    return   返回 result;
}

// 发送通知函数，支持自定义标题和是否显示用户名
async function   函数 sendCustomNotify(message, showUserName = true   真正的, userId = null   零) {
    // 构造通知内容
    let   让 title = showUserName ? `账号名称：【${userId || "用户"}】` : ""   ”“;
    let   让 content = title ? `${title}，${message}` : message;
    // 发送通知
    await   等待 sendNotify(content, false, userId);
}

!(async () => {
    let isQuantum = process.env.QuantumAssistantTemporaryToken && process.env.QuantumAssistantTemporaryToken.length > 0;
    let cookiesArr = [];
    if (isQuantum) {
        cookiesArr = await getEnvs("JD_COOKIE", null, 2);
    } else {
        cookiesArr = [];
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        let cookie = cookiesArr[i];
        if (cookie.Value && cookie.Enable) {
            let pin = cookie.Value.match(/pt_pin=([^; ]+)(?=;?)/)[1];
            console.log(`--------------开始处理第：【${(i + 1)}】个账号：[${pin}]--------------`);

            let t = new Date().getTime();
            let encstr = md5(t + "e9c398ffcb2d4824b4d0a703e38yffdd");
            let opts = {
                url: `https://dwapp.jd.com/user/dwSignInfo`,
                headers: {
                    'cookie': cookie.Value,
                    'user-agent': `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`,
                    'referer': 'https://mypoint.jd.com/',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    't': t,
                    'encStr': encstr
                }),
                method: "post"
            };
            let data = await api(opts).json();

            // 提取 balanceNum
            let balanceNum = data.data && data.data.balanceNum ? data.data.balanceNum : null;

            if (balanceNum !== null) {
                console.log(`账号[${pin}]的 balanceNum: ${balanceNum}`);
                // 发送通知
                if (balanceNum > 13) {
                    await sendCustomNotify(`您的积分已经达到 ${balanceNum}，请及时兑换奖品以免过期。`, true, pin);
                    await sendNotify(`账号名称：【${cookie.UserRemark || pin}】，您的积分已达到兑换奖品要求及时兑换以免过期快捷地址京东积分兑话费https://mypoint.jd.com/predeem/`, false, cookie.UserId);
                    console.log(`已发送通知给用户[${pin}]`);
                }
            } else {
                console.log(`无法获取账号[${pin}]的 balanceNum`);
            }

            await sleep(1000 * 5);
        }
    }
})().catch((e) => {
    console.log("脚本异常：" + e);
});
