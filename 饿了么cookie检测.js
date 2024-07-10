const { getEnvs, disableEnvs } = require("./quantum");
const axios = require('axios');

async function getUserDetail(cookie) {
    try {
        const response = await axios({
            method: 'GET',
            url: 'https://restapi.ele.me/eus/v5/user_detail',
            headers: {
                'Referer': 'https://h5.ele.me/',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604',
                'Cookie': cookie
            }
        });

        return response.data;
    } catch (error) {
        // 检查错误状态码，如果是401，则返回 null 表示账号已过期
        if (error.response && error.response.status === 401) {
            return null;
        } else {
            throw new Error(`请求用户详情时发生错误: ${error.message}`);
        }
    }
}

async function main() {
    try {
        const accounts = await getEnvs("elmck", null, 2);
        console.log(`饿了么账号数量: ${accounts.length}`);

        const expiredCookies = [];
        const validAccounts = [];

        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];

            if (account.Value && account.Enable) {
                const cookie = account.Value;
                const USERID = cookie.match(/USERID=([^; ]+)(?=;?)/)[1];
                const decodedUserId = decodeURI(USERID);

                console.log(`开始检测【饿了么账号${i}】${decodedUserId}...`);

                try {
                    const userInfo = await getUserDetail(cookie);

                    if (userInfo === null) {
                        // 如果返回 null，表示账号已过期
                        expiredCookies.push(cookie);
                    } else {
                        // 返回了数据，标记为正常账号
                        validAccounts.push(account);
                        console.log("用户详情:", userInfo);
                    }
                } catch (error) {
                    console.error(`请求用户详情时发生错误 (用户${decodedUserId}):`, error);
                }
            }
        }

        if (expiredCookies.length > 0) {
            console.log("禁用失效返回结果:", await disableEnvs(expiredCookies));
        } else {
            console.log("无过期CK.");
        }
    } catch (error) {
        console.error("执行主程序时发生错误:", error);
    }
}

main();

