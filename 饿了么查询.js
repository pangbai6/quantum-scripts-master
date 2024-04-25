const {
    sendNotify,
    getCookies,
    api,
    clearProxy,
    getUserInfo,
    deductionIntegral,
    getEnvs,
    getCustomData
} = require("./quantum"),
    moment = require("moment");

var tryCount = 1;
!(async () => {
    var _0x4bc58b = await getEnvs("elmck", "SID", 2, process.env.user_id);

    if (_0x4bc58b.length == 0) {
        console.log("没有Cookies信息结束任务。");
        await sendNotify("您还没有提交饿了么账号 发送:饿了么代挂  开启代挂之旅");
        return;
    }

    for (var _0x15eab0 = 0; _0x15eab0 < _0x4bc58b.length; _0x15eab0++) {
        var _0x41d17b = _0x4bc58b[_0x15eab0],
            _0x206700 = _0x41d17b.Value;

        for (var _0x514dcf = 0; _0x514dcf < tryCount; _0x514dcf++) {
            try {
                await QueryAccount(_0x41d17b);
                break;
            } catch (_0x2ecb61) {
                console.log("【" + getUSERID(_0x206700) + "】第" + (_0x514dcf + 1) + "次执行异常，再来一次：" + _0x2ecb61.message);

                if (_0x514dcf >= tryCount) {
                    console.log("【" + getUSERID(_0x206700) + "】执行异常重试上限。");
                }
            }
        }
    }
})().catch(_0x529922 => {
    console.log("脚本执行异常：" + _0x529922.message);
    console.log(_0x529922.stack);
});

async function QueryAccount(_0x44aff5) {
    var _0xc2fc = _0x44aff5.Value,
        _0xac55b9 = getUSERID(_0xc2fc),
        _0x497cf0 = moment(_0x44aff5.CreateTime),
        _0x26379b = moment(new Date()).diff(_0x497cf0, "day"),
        _0x336191 = moment(_0x44aff5.UpdateTime).add(3, "days"),
        _0x42dcea = _0x336191.diff(new Date(), "day");

    _0x42dcea < 0 && (_0x26379b = 0);

    var _0x1dfc8b = "\n【您已挂机】" + _0x26379b + "天\n【预计失效】" + _0x42dcea + "天后，" + _0x336191.format("MM月DD日"),
        _0x4eb901 = "【温馨提示】如每天低于1000乐园币 发:饿了么攻略。饿了么抓ck回复：饿了么代挂\n【用户ID】" + _0xac55b9;

    try {
        _0x4eb901 += await elmapi(_0xc2fc);
    } catch (_0x4eb8e2) {
        _0x4eb901 += "\n【CK状态】已失效,请重新提交";
        console.log("【" + _0xac55b9 + "】查询账户基本信息异常。");
        console.log(_0x4eb8e2.message);
        await sendNotify(_0x4eb901);
        return;
    }

    try {
        _0x4eb901 += await elmauthentication(_0xc2fc);
    } catch (_0xef4b9a) {
        console.log("【" + _0xac55b9 + "】查询账户实名状态异常。");
        console.log(_0xef4b9a.message);
    }

    try {
        svip = await elmfoodiesvip(_0xc2fc);
        svip.indexOf("undefined") > -1 ? console.log("【" + _0xac55b9 + "】查询账户吃货咯会员异常。") : _0x4eb901 += svip;
    } catch (_0x544e17) {
        console.log("【" + _0xac55b9 + "】查询账户吃货咯会员异常。");
        console.log(_0x544e17.message);
    }

    try {
        _0x4eb901 += await elmsvip(_0xc2fc);
    } catch (_0x15fcfc) {
        console.log("【" + _0xac55b9 + "】查询账户会员svip异常。");
        console.log(_0x15fcfc.message);
    }

    try {
        _0x4eb901 += await elmbbfapi(_0xc2fc);
    } catch (_0x1eb12a) {
        console.log("【" + _0xac55b9 + "】查询账户笔笔返异常。");
        console.log(_0x1eb12a.message);
    }

    try {
        _0x4eb901 += await elmxqapi(_0xc2fc);
    } catch (_0x337015) {
        console.log("【" + _0xac55b9 + "】查询账户今日豆豆异常。");
        console.log(_0x337015.message);
    }

    try {
        _0x4eb901 += await elmxqapi1(_0xc2fc);
    } catch (_0x403095) {
        console.log("【" + _0xac55b9 + "】查询账户本月豆豆异常。");
        console.log(_0x403095.message);
    }

    try {
        _0x4eb901 += await elmtodaylyb(_0xc2fc);
    } catch (_0x13d664) {
        console.log("【" + _0xac55b9 + "】查询账户今日乐园币异常。");
        console.log(_0x13d664.message);
    }

    try {
        _0x4eb901 += await elmlyb(_0xc2fc);
    } catch (_0xb71c7a) {
        console.log("【" + _0xac55b9 + "】查询账户乐园币异常。");
        console.log(_0xb71c7a.message);
    }

    _0x1dfc8b && (_0x4eb901 += _0x1dfc8b);
    console.log(_0x4eb901);
    await sendNotify(_0x4eb901);
}

async function elmapi(_0x15aac4) {
    let _0xc6f5a6 = {
        "url": "https://restapi.ele.me/eus/v5/user_detail",
        "headers": {
            "Referer": "https://h5.ele.me/",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604",
            "Cookie": _0x15aac4
        },
        "method": "get"
    },
        _0x14db17 = await api(_0xc6f5a6).json();

    return "\n【CK状态】有效\n【用户昵称】" + _0x14db17.username + "\n【手机尾号】" + _0x14db17.mobile.match(/\d{4}$/)[0];
}

async function elmbbfapi(_0x5e495c) {
    let _0x46bb48 = {
        "url": "https://wallet.ele.me/api/storedcard/queryBalanceBycardType?cardType=platform",
        "headers": {
            "Referer": "https://h5.ele.me/",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604",
            "Cookie": _0x5e495c
        },
        "method": "get"
    },
        _0x447401 = await api(_0x46bb48).json();

    return "\n【笔笔返利】" + _0x447401.data.totalAvailableAmount / 100;
}

async function elmxqapi(_0x206b95) {
    let _0x4e6876 = {
        "url": "https://h5.ele.me/restapi/svip_biz/v1/supervip/foodie/records?offset=0&limit=100&longitude=116.397128&latitude=39.916527",
        "headers": {
            "Referer": "https://h5.ele.me/",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604",
            "Cookie": _0x206b95
        },
        "method": "get"
    },
        _0x209cf7 = await api(_0x4e6876).json(),
        _0x4cb406 = 0;

    if (_0x209cf7.records.length !== 0) {
        const _0x3700ed = moment().format("YYYY-MM-DD");

        for (var _0xed0c3d = 0; _0xed0c3d < _0x209cf7.records.length; _0xed0c3d++) {
            if (moment(_0x209cf7.records[_0xed0c3d].createdTime).format("YYYY-MM-DD") === _0x3700ed) {
                _0x4cb406 += _0x209cf7.records[_0xed0c3d].count;
            }
        }
    }

    return "\n【当前豆豆】" + _0x209cf7.peaCount + "\n【今日豆豆】" + _0x4cb406;
}

async function elmxqapi1(_0x19db94) {
    let _0x87e149 = {
        "url": "https://h5.ele.me/restapi/svip_biz/v1/supervip/foodie/records?offset=0&limit=100&longitude=116.397128&latitude=39.916527",
        "headers": {
            "Referer": "https://h5.ele.me/",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604",
            "Cookie": _0x19db94
        },
        "method": "get"
    },
        _0x47dcb1 = await api(_0x87e149).json();

    var _0x1ecc8b = new Date(),
        _0x2d6426 = _0x1ecc8b.getFullYear().toString();

    var _0x413c3f = _0x1ecc8b.getMonth() + 1;

    if (_0x413c3f < 10) {
        _0x413c3f = "0" + _0x413c3f;
    }

    var _0x42d9cf = _0x1ecc8b.getDate();

    _0x42d9cf < 10 && (_0x42d9cf = "0" + _0x42d9cf);

    var _0x16f473 = _0x2d6426 + _0x413c3f;

    return "\n【本月豆豆】" + _0x47dcb1.monthAccountInfo[_0x16f473].plusCount;
}

async function elmlyb(_0x385a10) {
    var _0xca4f2d = {
        "templateIds": "[\"1404\"]"
    },
        _0x19cb40 = Date.now();

    sign = map("a8b654ea8b2d8897556edb7eed592e4e", _0x19cb40, _0xca4f2d);

    let _0x372f10 = {
        "url": "https://mtop.ele.me/h5/mtop.koubei.interaction.center.common.queryintegralproperty.v2/1.0/?jsv=2.7.0&appKey=12574478&t=" + _0x19cb40 + "&sign=" + sign + "&api=mtop.koubei.interaction.center.common.queryintegralproperty.v2&v=1.0&ecode=1&type=json&valueType=string&needLogin=true&LoginRequest=true&dataType=jsonp",
        "method": "post",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0x385a10
        },
        "body": "data=%7B%22templateIds%22%3A%22%5B%5C%221404%5C%22%5D%22%7D"
    },
        _0x4779b8 = await api(_0x372f10);

    var _0x524e94 = _0x4779b8.headers,
        _0x4b0dbd = JSON.stringify(_0x524e94),
        _0x55bc5d = _0x4b0dbd.match(/_m_h5_tk=([^_]+)/)[1],
        _0x32891b = /_m_h5_tk=[0-9a-f]+_[0-9]+;/,
        _0x213b46 = /_m_h5_tk_enc=[0-9a-f]+;/,
        _0x14a1bc = _0x4b0dbd.match(_0x32891b)[0],
        _0x25f363 = _0x4b0dbd.match(_0x213b46)[0];

    _0x385a10 = _0x385a10.replace(/_m_h5_tk=[^;]+;?/, "");
    _0x385a10 = _0x385a10.replace(/_m_h5_tk_enc=[^;]+;?/, "");
    _0x385a10 = _0x14a1bc + _0x25f363 + _0x385a10;
    sign = map(_0x55bc5d, _0x19cb40, _0xca4f2d);

    let _0x49b41b = {
        "url": "https://mtop.ele.me/h5/mtop.koubei.interaction.center.common.queryintegralproperty.v2/1.0/?jsv=2.7.0&appKey=12574478&t=" + _0x19cb40 + "&sign=" + sign + "&api=mtop.koubei.interaction.center.common.queryintegralproperty.v2&v=1.0&ecode=1&type=json&valueType=string&needLogin=true&LoginRequest=true&dataType=jsonp",
        "method": "post",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0x385a10
        },
        "body": "data=%7B%22templateIds%22%3A%22%5B%5C%221404%5C%22%5D%22%7D"
    },
        _0x19fae0 = await api(_0x49b41b);

    var _0x5041ee = JSON.parse(_0x19fae0.body),
        _0x4217f5 = _0x5041ee.data.data["1404"].count;

    return "\n【总乐园币】" + _0x4217f5;
}

async function elmtodaylyb(_0x314671) {
    var _0x4cce5b = {
        "templateId": "1404",
        "bizScene": "game_center",
        "convertType": "GAME_CENTER",
        "startTime": "2023-7-16 00:00:00",
        "pageNo": 1,
        "pageSize": "20"
    },
        _0xb6d05d = Date.now();

    sign = map("a8b654ea8b2d8897556edb7eed592e4e", _0xb6d05d, _0x4cce5b);

    let _0x255221 = {
        "url": "https://mtop.ele.me/h5/mtop.koubei.interaction.center.common.querypropertydetail/1.0/5.0/?jsv=2.7.1&appKey=12574478&t=" + _0xb6d05d + "&sign=" + sign + "&api=mtop.koubei.interaction.center.common.querypropertydetail&v=1.0&ecode=1&type=json&valueType=string&needLogin=true&LoginRequest=true&dataType=jsonp",
        "method": "post",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0x314671
        },
        "body": "data=%7B%22templateId%22%3A%221404%22%2C%22bizScene%22%3A%22game_center%22%2C%22convertType%22%3A%22GAME_CENTER%22%2C%22startTime%22%3A%222023-7-16%2000%3A00%3A00%22%2C%22pageNo%22%3A1%2C%22pageSize%22%3A%2220%22%7D"
    },
        _0x2f921c = await api(_0x255221);

    var _0x480656 = _0x2f921c.headers,
        _0x464e29 = JSON.stringify(_0x480656),
        _0x5ed82 = _0x464e29.match(/_m_h5_tk=([^_]+)/)[1],
        _0x1d8cc3 = /_m_h5_tk=[0-9a-f]+_[0-9]+;/,
        _0x477d7c = /_m_h5_tk_enc=[0-9a-f]+;/,
        _0x3c15ec = _0x464e29.match(_0x1d8cc3)[0],
        _0xb81730 = _0x464e29.match(_0x477d7c)[0];

    _0x314671 = _0x314671.replace(/_m_h5_tk=[^;]+;?/, "");
    _0x314671 = _0x314671.replace(/_m_h5_tk_enc=[^;]+;?/, "");
    _0x314671 = _0x3c15ec + _0xb81730 + _0x314671;
    sign = map(_0x5ed82, _0xb6d05d, _0x4cce5b);

    let _0x509802 = {
        "url": "https://mtop.ele.me/h5/mtop.koubei.interaction.center.common.querypropertydetail/1.0/5.0/?jsv=2.7.1&appKey=12574478&t=" + _0xb6d05d + "&sign=" + sign + "&api=mtop.koubei.interaction.center.common.querypropertydetail&v=1.0&ecode=1&type=json&valueType=string&needLogin=true&LoginRequest=true&dataType=jsonp",
        "method": "post",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0x314671
        },
        "body": "data=%7B%22templateId%22%3A%221404%22%2C%22bizScene%22%3A%22game_center%22%2C%22convertType%22%3A%22GAME_CENTER%22%2C%22startTime%22%3A%222023-7-16%2000%3A00%3A00%22%2C%22pageNo%22%3A1%2C%22pageSize%22%3A%2220%22%7D"
    },
        _0x3d7289 = await api(_0x509802);

    var _0x47b815 = JSON.parse(_0x3d7289.body),
        _0x55ada8 = 0,
        _0x1fb15a = 0;

    for (var _0x5c0f43 = 0; _0x5c0f43 < _0x47b815.data.list.length; _0x5c0f43++) {
        _0x47b815.data.list[_0x5c0f43].detailType == "GRANT" && _0x47b815.data.list[_0x5c0f43].gmtModified > moment().format("YYYY-MM-DD") && (_0x55ada8 += parseInt(_0x47b815.data.list[_0x5c0f43].amount));
        _0x47b815.data.list[_0x5c0f43].detailType == "REDUCE" && _0x47b815.data.list[_0x5c0f43].gmtModified > moment().format("YYYY-MM-DD") && (console.log(_0x47b815.data.list[_0x5c0f43].gmtModified), _0x1fb15a += parseInt(_0x47b815.data.list[_0x5c0f43].amount));
    }

    var _0x4cce5b = {
        "templateId": "1404",
        "bizScene": "game_center",
        "convertType": "GAME_CENTER",
        "startTime": "2023-7-16 00:00:00",
        "pageNo": 2,
        "pageSize": "20"
    },
        _0xb6d05d = Date.now();

    sign = map("a8b654ea8b2d8897556edb7eed592e4e", _0xb6d05d, _0x4cce5b);

    let _0x36a74b = {
        "url": "https://mtop.ele.me/h5/mtop.koubei.interaction.center.common.querypropertydetail/1.0/5.0/?jsv=2.7.1&appKey=12574478&t=" + _0xb6d05d + "&sign=" + sign + "&api=mtop.koubei.interaction.center.common.querypropertydetail&v=1.0&ecode=1&type=json&valueType=string&needLogin=true&LoginRequest=true&dataType=jsonp",
        "method": "post",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0x314671
        },
        "body": "data=%7B%22templateId%22%3A%221404%22%2C%22bizScene%22%3A%22game_center%22%2C%22convertType%22%3A%22GAME_CENTER%22%2C%22startTime%22%3A%222023-7-16%2000%3A00%3A00%22%2C%22pageNo%22%3A1%2C%22pageSize%22%3A%2220%22%7D"
    },
        _0xe68d06 = await api(_0x36a74b);

    var _0x480656 = _0xe68d06.headers,
        _0x464e29 = JSON.stringify(_0x480656),
        _0x5ed82 = _0x464e29.match(/_m_h5_tk=([^_]+)/)[1],
        _0x1d8cc3 = /_m_h5_tk=[0-9a-f]+_[0-9]+;/,
        _0x477d7c = /_m_h5_tk_enc=[0-9a-f]+;/,
        _0x3c15ec = _0x464e29.match(_0x1d8cc3)[0],
        _0xb81730 = _0x464e29.match(_0x477d7c)[0];

    _0x314671 = _0x314671.replace(/_m_h5_tk=[^;]+;?/, "");
    _0x314671 = _0x314671.replace(/_m_h5_tk_enc=[^;]+;?/, "");
    _0x314671 = _0x3c15ec + _0xb81730 + _0x314671;
    sign = map(_0x5ed82, _0xb6d05d, _0x4cce5b);

    let _0x3fdf56 = {
        "url": "https://mtop.ele.me/h5/mtop.koubei.interaction.center.common.querypropertydetail/1.0/5.0/?jsv=2.7.1&appKey=12574478&t=" + _0xb6d05d + "&sign=" + sign + "&api=mtop.koubei.interaction.center.common.querypropertydetail&v=1.0&ecode=1&type=json&valueType=string&needLogin=true&LoginRequest=true&dataType=jsonp",
        "method": "post",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0x314671
        },
        "body": "data=%7B%22templateId%22%3A%221404%22%2C%22bizScene%22%3A%22game_center%22%2C%22convertType%22%3A%22GAME_CENTER%22%2C%22startTime%22%3A%222023-7-16%2000%3A00%3A00%22%2C%22pageNo%22%3A2%2C%22pageSize%22%3A%2220%22%7D"
    },
        _0x2407f2 = await api(_0x3fdf56);

    var _0x3dc1ab = JSON.parse(_0x2407f2.body);

    for (var _0x5c0f43 = 0; _0x5c0f43 < _0x3dc1ab.data.list.length; _0x5c0f43++) {
        _0x3dc1ab.data.list[_0x5c0f43].detailType == "GRANT" && _0x3dc1ab.data.list[_0x5c0f43].gmtModified > moment().format("YYYY-MM-DD") && (_0x55ada8 += parseInt(_0x3dc1ab.data.list[_0x5c0f43].amount));

        if (_0x3dc1ab.data.list[_0x5c0f43].detailType == "REDUCE") {
            if (_0x3dc1ab.data.list[_0x5c0f43].gmtModified > moment().format("YYYY-MM-DD")) {
                _0x1fb15a += parseInt(_0x3dc1ab.data.list[_0x5c0f43].amount);
            }
        }
    }

    if (_0x1fb15a > 0) return "\n【今日乐币】" + _0x55ada8 + "\n【今日支出】" + _0x1fb15a;
    return "\n【今日乐币】" + _0x55ada8;
}

async function elmsvip(_0x572eb0) {
    var _0x5082cf = {
        "latitude": 35.676396,
        "longitude": 139.654405,
        "gpsLatitude": 35.676396,
        "gpsLongitude": 139.654405
    },
        _0x3de011 = Date.now();

    sign = map("a8b654ea8b2d8897556edb7eed592e4e", _0x3de011, _0x5082cf);

    let _0x4aafdf = {
        "url": "https://waimai-guide.ele.me/h5/mtop.alsc.svip.usergrowth.getrankdetails/1.0/5.0/?jsv=2.7.1&appKey=12574478&t=" + _0x3de011 + "&sign=" + sign + "&api=mtop.alsc.svip.usergrowth.getRankDetails&type=originaljson&needLogin=true&gpsLocation=true&ttid=true&umidToken=true&v=1.0&timeout=8000&dangerouslySetWindvaneParams=%7B%22instanceid%22%3A%22INNER%22%7D&dataType=json&xua=true&location=true&valueType=original&pageUrl=https%3A%2F%2Fair.tb.ele.me&H5Request=true&SV=5.0&data=%7B%22latitude%22%3A35.676396%2C%22longitude%22%3A139.654405%2C%22gpsLatitude%22%3A35.676396%2C%22gpsLongitude%22%3A139.654405%7D",
        "method": "get",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0x572eb0
        }
    },
        _0x557c9a = await api(_0x4aafdf);

    var _0x4dbd9b = _0x557c9a.headers,
        _0x428d79 = JSON.stringify(_0x4dbd9b),
        _0x1fa8c8 = _0x428d79.match(/_m_h5_tk=([^_]+)/)[1],
        _0x4cbd2c = /_m_h5_tk=[0-9a-f]+_[0-9]+;/,
        _0x3bf0a1 = /_m_h5_tk_enc=[0-9a-f]+;/,
        _0x10eb31 = _0x428d79.match(_0x4cbd2c)[0],
        _0x46d4ba = _0x428d79.match(_0x3bf0a1)[0];

    _0x572eb0 = _0x572eb0.replace(/_m_h5_tk=[^;]+;?/, "");
    _0x572eb0 = _0x572eb0.replace(/_m_h5_tk_enc=[^;]+;?/, "");
    _0x572eb0 = _0x10eb31 + _0x46d4ba + _0x572eb0;
    sign = map(_0x1fa8c8, _0x3de011, _0x5082cf);

    let _0x35b396 = {
        "url": "https://waimai-guide.ele.me/h5/mtop.alsc.svip.usergrowth.getrankdetails/1.0/5.0/?jsv=2.7.1&appKey=12574478&t=" + _0x3de011 + "&sign=" + sign + "&api=mtop.alsc.svip.usergrowth.getRankDetails&type=originaljson&needLogin=true&gpsLocation=true&ttid=true&umidToken=true&v=1.0&timeout=8000&dangerouslySetWindvaneParams=%7B%22instanceid%22%3A%22INNER%22%7D&dataType=json&xua=true&location=true&valueType=original&pageUrl=https%3A%2F%2Fair.tb.ele.me&H5Request=true&SV=5.0&data=%7B%22latitude%22%3A35.676396%2C%22longitude%22%3A139.654405%2C%22gpsLatitude%22%3A35.676396%2C%22gpsLongitude%22%3A139.654405%7D",
        "method": "get",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0x572eb0
        }
    },
        _0x21744d = await api(_0x35b396);

    var _0x51f943 = JSON.parse(_0x21744d.body);

    let _0xe40144 = _0x51f943.data.data.basicInfoBlock.rank,
        _0x3b4ea8 = _0x51f943.data.data.rankCardBlock[_0xe40144].rankDesc,
        _0x1ef727 = _0x3b4ea8.replace("有效期至", "").replace("", "");

    return "\n【会员等级】" + _0x51f943.data.data.rankCardBlock[_0xe40144].ruleDescVO.ruleDescTitle + " \n【会员期效】" + _0x1ef727;
}

async function elmfoodiesvip(_0xbb22d) {
    var _0x768faa = {
        "bizCode": "emod-svip-home-card-new",
        "latitude": 35.676396,
        "longitude": 139.654405
    },
        _0x12ea35 = Date.now();

    sign = map("a8b654ea8b2d8897556edb7eed592e4e", _0x12ea35, _0x768faa);

    let _0x5b5160 = {
        "url": "https://waimai-guide.ele.me/h5/mtop.alsc.svip.foodie.queryhomepage/1.0/5.0/?jsv=2.7.1&appKey=12574478&t=" + _0x12ea35 + "&sign=" + sign + "&api=mtop.alsc.svip.foodie.queryHomepage&type=originaljson&needLogin=true&ttid=true&v=1.0&timeout=8000&dangerouslySetWindvaneParams=%7B%22instanceid%22%3A%22INNER%22%7D&dataType=json&xua=true&location=true&valueType=original&pageUrl=https%3A%2F%2Fair.tb.ele.me&H5Request=true&SV=5.0&data=%7B%22bizCode%22%3A%22emod-svip-home-card-new%22%2C%22latitude%22%3A35.676396%2C%22longitude%22%3A139.654405%7D",
        "method": "get",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0xbb22d
        }
    },
        _0x50e3b8 = await api(_0x5b5160);

    var _0x10a96f = _0x50e3b8.headers,
        _0x96c7ca = JSON.stringify(_0x10a96f),
        _0x3f93b6 = _0x96c7ca.match(/_m_h5_tk=([^_]+)/)[1],
        _0x3ffcba = /_m_h5_tk=[0-9a-f]+_[0-9]+;/,
        _0x56cea3 = /_m_h5_tk_enc=[0-9a-f]+;/,
        _0xefdefd = _0x96c7ca.match(_0x3ffcba)[0],
        _0x283914 = _0x96c7ca.match(_0x56cea3)[0];

    _0xbb22d = _0xbb22d.replace(/_m_h5_tk=[^;]+;?/, "");
    _0xbb22d = _0xbb22d.replace(/_m_h5_tk_enc=[^;]+;?/, "");
    _0xbb22d = _0xefdefd + _0x283914 + _0xbb22d;
    sign = map(_0x3f93b6, _0x12ea35, _0x768faa);

    let _0x1ebad0 = {
        "url": "https://waimai-guide.ele.me/h5/mtop.alsc.svip.foodie.queryhomepage/1.0/5.0/?jsv=2.7.1&appKey=12574478&t=" + _0x12ea35 + "&sign=" + sign + "&api=mtop.alsc.svip.foodie.queryHomepage&type=originaljson&needLogin=true&ttid=true&v=1.0&timeout=8000&dangerouslySetWindvaneParams=%7B%22instanceid%22%3A%22INNER%22%7D&dataType=json&xua=true&location=true&valueType=original&pageUrl=https%3A%2F%2Fair.tb.ele.me&H5Request=true&SV=5.0&data=%7B%22bizCode%22%3A%22emod-svip-home-card-new%22%2C%22latitude%22%3A35.676396%2C%22longitude%22%3A139.654405%7D",
        "method": "get",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0xbb22d
        }
    },
        _0x40e810 = await api(_0x1ebad0),
        _0x218dcb = JSON.parse(_0x40e810.body);

    if (_0x218dcb.data.data.svipHomepage.beAliVip = true) return "\n【超级吃货】" + _0x218dcb.data.data.svipHomepage.expireDate + "\n【吃货红包】" + _0x218dcb.data.data.couponAssert.available;
    return;
}

async function elmauthentication(_0x13e3b8) {
    var _0x2b2af6 = {
        "bizScene": "LIANLIANKAN",
        "longitude": 139.654405,
        "latitude": 35.676396
    },
        _0x211dad = Date.now();

    sign = map("a8b654ea8b2d8897556edb7eed592e4e", _0x211dad, _0x2b2af6);

    let _0x29f5c2 = {
        "url": "https://shopping.ele.me/h5/mtop.alsc.playgame.common.real.name.authentication/1.0/?jsv=2.6.1&appKey=12574478&t=" + _0x211dad + "&sign=" + sign + "&api=mtop.alsc.playgame.common.real.name.authentication&v=1.0&type=originaljson&dataType=json",
        "method": "post",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0x13e3b8
        },
        "body": "data=%7B%22bizScene%22%3A%22LIANLIANKAN%22%2C%22longitude%22%3A139.654405%2C%22latitude%22%3A35.676396%7D"
    },
        _0x43e938 = await api(_0x29f5c2);

    var _0x94c8f4 = _0x43e938.headers,
        _0xfabfd7 = JSON.stringify(_0x94c8f4),
        _0x16cd27 = _0xfabfd7.match(/_m_h5_tk=([^_]+)/)[1],
        _0x33b6c6 = /_m_h5_tk=[0-9a-f]+_[0-9]+;/,
        _0xc5bb37 = /_m_h5_tk_enc=[0-9a-f]+;/,
        _0x3734de = _0xfabfd7.match(_0x33b6c6)[0],
        _0x4c380c = _0xfabfd7.match(_0xc5bb37)[0];

    _0x13e3b8 = _0x13e3b8.replace(/_m_h5_tk=[^;]+;?/, "");
    _0x13e3b8 = _0x13e3b8.replace(/_m_h5_tk_enc=[^;]+;?/, "");
    _0x13e3b8 = _0x3734de + _0x4c380c + _0x13e3b8;
    sign = map(_0x16cd27, _0x211dad, _0x2b2af6);

    let _0x406bb0 = {
        "url": "https://shopping.ele.me/h5/mtop.alsc.playgame.common.real.name.authentication/1.0/?jsv=2.6.1&appKey=12574478&t=" + _0x211dad + "&sign=" + sign + "&api=mtop.alsc.playgame.common.real.name.authentication&v=1.0&type=originaljson&dataType=json",
        "method": "post",
        "headers": {
            "Host": "mtop.ele.me",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "Content-type": "application/x-www-form-urlencoded",
            "Origin": "https://tb.ele.me",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://tb.ele.me/wow/alsc/mod/3fe8408d9ba38d4726448a87?spm-pre=a2ogi.bx828379.0.0&spm=a13.b_activity_kb_m69301.0.0",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cookie": _0x13e3b8
        },
        "body": "data=%7B%22bizScene%22%3A%22LIANLIANKAN%22%2C%22longitude%22%3A139.654405%2C%22latitude%22%3A35.676396%7D"
    },
        _0x4ec944 = await api(_0x406bb0);

    var _0x5bcd4f = JSON.parse(_0x4ec944.body);

    if (_0x5bcd4f.data.data.adult = true) {
        return "\n【实名状态】已实名";
    } else return "\n【实名状态】未实名";
}

function getUSERID(_0x1104b5) {
    return decodeURIComponent(_0x1104b5.match(/USERID=([^; ]+)(?=;?)/)[1]);
}

function jj(_0x497f73) {
    function _0x526098(_0x5e4816, _0x4ffd41) {
        return _0x5e4816 << _0x4ffd41 | _0x5e4816 >>> 32 - _0x4ffd41;
    }

    function _0x34a091(_0x4f90d2, _0x41d43a) {
        var _0x370ab7, _0xde645d, _0x289919, _0x4e0ca9, _0x366d45;

        return _0x289919 = 2147483648 & _0x4f90d2, _0x4e0ca9 = 2147483648 & _0x41d43a, _0x366d45 = (1073741823 & _0x4f90d2) + (1073741823 & _0x41d43a), (_0x370ab7 = 1073741824 & _0x4f90d2) & (_0xde645d = 1073741824 & _0x41d43a) ? 2147483648 ^ _0x366d45 ^ _0x289919 ^ _0x4e0ca9 : _0x370ab7 | _0xde645d ? 1073741824 & _0x366d45 ? 3221225472 ^ _0x366d45 ^ _0x289919 ^ _0x4e0ca9 : 1073741824 ^ _0x366d45 ^ _0x289919 ^ _0x4e0ca9 : _0x366d45 ^ _0x289919 ^ _0x4e0ca9;
    }

    function _0x43d65c(_0x387ace, _0x33ff38, _0x3c086a, _0x20db6b, _0x351b23, _0xb7af6b, _0x2f3c31) {
        return _0x387ace = _0x34a091(_0x387ace, _0x34a091(_0x34a091(function (_0x436da4, _0x519633, _0x137aa8) {
            return _0x436da4 & _0x519633 | ~_0x436da4 & _0x137aa8;
        }(_0x33ff38, _0x3c086a, _0x20db6b), _0x351b23), _0x2f3c31)), _0x34a091(_0x526098(_0x387ace, _0xb7af6b), _0x33ff38);
    }

    function _0x5e5228(_0x28a6be, _0x52e0a0, _0x480414, _0x1bb50c, _0x414cc9, _0x7ff518, _0x2ac238) {
        return _0x28a6be = _0x34a091(_0x28a6be, _0x34a091(_0x34a091(function (_0x1e2b9c, _0x28460e, _0x79d9c1) {
            return _0x1e2b9c & _0x79d9c1 | _0x28460e & ~_0x79d9c1;
        }(_0x52e0a0, _0x480414, _0x1bb50c), _0x414cc9), _0x2ac238)), _0x34a091(_0x526098(_0x28a6be, _0x7ff518), _0x52e0a0);
    }

    function _0x2b7384(_0x144dca, _0x4473a2, _0x5d7e4c, _0x454c7f, _0x5b4080, _0xa0bda6, _0xa0eecb) {
        return _0x144dca = _0x34a091(_0x144dca, _0x34a091(_0x34a091(function (_0x5eb9ef, _0x3c2488, _0x3bd901) {
            return _0x5eb9ef ^ _0x3c2488 ^ _0x3bd901;
        }(_0x4473a2, _0x5d7e4c, _0x454c7f), _0x5b4080), _0xa0eecb)), _0x34a091(_0x526098(_0x144dca, _0xa0bda6), _0x4473a2);
    }

    function _0x5bf75a(_0x579639, _0x3b4f66, _0x52f34a, _0x5c5e97, _0x2d8234, _0x1c0099, _0x50339f) {
        return _0x579639 = _0x34a091(_0x579639, _0x34a091(_0x34a091(function (_0xd79991, _0x18bfc2, _0x545feb) {
            return _0x18bfc2 ^ (_0xd79991 | ~_0x545feb);
        }(_0x3b4f66, _0x52f34a, _0x5c5e97), _0x2d8234), _0x50339f)), _0x34a091(_0x526098(_0x579639, _0x1c0099), _0x3b4f66);
    }

    function _0x3b9475(_0x95dfe2) {
        var _0x5dcc31,
            _0x5179ee = "",
            _0x2e4315 = "";

        for (_0x5dcc31 = 0; 3 >= _0x5dcc31; _0x5dcc31++) _0x5179ee += (_0x2e4315 = "0" + (_0x95dfe2 >>> 8 * _0x5dcc31 & 255).toString(16)).substr(_0x2e4315.length - 2, 2);

        return _0x5179ee;
    }

    var _0x3efe97, _0x3a2236, _0x26fe71, _0x300904, _0x2b2bbe, _0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a;

    for (_0x39186a = function (_0x275ac2) {
        for (var _0x229b03, _0x5b8351 = _0x275ac2.length, _0x23c85c = _0x5b8351 + 8, _0x209f57 = 16 * ((_0x23c85c - _0x23c85c % 64) / 64 + 1), _0x18979b = new Array(_0x209f57 - 1), _0x23e0ed = 0, _0x4696fb = 0; _0x5b8351 > _0x4696fb;) _0x23e0ed = _0x4696fb % 4 * 8, _0x18979b[_0x229b03 = (_0x4696fb - _0x4696fb % 4) / 4] = _0x18979b[_0x229b03] | _0x275ac2.charCodeAt(_0x4696fb) << _0x23e0ed, _0x4696fb++;

        return _0x23e0ed = _0x4696fb % 4 * 8, _0x18979b[_0x229b03 = (_0x4696fb - _0x4696fb % 4) / 4] = _0x18979b[_0x229b03] | 128 << _0x23e0ed, _0x18979b[_0x209f57 - 2] = _0x5b8351 << 3, _0x18979b[_0x209f57 - 1] = _0x5b8351 >>> 29, _0x18979b;
    }(_0x497f73 = function (_0xf40f75) {
        _0xf40f75 = _0xf40f75.replace(/\r\n/g, "\n");

        for (var _0xb7e527 = "", _0x2b6371 = 0; _0x2b6371 < _0xf40f75.length; _0x2b6371++) {
            var _0x4cc359 = _0xf40f75.charCodeAt(_0x2b6371);

            128 > _0x4cc359 ? _0xb7e527 += String.fromCharCode(_0x4cc359) : _0x4cc359 > 127 && 2048 > _0x4cc359 ? (_0xb7e527 += String.fromCharCode(_0x4cc359 >> 6 | 192), _0xb7e527 += String.fromCharCode(63 & _0x4cc359 | 128)) : (_0xb7e527 += String.fromCharCode(_0x4cc359 >> 12 | 224), _0xb7e527 += String.fromCharCode(_0x4cc359 >> 6 & 63 | 128), _0xb7e527 += String.fromCharCode(63 & _0x4cc359 | 128));
        }

        return _0xb7e527;
    }(_0x497f73)), _0x31cc08 = 1732584193, _0x5164e6 = 4023233417, _0x520ec7 = 2562383102, _0x1f5977 = 271733878, _0x3efe97 = 0; _0x3efe97 < _0x39186a.length; _0x3efe97 += 16) _0x3a2236 = _0x31cc08, _0x26fe71 = _0x5164e6, _0x300904 = _0x520ec7, _0x2b2bbe = _0x1f5977, _0x31cc08 = _0x43d65c(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 0], 7, 3614090360), _0x1f5977 = _0x43d65c(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 1], 12, 3905402710), _0x520ec7 = _0x43d65c(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 2], 17, 606105819), _0x5164e6 = _0x43d65c(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 3], 22, 3250441966), _0x31cc08 = _0x43d65c(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 4], 7, 4118548399), _0x1f5977 = _0x43d65c(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 5], 12, 1200080426), _0x520ec7 = _0x43d65c(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 6], 17, 2821735955), _0x5164e6 = _0x43d65c(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 7], 22, 4249261313), _0x31cc08 = _0x43d65c(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 8], 7, 1770035416), _0x1f5977 = _0x43d65c(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 9], 12, 2336552879), _0x520ec7 = _0x43d65c(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 10], 17, 4294925233), _0x5164e6 = _0x43d65c(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 11], 22, 2304563134), _0x31cc08 = _0x43d65c(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 12], 7, 1804603682), _0x1f5977 = _0x43d65c(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 13], 12, 4254626195), _0x520ec7 = _0x43d65c(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 14], 17, 2792965006), _0x31cc08 = _0x5e5228(_0x31cc08, _0x5164e6 = _0x43d65c(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 15], 22, 1236535329), _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 1], 5, 4129170786), _0x1f5977 = _0x5e5228(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 6], 9, 3225465664), _0x520ec7 = _0x5e5228(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 11], 14, 643717713), _0x5164e6 = _0x5e5228(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 0], 20, 3921069994), _0x31cc08 = _0x5e5228(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 5], 5, 3593408605), _0x1f5977 = _0x5e5228(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 10], 9, 38016083), _0x520ec7 = _0x5e5228(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 15], 14, 3634488961), _0x5164e6 = _0x5e5228(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 4], 20, 3889429448), _0x31cc08 = _0x5e5228(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 9], 5, 568446438), _0x1f5977 = _0x5e5228(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 14], 9, 3275163606), _0x520ec7 = _0x5e5228(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 3], 14, 4107603335), _0x5164e6 = _0x5e5228(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 8], 20, 1163531501), _0x31cc08 = _0x5e5228(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 13], 5, 2850285829), _0x1f5977 = _0x5e5228(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 2], 9, 4243563512), _0x520ec7 = _0x5e5228(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 7], 14, 1735328473), _0x31cc08 = _0x2b7384(_0x31cc08, _0x5164e6 = _0x5e5228(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 12], 20, 2368359562), _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 5], 4, 4294588738), _0x1f5977 = _0x2b7384(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 8], 11, 2272392833), _0x520ec7 = _0x2b7384(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 11], 16, 1839030562), _0x5164e6 = _0x2b7384(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 14], 23, 4259657740), _0x31cc08 = _0x2b7384(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 1], 4, 2763975236), _0x1f5977 = _0x2b7384(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 4], 11, 1272893353), _0x520ec7 = _0x2b7384(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 7], 16, 4139469664), _0x5164e6 = _0x2b7384(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 10], 23, 3200236656), _0x31cc08 = _0x2b7384(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 13], 4, 681279174), _0x1f5977 = _0x2b7384(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 0], 11, 3936430074), _0x520ec7 = _0x2b7384(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 3], 16, 3572445317), _0x5164e6 = _0x2b7384(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 6], 23, 76029189), _0x31cc08 = _0x2b7384(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 9], 4, 3654602809), _0x1f5977 = _0x2b7384(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 12], 11, 3873151461), _0x520ec7 = _0x2b7384(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 15], 16, 530742520), _0x31cc08 = _0x5bf75a(_0x31cc08, _0x5164e6 = _0x2b7384(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 2], 23, 3299628645), _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 0], 6, 4096336452), _0x1f5977 = _0x5bf75a(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 7], 10, 1126891415), _0x520ec7 = _0x5bf75a(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 14], 15, 2878612391), _0x5164e6 = _0x5bf75a(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 5], 21, 4237533241), _0x31cc08 = _0x5bf75a(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 12], 6, 1700485571), _0x1f5977 = _0x5bf75a(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 3], 10, 2399980690), _0x520ec7 = _0x5bf75a(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 10], 15, 4293915773), _0x5164e6 = _0x5bf75a(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 1], 21, 2240044497), _0x31cc08 = _0x5bf75a(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 8], 6, 1873313359), _0x1f5977 = _0x5bf75a(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 15], 10, 4264355552), _0x520ec7 = _0x5bf75a(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 6], 15, 2734768916), _0x5164e6 = _0x5bf75a(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 13], 21, 1309151649), _0x31cc08 = _0x5bf75a(_0x31cc08, _0x5164e6, _0x520ec7, _0x1f5977, _0x39186a[_0x3efe97 + 4], 6, 4149444226), _0x1f5977 = _0x5bf75a(_0x1f5977, _0x31cc08, _0x5164e6, _0x520ec7, _0x39186a[_0x3efe97 + 11], 10, 3174756917), _0x520ec7 = _0x5bf75a(_0x520ec7, _0x1f5977, _0x31cc08, _0x5164e6, _0x39186a[_0x3efe97 + 2], 15, 718787259), _0x5164e6 = _0x5bf75a(_0x5164e6, _0x520ec7, _0x1f5977, _0x31cc08, _0x39186a[_0x3efe97 + 9], 21, 3951481745), _0x31cc08 = _0x34a091(_0x31cc08, _0x3a2236), _0x5164e6 = _0x34a091(_0x5164e6, _0x26fe71), _0x520ec7 = _0x34a091(_0x520ec7, _0x300904), _0x1f5977 = _0x34a091(_0x1f5977, _0x2b2bbe);

    return (_0x3b9475(_0x31cc08) + _0x3b9475(_0x5164e6) + _0x3b9475(_0x520ec7) + _0x3b9475(_0x1f5977)).toLowerCase();
}

function map(_0x317191, _0x3ee8c4, _0x2090e4) {
    var _0x1c7264 = _0x317191 + "&" + _0x3ee8c4 + "&" + "12574478" + "&" + JSON.stringify(_0x2090e4);

    return jj(_0x1c7264);
}





