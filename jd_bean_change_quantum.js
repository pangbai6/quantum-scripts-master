/**
 * 
偷ck版旁白
 * NO_CK_NOTIFY 没有京东ck时提示消息
 * QUERY_JD_USE_SCORE 查询所需积分。
 * QUERY_JD_USE_SCORE_TIPS 查询时用户积分不足提醒
 * QUERY_JD_USE_SCORE_TYPE  积分扣费模式，如  QUERY_JD_USE_SCORE 设置为 10 ， QUERY_JD_USE_SCORE_TYPE 为1 则查询一次 扣 10 ，如设置为2 则一个账号扣 10 , 默认 1
 * 
 */
const axios = require('axios');
const CryptoJS = require("crypto-js");
const md5 = require("md5");
const moment = require("moment")

let QUERY_JD_USE_SCORE = (process.env.QUERY_JD_USE_SCORE || 0) * 1;
let QUERY_JD_USE_SCORE_TYPE = process.env.QUERY_JD_USE_SCORE_TYPE * 1;
let QUERY_JD_USE_SCORE_TIPS = process.env.QUERY_JD_USE_SCORE_TIPS || "查询积分不足。"
let NO_CK_NOTIFY = process.env.NO_CK_NOTIFY || "未提交Cookie";


const {
    sendNotify, getCookies, api, clearProxy, getUserInfo, deductionIntegral
} = require('./quantum');

const {
    islogin, QueryJDUserInfo, GetJDUserInfoUnion
} = require('./jd_base');

//单个账号异常重试次数
var tryCount = 3;

!(async () => {

    let isQuantum = process.env.QuantumAssistantTemporaryToken && process.env.QuantumAssistantTemporaryToken.length > 0;

    let cookiesArr = [];
    if (isQuantum) {
        cookiesArr = await getCookies();
        if (cookiesArr.length == 0) {
            console.log("没有Cookies信息结束任务。");
            await sendNotify(NO_CK_NOTIFY);
            return;
        }
    } else {
        cookiesArr = [{ Value: 'pt_key=app_openAAJmGdTXADC8wyHEj1_coKZhKlewPXSxVN3OPpYoVXl95DN3c_tBRbuNYDlKYpPtyNWYWxC8kf0;pt_pin=18690725682_p;' }]
    }
    if (QUERY_JD_USE_SCORE > 0) {
        var user = (await getUserInfo()) || {};
        var deductionScore = QUERY_JD_USE_SCORE_TYPE == 1 ? QUERY_JD_USE_SCORE : cookiesArr.length * QUERY_JD_USE_SCORE;
        console.log("此次查询需要积分：" + deductionScore)
        if (!user || user.MaxEnvCount < deductionScore) {
            await sendNotify(QUERY_JD_USE_SCORE_TIPS)
            return;
        }
        await deductionIntegral(deductionScore)
        await sendNotify(`此次查询扣除积分：${deductionScore}，请稍后。`)
    }
    for (var ttt = 0; ttt < cookiesArr.length; ttt++) {
        var env = cookiesArr[ttt];
        var cookie = env.Value;
        for (var i = 0; i < tryCount; i++) {
            try {
                await QueryAccount(env);
                break;
            }
            catch (e) {
                console.log(`【${getPin(cookie)}】第${(i + 1)}次执行异常，再来一次：` + e.message);
                if (i >= tryCount) {
                    console.log(`【${getPin(cookie)}】执行异常重试上限。`);
                }
            }
        }
    }
})().catch((e) => {
    console.log("脚本执行异常：" + e.message);
    console.log(e.stack)
});


/**
 * 查询账户信息
 * @param {any} env
 */
async function QueryAccount(env) {
    var cookie = env.Value;
    var pin = getPin(cookie);
    var overdueDate = moment(env.CreateTime);
    var day = moment(new Date()).diff(overdueDate, 'day');
    var overdueDate1 = moment(env.UpdateTime).add(30, 'days');
    var day1 = overdueDate1.diff(new Date(), 'day');
    if (day1 < 0) {
        day = 0;
    }
    var overdue = `\n【您已挂机】${day}天
【预计失效】${day1}天后，${overdueDate1.format("MM月DD日")}失效。`

    var loginState = true;
    for (var i = 0; i < 5; i++) {
        try {
            loginState = await islogin(cookie);
            break;
        } catch (e) {
            clearProxy();
        }
    }
    if (!loginState) {
        await sendNotify(`账号：【${getPin(cookie)}】，失效了，请发送 登录 ！`, false, cookie.UserId);
        ss = false;
        return;
    }
    var msg = "CK不掉线 发送:自动挂机";
    try {
        msg += await TotalBean(cookie);  //账户基本信息
    } catch (e) {
        msg += "\r\n【京东账号】" + getPin(cookie)
        console.log(`【${pin}】查询账户基本信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await GoldBalance(cookie); // 极速版金币
    } catch (e) {
        console.log(`【${pin}】查询极速版金币信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await redPacket(cookie); //红包
    } catch (e) {
        console.log(`【${pin}】查询红包信息异常。`)
        console.log(e.message)
    }

    try {
        msg += await bean(cookie);// 查询京豆
    } catch (e) {
        console.log(`【${pin}】查询京豆信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await jdCash(cookie); // 领现金
    } catch (e) {
        console.log(`【${pin}】查询领现金信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await hfjifen(cookie); //权益积分
    } catch (e) {
        console.log(`【${pin}】查询权益积分信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await wanyiwan(cookie); //玩一玩
    } catch (e) {
        console.log(`【${pin}】查询玩一玩信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await chaoshika(cookie); //超市卡
    } catch (e) {
        console.log(`【${pin}】超市卡。`)
        console.log(e.message)
    }
    try {
        msg += await wangwang(cookie); //汪贝余额
    } catch (e) {
        console.log(`【${pin}】汪贝余额。`)
        console.log(e.message)
    }
    try {
        //msg += await getCoupons(cookie);  //优惠券
    } catch (e) {
        console.log(`【${pin}】查询优惠券信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await plantBean(cookie);//种豆得豆
    } catch (e) {
        console.log(`【${pin}】查询种豆得豆信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await ecard(cookie);
    } catch (e) {
        console.log(`【${pin}】查询E卡信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await getjdfruit(cookie);
    } catch (e) {
        console.log(`【${pin}】查询东东农场信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await getjdfarmhome(cookie); // 新东东农场信息
    } catch (e) {
        console.log(`【${pin}】查询新东东农场信息异常。`)
        console.log(e.message)
    }
    try {
        msg += await health(cookie);
    } catch (e) {
        console.log(`【${pin}】查询健康社区信息异常。`)
        console.log(e.message)
    }
    if (overdue) {
        msg += overdue;
    }
    console.log(msg);
    await sendNotify(msg)
}

async function wangwang(cookie) {
    const sign = `appid=jd-super-market&functionId=atop_channel_my_score&client=m&body=%7B%22bizCode%22%3A%22cn_retail_jdsupermarket%22%2C%22scenario%22%3A%22sign%22%2C%22babelChannel%22%3A%22ttt1%22%2C%22isJdApp%22%3A%221%22%2C%22isWx%22%3A%220%22%7D&t=${Date.now()}`;
    var options = {
        url: 'http://api.m.jd.com/functionId=atop_channel_my_score',
        method: 'post',
        headers: {
            'Cookie': cookie,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://pro.m.jd.com',
            'User-Agent': 'jdapp;iPhone;11.6.0;;;M/5.0;appBuild/168341;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DtvvYJq4EJvvZJG0CWTsC2PvY2UyZJHvCzHtCNPtZJS4EWG1DNrrCG%3D%3D%22%2C%22sv%22%3A%22CJCkCs41%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1719811721%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
            'Connection': 'keep-alive',
            'Referer': 'https://pro.m.jd.com',
        },
        data: sign,
        timeout: 30000
    };
    try {
        const response = await axios(options);
        const data = response.data;

        if (data.code === "0" && data.data && data.data.floorData && data.data.floorData.items) {
            const restScore = data.data.floorData.items[0].restScore || "0";
            return `\n【汪贝余额】余额：${restScore}汪贝`;
        } else {
            return '\n【汪贝余额】查询信息异常。';
        }
    } catch (error) {
        console.error('请求发生错误:', error);
        return '\n【汪贝余额】查询信息异常。';
    }
}

async function chaoshika(cookie) {
    const sign = `appid=jd-super-market&t=${Date.now()}&functionId=atop_channel_marketCard_cardInfo&client=m&uuid=&body=%7B%22babelChannel%22%3A%22ttt9%22%2C%22isJdApp%22%3A%221%22%2C%22isWx%22%3A%220%22%7D`;
    var options = {
        url: 'https://api.m.jd.com/atop_channel_marketCard_cardInfo',
        method: 'post',
        headers: {
            'Cookie': cookie,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://pro.m.jd.com',
            'User-Agent': 'jdapp;iPhone;11.6.0;;;M/5.0;appBuild/168341;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DtvvYJq4EJvvZJG0CWTsC2PvY2UyZJHvCzHtCNPtZJS4EWG1DNrrCG%3D%3D%22%2C%22sv%22%3A%22CJCkCs41%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1719811721%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
            'Connection': 'keep-alive',
            'Referer': 'https://pro.m.jd.com',
        },
        data: sign,
        timeout: 30000
    };

    try {
        const response = await axios(options);
        const data = response.data;

        if (data.code === "0" && data.data && data.data.floorData && data.data.floorData.items) {
            const marketCardVO = data.data.floorData.items[0].marketCardVO;
            const balance = marketCardVO.balance || "0.00";
            const giftGold = marketCardVO.giftGold || "0.00";
            const expirationGiftAmountDes = marketCardVO.expirationGiftAmountDes || "无即将过期赠金";

            return `\n【超市卡】余额：${balance}元，赠金：${giftGold}元，${expirationGiftAmountDes}`;
        } else {
            return '\n【超市卡】查询信息异常。';
        }
    } catch (error) {
        console.error('请求发生错误:', error);
        return '\n【超市卡】查询信息异常。';
    }
}

async function wanyiwan(cookie) {
    let sign = `functionId=wanyiwan_point_record&appid=signed_wh5&body={"pageNum":1,"version":1}&rfs=0000`;
    var options = {
        url: `https://api.m.jd.com/client.action`,
        data: sign,
        headers: {
            'Cookie': cookie,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://pro.m.jd.com',
            'User-Agent': 'jdapp;iPhone;11.6.0;;;M/5.0;appBuild/168341;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DtvvYJq4EJvvZJG0CWTsC2PvY2UyZJHvCzHtCNPtZJS4EWG1DNrrCG%3D%3D%22%2C%22sv%22%3A%22CJCkCs41%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1719811721%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
            'Connection': 'keep-alive',
            'Referer': 'https://pro.m.jd.com',
        },
        timeout: 30000,
        method: 'post'
    };

    try {
        const response = await axios(options);
        const data = response.data;

        if (data.code === 0 && data.data && data.data.bizCode === 0) {
            return `\n【玩一玩奖票】${data.data.result.totalCount}个`;
        } else {
            return '\n【玩一玩奖票】查询玩一玩信息异常。';
        }
    } catch (error) {
        console.error('请求发生错误:', error);
        return '\n【玩一玩奖票】查询玩一玩信息异常。';
    }
}


async function health(cookie) {
    let opts = {
        url: `https://api.m.jd.com/client.action?functionId=jdhealth_getHomeData&client=wh5&clientVersion=1.0.0&uuid=`,
        headers: {
            'cookie': cookie,
            'user-agent': `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`,
            'referer': 'https://h5.m.jd.com/',
            'content-type': 'application/json;charset=utf-8'
        },
        body: "body={}",
        method: "post"
    }
    let data = await api(opts).json();

    if (data.data && data.data.result && data.data.result) {
        return `\n【健康社区】${data.data.result.userScore}能量`
    }
    return '';
}


async function getjdfruitH5st() {
    var data = JSON.stringify({
        "shareCode": "123"
    });
    var config = {
        method: 'post',
        url: 'http://quantum.cqzhilai.com.cn:8001/initForFarm',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    };
    return await api(config).json()
}

async function getjdfruit(cookie) {
    var t = await getjdfruitH5st();
    const options = {
        url: `https://api.m.jd.com/client.action?functionId=initForFarm`,
        body: t.data,
        headers: {
            "accept": "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "Cookie": cookie,
            "origin": "https://home.m.jd.com",
            "pragma": "no-cache",
            "referer": "https://home.m.jd.com/myJd/newhome.action",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "User-Agent": t.ua,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        timeout: 10000,
        method: "post"
    };
    var data = await api(options).json();
    var result = {};
    if (data.farmUserPro) {
        result.farmInfo = data;
        result.JdFarmProdName = data.farmUserPro.name;
        result.JdtreeEnergy = data.farmUserPro.treeEnergy;
        result.JdtreeTotalEnergy = data.farmUserPro.treeTotalEnergy;
        result.JdwinTimes = data.farmUserPro.winTimes;
        result.treeState = data.treeState;
        let waterEveryDayT = result.JDwaterEveryDayT;
        let waterTotalT = (data.farmUserPro.treeTotalEnergy - data.farmUserPro.treeEnergy - data.farmUserPro.totalEnergy) / 10; //一共还需浇多少次水
        let waterD = Math.ceil(waterTotalT / waterEveryDayT);
        result.JdwaterTotalT = waterTotalT;
        result.JdwaterD = waterD;
    } else {
        console.log("东东农场信息获取异常：" + JSON.stringify(data));
    }
    var msg = "\n";
    var fruit = result;
    if (fruit.JdFarmProdName) {
        if (fruit.JdtreeEnergy != 0) {
            if (fruit.treeState === 2 || fruit.treeState === 3) {
                msg += `【东东农场】[${fruit.JdFarmProdName}]可以兑换了!`;
                //await sendNotify(`东东农场的【${fruit.JdFarmProdName}】已经可以兑换啦 `);
            } else {
                msg += `【东东农场】${fruit.JdFarmProdName}(${((fruit.JdtreeEnergy / fruit.JdtreeTotalEnergy) * 100).toFixed(0)}%),共种值${fruit.JdwinTimes}次,已浇水${fruit.farmInfo.farmUserPro.treeEnergy / 10}次,还需${(fruit.farmInfo.farmUserPro.treeTotalEnergy - fruit.farmInfo.farmUserPro.treeEnergy) / 10}次`;
            }
        } else {
            if (fruit.treeState === 0) {
                await sendNotify(`东东农场水果领取后未重新种植 `);
            } else if (fruit.treeState === 1) {
                msg += `【东东农场】${fruit.JdFarmProdName}种植中,共种值${fruit.JdwinTimes}次`;
            }
        }
    } else {
        msg += `【东东农场】查询异常`;
    }
    return msg;
}

async function getjdfarmhomeH5st() {
    var data = JSON.stringify({
        "functionId": "farm_home",
        "config": {
            "appid": "signed_wh5",
            "appId": "c57f6",
            "version": "4.7"
        },
        "body": {
            "version": "3"
        }
    });
    var config = {
        method: 'post',
        url: 'http://m.jing521.cn:8001/universal',//葫芦娃h5st
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    };

    return await api(config).json();
}
async function getjdfarmhome(cookie) {
    var t = await getjdfarmhomeH5st();
    const options = {
        url: `https://api.m.jd.com/client.action`,
        body: t.data,
        headers: {
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
            'cookie': cookie,
            'origin': 'https://home.m.jd.com',
            'pragma': 'no-cache',
            'referer': 'https://h5.m.jd.com/pb/015686010/Bc9WX7MpCW7nW9QjZ5N3fFeJXMH/index.html?babelChannel=ttt7',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': t.ua,
            'content-type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000,
        method: "post"
    };
    var data = await api(options).json();
    var msg = "\n";
    if (data.data && data.data.result) {
        var result = data.data.result;
        if (result.treeFullStage === 0) {
            msg += `【新农场】可能枯萎了，请重新种植！`;
        } else {
            var progressPercent = parseFloat(result.currentProcess).toFixed(2);
            var totalStages = 5;
            msg += `【新农场】种植进度${result.treeFullStage}/${totalStages}(${progressPercent}%)`;
            if (result.treeFullStage === totalStages && progressPercent >= 100) {
                msg += ` 种植完成! 商品名称：${result.skuName}`;
            }
        }
    } else {
        console.log("获取新农场信息异常：" + JSON.stringify(data));
        msg += `获取新农场信息异常`;
    }
    return msg;
}




async function ecard(cookie) {
    var balEcard = 0;
    var options = {
        url: 'https://mygiftcard.jd.com/giftcard/queryGiftCardItem/app?source=JDAP',
        body: "pageNo=1&queryType=1&cardType=-1&pageSize=20",
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh-Hans;q=0.9",
            "content-length": "44",
            "content-type": "application/x-www-form-urlencoded",
            "cookie": cookie,
            "origin": "https://mygiftcard.jd.com",
            "referer": "https://mygiftcard.jd.com/giftcardForM.html?source=JDAP&sid=9f55a224c8286baa2fe3a7545bbd411w&un_area=16_1303_48712_48758",
            "user-agent": "jdapp;iPhone;10.1.2;15.0;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"
        },
        timeout: 10000,
        method: "post"
    }
    var ECardinfo = "";
    var data = await api(options).json();
    let useable = data.couponVOList;
    if (useable) {
        for (let k = 0; k < useable.length; k++) {
            if (useable[k].balance > 0)
                balEcard += useable[k].balance;
        }
        if (balEcard)
            ECardinfo = '共' + useable.length + '张E卡,合计' + parseFloat(balEcard).toFixed(2) + '元';
    }
    if (ECardinfo)
        msg += `\n【礼卡余额】${ECardinfo}`;
    return "";
}

//种豆成长值查询
async function plantBean(cookie) {
    let options = {
        url: `https://api.m.jd.com/client.action?functionId=plantBeanIndex&body=%7B%22monitor_source%22%3A%22plant_m_plant_index%22%2C%22monitor_refer%22%3A%22%22%2C%22version%22%3A%229.2.4.2%22%7D&appid=ld&client=android&clientVersion=11.2.5&networkType=UNKNOWN&osVersion=9&uuid=`,  //${result.UUID}
        headers: {
            'cookie': cookie,
            'user-agent': `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`,
            'referer': 'https://plantearth.m.jd.com/',
            'content-type': 'application/json;charset=utf-8',
        },
        method: "get"
    }
    var result = await api(options).json();
    if (result && result.data && result.data.roundList && result.data.roundList.length > 1) {
        return `\n【种豆得豆】${result.data.roundList[1].growth}成长值,${result.data.roundList[1].dateDesc}`
    }
    return '';
}

async function getCoupons(cookie) {
    let options = {
        url: `https://wq.jd.com/activeapi/queryjdcouponlistwithfinance?state=1&wxadd=1&filterswitch=1&_=${Date.now()}&sceneval=2&g_login_type=1&callback=jsonpCBKB&g_ty=ls`,
        headers: {
            'authority': 'wq.jd.com',
            "User-Agent": "jdapp;iPhone;10.1.2;15.0;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
            'accept': '*/*',
            'referer': 'https://wqs.jd.com/',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'cookie': cookie
        },
        timeout: 10000,
        method: "get"
    }
    var response = await api(options);

    var data = response.body;

    data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
    // 删除可使用且非超市、生鲜、京贴;
    let useable = data.coupon.useable;
    var result = { message: "" };
    result.todayEndTime = new Date(new Date(new Date().getTime()).setHours(23, 59, 59, 999)).getTime();
    result.tomorrowEndTime = new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(23, 59, 59, 999)).getTime();
    result.platFormInfo = "";
    for (let i = 0; i < useable.length; i++) {
        if (useable[i].limitStr.indexOf('全品类') > -1) {
            result.beginTime = useable[i].beginTime;
            if (result.beginTime < new Date().getTime() && useable[i].quota < 20 && useable[i].coupontype === 1) {
                result.couponName = useable[i].limitStr;
                if (useable[i].platFormInfo)
                    result.platFormInfo = useable[i].platFormInfo;
                var decquota = parseFloat(useable[i].quota).toFixed(2);
                var decdisc = parseFloat(useable[i].discount).toFixed(2);

                result.message += `\n【全品类券】满${decquota}减${decdisc}元`;

                if (useable[i].endTime < result.todayEndTime) {
                    result.message += `(今日过期,${result.platFormInfo})`;
                } else if (useable[i].endTime < result.tomorrowEndTime) {
                    result.message += `(明日将过期,${result.platFormInfo})`;
                } else {
                    result.message += `\n(${result.platFormInfo})`;
                }
            }
        }
        if (useable[i].couponTitle.indexOf('运费券') > -1 && useable[i].limitStr.indexOf('自营商品运费') > -1) {
            var item = useable[i];
            var endTime = moment(new Date(parseInt(useable[i].endTime))).format('YYYY-MM-DD');
            result.message += `\n【运费券】${parseInt(item.discount)}元,过期(${endTime})`;
        }
        if (useable[i].couponTitle.indexOf('极速版APP活动') > -1 && useable[i].limitStr == '仅可购买活动商品') {
            result.beginTime = useable[i].beginTime;
            if (result.beginTime < new Date().getTime() && useable[i].coupontype === 1) {
                if (useable[i].platFormInfo)
                    result.platFormInfo = useable[i].platFormInfo;
                var decquota = parseFloat(useable[i].quota).toFixed(2);
                var decdisc = parseFloat(useable[i].discount).toFixed(2);

                result.message += `\n【极速版券】满${decquota}减${decdisc}元`;

                if (useable[i].endTime < result.todayEndTime) {
                    result.message += `(今日过期,${result.platFormInfo})`;
                } else if (useable[i].endTime < result.tomorrowEndTime) {
                    result.message += `(明日将过期,${result.platFormInfo})`;
                } else {
                    result.message += `\n(${result.platFormInfo})`;
                }
            }
        }
        //8是支付券， 7是白条券
        if (useable[i].couponStyle == 7 || useable[i].couponStyle == 8) {
            result.beginTime = useable[i].beginTime;
            if (result.beginTime > new Date().getTime() || useable[i].quota > 50 || useable[i].coupontype != 1) {
                continue;
            }

            if (useable[i].couponStyle == 8) {
                result.couponType = "支付立减";
            } else {
                result.couponType = "白条优惠";
            }
            if (useable[i].discount < useable[i].quota)
                result.message += `\n【${result.couponType}】满${useable[i].quota}减${useable[i].discount}元`;
            else
                result.message += `\n【${result.couponType}】立减${useable[i].discount}元`;
            if (useable[i].platFormInfo)
                result.platFormInfo = useable[i].platFormInfo;
            if (useable[i].endTime < result.todayEndTime) {
                result.message += `(今日过期,${result.platFormInfo})`;
            } else if (useable[i].endTime < result.tomorrowEndTime) {
                result.message += `(明日将过期,${result.platFormInfo})`;
            } else {
                result.message += `(${result.platFormInfo})`;
            }
        }
    }
    return result.message;
}

async function hfjifen(cookie) {
    let t = new Date().getTime()
    let encstr = md5(t + "e9c398ffcb2d4824b4d0a703e38yffdd")
    let opts = {
        url: `https://dwapp.jd.com/user/dwSignInfo`,
        headers: {
            'cookie': cookie,
            'user-agent': `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`,
            'referer': 'https://mypoint.jd.com/',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            't': t,
            'encStr': encstr
        }),
        method: "post"
    }
    let data = await api(opts).json();
    return `\n【话费积分】${data.data.balanceNum}积分`;
}

async function jdCash(cookie) {
    let sign = `body=%7B%7D&build=167968&client=apple&clientVersion=10.4.0&d_brand=apple&d_model=iPhone13%2C3&ef=1&eid=eidI25488122a6s9Uqq6qodtQx6rgQhFlHkaE1KqvCRbzRnPZgP/93P%2BzfeY8nyrCw1FMzlQ1pE4X9JdmFEYKWdd1VxutadX0iJ6xedL%2BVBrSHCeDGV1&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22CJO3CMeyDJCy%22%2C%22osVersion%22%3A%22CJUkDK%3D%3D%22%2C%22openudid%22%3A%22CJSmCWU0DNYnYtS0DtGmCJY0YJcmDwCmYJC0DNHwZNc5ZQU2DJc3Zq%3D%3D%22%2C%22area%22%3A%22CJZpCJCmC180ENcnCv80ENc1EK%3D%3D%22%2C%22uuid%22%3A%22aQf1ZRdxb2r4ovZ1EJZhcxYlVNZSZz09%22%7D%2C%22ts%22%3A1648428189%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%7D&isBackground=N&joycious=104&lang=zh_CN&networkType=3g&networklibtype=JDNetworkBaseAF&partner=apple&rfs=0000&scope=11&sign=98c0ea91318ef1313786d86d832f1d4d&st=1648428208392&sv=101&uemps=0-0&uts=0f31TVRjBSv7E8yLFU2g86XnPdLdKKyuazYDek9RnAdkKCbH50GbhlCSab3I2jwM04d75h5qDPiLMTl0I3dvlb3OFGnqX9NrfHUwDOpTEaxACTwWl6n//EOFSpqtKDhg%2BvlR1wAh0RSZ3J87iAf36Ce6nonmQvQAva7GoJM9Nbtdah0dgzXboUL2m5YqrJ1hWoxhCecLcrUWWbHTyAY3Rw%3D%3D`
    var options = {
        url: `https://api.m.jd.com/client.action?functionId=cash_homePage`,
        body: sign,
        headers: {
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': '',
            'User-Agent': 'JD4iPhone/167774 (iPhone; iOS 14.7.1; Scale/3.00)',
            'Accept-Language': 'zh-Hans-CN;q=1',
            'Accept-Encoding': 'gzip, deflate, br',
        },
        timeout: 10000,
        method: "post"
    }
    var data = await api(options).json();

    if (data.code === 0 && data.data.result) {
        return `\n【签到现金】${data.data.result.totalMoney}元`;
    }
    return "";
}

async function bean(cookie) {
    console.log(`查询京豆信息`)
    const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
    const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
    var page = 1;
    var t = 0;
    var yesterdayArr = [];
    var todayArr = [];
    do {
        let response = await getJingBeanBalanceDetail(cookie, page);
        if (response && response.code === "0") {
            page++;
            let detailList = response.detailList;
            if (detailList && detailList.length > 0) {
                for (let item of detailList) {
                    const date = item.date.replace(/-/g, '/') + "+08:00";
                    if (new Date(date).getTime() >= tm1) {
                        todayArr.push(item);
                    } else if (tm <= new Date(date).getTime()) {
                        //昨日的
                        yesterdayArr.push(item);
                    } else if (tm > new Date(date).getTime()) {
                        //前天的
                        t = 1;
                        break;
                    }
                }
            } else {
                console.log("数据异常");
                t = 1;
            }
        } else if (response && response.code === "3") {
            console.log(`cookie已过期，或者填写不规范，跳出`)
            t = 1;
        } else {
            console.log(`未知情况：${JSON.stringify(response)}`);
            console.log(`未知情况，跳出`)
            t = 1;
        }
    } while (t === 0);
    var resultInfo = {
        incomeBean: 0,
        expenseBean: 0,
        todayIncomeBean: 0,
        todayOutcomeBean: 0
    }
    for (let item of yesterdayArr) {
        if (Number(item.amount) > 0) {
            resultInfo.incomeBean += Number(item.amount);
        } else if (Number(item.amount) < 0) {
            resultInfo.expenseBean += Number(item.amount);
        }
    }
    for (let item of todayArr) {
        if (Number(item.amount) > 0) {
            resultInfo.todayIncomeBean += Number(item.amount);
        } else if (Number(item.amount) < 0) {
            resultInfo.todayOutcomeBean += Number(item.amount);
        }
    }
    resultInfo.todayOutcomeBean = -resultInfo.todayOutcomeBean;
    resultInfo.expenseBean = -resultInfo.expenseBean;

    var msg = ""

    if (resultInfo.todayIncomeBean != 0)
        msg += `\n【今日京豆】收${resultInfo.todayIncomeBean || 0}豆`;

    if (resultInfo.todayOutcomeBean != 0) {
        msg += `,支${resultInfo.todayOutcomeBean}豆`;
    }
    msg += `\n【昨日京豆】收${resultInfo.incomeBean}豆`;

    if (resultInfo.expenseBean != 0) {
        msg += `,支${resultInfo.expenseBean}豆`;
    }
    return msg;
}

async function redPacket(cookie) {
    const options = {
        "url": `https://api.m.jd.com/client.action?functionId=myhongbao_getUsableHongBaoList&body=%7B%22appId%22%3A%22appHongBao%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22platformId%22%3A%22appHongBao%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22platform%22%3A%221%22%2C%22orgType%22%3A%222%22%2C%22country%22%3A%22cn%22%2C%22childActivityId%22%3A%22-1%22%2C%22childActiveName%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22openId%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22eid%22%3A%22-1%22%2C%22fp%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22shshshfpb%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22activityType%22%3A%221%22%2C%22isRvc%22%3A%22-1%22%2C%22pageClickKey%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22organization%22%3A%22JD%22%7D&appid=JDReactMyRedEnvelope&client=apple&clientVersion=7.0.0`,
        "headers": {
            'Host': 'api.m.jd.com',
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Accept-Language': 'zh-cn',
            'Referer': 'https://h5.m.jd.com/',
            'Accept-Encoding': 'gzip, deflate, br',
            "Cookie": cookie,
            'User-Agent': "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"
        },
        method: "get"
    }
    var data = await api(options).json();
    var result = { message: " \n" };
    if (data) {
        result.jxRed = 0;
        result.jsRed = 0;
        result.jdRed = 0;
        result.jdhRed = 0;
        result.jdwxRed = 0;
        result.jdGeneralRed = 0;
        result.jxRedExpire = 0;
        result.jsRedExpire = 0;
        result.jdRedExpire = 0;
        result.jdhRedExpire = 0;
        result.jdwxRedExpire = 0;
        result.jdGeneralRedExpire = 0;
        let t = new Date();
        t.setDate(t.getDate() + 1);
        t.setHours(0, 0, 0, 0);
        t = parseInt((t - 1) / 1000) * 1000;
        for (let vo of data.hongBaoList || []) {
            if (vo.orgLimitStr) {
                if (vo.orgLimitStr.includes("京喜") && !vo.orgLimitStr.includes("特价")) {
                    result.jxRed += parseFloat(vo.balance)
                    if (vo['endTime'] === t) {
                        result.jxRedExpire += parseFloat(vo.balance)
                    }
                    continue;
                } else if (vo.orgLimitStr.includes("购物小程序")) {
                    result.jdwxRed += parseFloat(vo.balance)
                    if (vo['endTime'] === t) {
                        result.jdwxRedExpire += parseFloat(vo.balance)
                    }
                    continue;
                } else if (vo.orgLimitStr.includes("京东商城")) {
                    result.jdRed += parseFloat(vo.balance)
                    if (vo['endTime'] === t) {
                        result.jdRedExpire += parseFloat(vo.balance)
                    }
                    continue;
                } else if (vo.orgLimitStr.includes("极速") || vo.orgLimitStr.includes("京东特价") || vo.orgLimitStr.includes("京喜特价")) {
                    result.jsRed += parseFloat(vo.balance)
                    if (vo['endTime'] === t) {
                        result.jsRedExpire += parseFloat(vo.balance)
                    }
                    continue;
                } else if (vo.orgLimitStr && vo.orgLimitStr.includes("京东健康")) {
                    result.jdhRed += parseFloat(vo.balance)
                    if (vo['endTime'] === t) {
                        result.jdhRedExpire += parseFloat(vo.balance)
                    }
                    continue;
                }
            }
            result.jdGeneralRed += parseFloat(vo.balance)
            if (vo['endTime'] === t) {
                result.jdGeneralRedExpire += parseFloat(vo.balance)
            }
        }
        result.balance = (result.jxRed + result.jsRed + result.jdRed + result.jdhRed + result.jdwxRed + result.jdGeneralRed).toFixed(2);
        result.jxRed = result.jxRed.toFixed(2);
        result.jsRed = result.jsRed.toFixed(2);
        result.jdRed = result.jdRed.toFixed(2);
        result.jdhRed = result.jdhRed.toFixed(2);
        result.jdwxRed = result.jdwxRed.toFixed(2);
        result.jdGeneralRed = result.jdGeneralRed.toFixed(2);
        result.expiredBalance = (result.jxRedExpire + result.jsRedExpire + result.jdRedExpire + result.jdhRedExpire + result.jdwxRedExpire + result.jdGeneralRedExpire).toFixed(2);
        result.message += `【红包总额】${result.balance}(总过期${result.expiredBalance})元 `;
        if (result.jxRed > 0) {
            if (result.jxRedExpire > 0)
                result.message += ` \n【京喜红包】${result.jxRed}(将过期${result.jxRedExpire.toFixed(2)})元`;
            else
                result.message += ` \n【京喜红包】${result.jxRed}元`;
        }
        if (result.jsRed > 0) {
            if (result.jsRedExpire > 0)
                result.message += ` \n【京喜特价】${result.jsRed}(将过期${result.jsRedExpire.toFixed(2)})元(原极速版)`;
            else
                result.message += ` \n【京喜特价】${result.jsRed}元(原极速版)`;
        }
        if (result.jdRed > 0) {
            if (result.jdRedExpire > 0)
                result.message += ` \n【京东红包】${result.jdRed}(将过期${result.jdRedExpire.toFixed(2)})元`;
            else
                result.message += ` \n【京东红包】${result.jdRed}元`;
        }
        if (result.jdhRed > 0) {
            if (result.jdhRedExpire > 0)
                result.message += ` \n【健康红包】${result.jdhRed}(将过期${result.jdhRedExpire.toFixed(2)})元`;
            else
                result.message += ` \n【健康红包】${result.jdhRed}元`;
        }
        if (result.jdwxRed > 0) {
            if (result.jdwxRedExpire > 0)
                result.message += ` \n【微信小程序】${result.jdwxRed}(将过期${result.jdwxRedExpire.toFixed(2)})元`;
            else
                result.message += ` \n【微信小程序】${result.jdwxRed}元`;
        }
        if (result.jdGeneralRed > 0) {
            if (result.jdGeneralRedExpire > 0)
                result.message += ` \n【全平台通用】${result.jdGeneralRed}(将过期${result.jdGeneralRedExpire.toFixed(2)})元`;
            else
                result.message += ` \n【全平台通用】${result.jdGeneralRed}元 `;
        }
        return result.message;
    } else {
        console.log(`京东服务器返回空数据`)
        return "";
    }
}

async function getJingBeanBalanceDetail(cookie, page) {
    const options = {
        "url": `https://api.m.jd.com/client.action?functionId=getJingBeanBalanceDetail`,
        "body": `body=${escape(JSON.stringify({ "pageSize": "20", "page": page.toString() }))}&appid=ld`,
        "headers": {
            'User-Agent': "okhttp/3.12.16;jdmall;android;version/12.2.0;build/98990;",
            'Host': 'api.m.jd.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookie,
        },
        method: "post"
    }
    var data = await api(options).json();
    console.log(`查询京东返回消息：${JSON.stringify(data)}`);
    return data;
}

async function queryScores(cookie) {
    var options = {
        url: `https://rsp.jd.com/windControl/queryScore/v1?lt=m&an=plus.mobile&stamp=${Date.now()}`,
        headers: {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 8 Pro Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045715 Mobile Safari/537.36',
            'Referer': 'https://plus.m.jd.com/rights/windControl'
        }, method: "get"
    };
    var data = await api(options).json();
    return data.rs.userSynthesizeScore.totalScore;
}

async function TotalBean(cookie) {
    let jdInfo = await GetJDUserInfoUnion(cookie);
    let userInfo = {
        nickName: (jdInfo.data.userInfo.baseInfo.nickname) || getPin(cookie),
        isPlusVip: jdInfo.data.userInfo.isPlusVip,
        isRealNameAuth: jdInfo.data.userInfo.isRealNameAuth,
        beanCount: jdInfo.data.assetInfo.beanNum || 0,
    }

    let PlustotalScore = 0;
    msg = `\n【京东账号】${userInfo.nickName}`;
    if (userInfo.isRealNameAuth)
        msg += `(已实名)`;
    else
        msg += `(未实名)`;
    msg += `\n【账号信息】`;
    if (userInfo.isPlusVip) {
        msg += `Plus会员`;
        if (PlustotalScore > 0)
            msg += `(${PlustotalScore}分)`
    } else {
        msg += `普通会员`;
    }
    // if (userInfo.JingXiang) {
    //     msg += `\n京享值${userInfo.JingXiang}`;
    // }
    msg += `\n【当前京豆】${userInfo.beanCount}豆(≈${(userInfo.beanCount / 100).toFixed(2)}元)`;

    return msg;
}

async function GoldBalance(cookie) {
    var options = taskcashUrl('MyAssetsService.execute', {
        "method": "userCashRecord",
        "data": {
            "channel": 1,
            "pageNum": 1,
            "pageSize": 20
        }
    });
    options.method = "get";
    options.headers["cookie"] = cookie;
    var data = await api(options).json();
    var goldBalance = data.data.goldBalance;
    if (goldBalance)
        return `\n【特价金币】${goldBalance} 币(≈${(goldBalance / 10000).toFixed(2)}元)`
    return ""
}

function getPin(cookie) {
    return decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
}

function randomString(e) {
    e = e || 32;
    let t = "0123456789abcdef",
        a = t.length,
        n = "";
    for (let i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

function taskcashUrl(functionId, body = {}) {
    const struuid = randomString(16);
    let nowTime = Date.now();
    let key1 = `lite-android&${JSON.stringify(body)}&android&3.1.0&${functionId}&${nowTime}&${struuid}`;
    let key2 = "12aea658f76e453faf803d15c40a72e0";
    let sign = CryptoJS.HmacSHA256(key1, key2).toString();
    let strurl = "https://api.m.jd.com/client.action/api?functionId=" + functionId + "&body=" + `${escape(JSON.stringify(body))}&appid=lite-android&client=android&uuid=` + struuid + `&clientVersion=3.1.0&t=${nowTime}&sign=${sign}`;
    return {
        url: strurl,
        headers: {
            'Host': "api.m.jd.com",
            'accept': "*/*",
            'kernelplatform': "RN",
            'user-agent': "JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)",
            'accept-language': "zh-Hans-CN;q=1, ja-CN;q=0.9"
        },
        timeout: 10000
    }
}





