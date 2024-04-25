const {
    sendNotify: _0x581b21,
    getEnvs: _0x3239cf,
    api: _0x113831,
    disableEnvs: _0x37a7f9
} = require("./quantum");

!(async () => {
    var _0x13daa4 = await _0x3239cf("elmck", null, 2);

    console.log("饿了么账号数量：" + _0x13daa4.length);
    var _0x5661d6 = [];

    for (let _0x42d0fb = 0; _0x42d0fb < _0x13daa4.length; _0x42d0fb++) {
        if (_0x13daa4[_0x42d0fb].Value && _0x13daa4[_0x42d0fb].Enable) {
            var cookie = _0x13daa4[_0x42d0fb].Value;
            var USERID = cookie.match(/USERID=([^; ]+)(?=;?)/)[1];

            var _0x2f3cd8 = decodeURI(USERID);

            console.log("开始检测【饿了么账号" + _0x42d0fb + "】" + _0x2f3cd8 + " ....\n");

            try {
                var _0x122b6e = await _0x2f660f(cookie);

                (_0x122b6e.message = "未登录") && (console.log("账号过期"), await _0x581b21("饿了么账号：" + _0x2f3cd8 + "，饿了么CK失效了，请重新提取ck 重新发送机器人", false, _0x13daa4[_0x42d0fb].UserId), _0x5661d6.push(cookie));
            } catch (_0x4bef11) { }
        }
    }

    if (_0x5661d6 && _0x5661d6.length > 0) {
        console.log("禁用失效返回结果:" + JSON.stringify(await _0x37a7f9(_0x5661d6)));
    } else console.log("无过期CK.");
})().catch(_0x280963 => console.log(JSON.stringify(_0x280963)));

async function _0x2f660f(cookie) {
    try {
        const _0x1714ca = {
            "method": "GET",
            "url": "https://restapi.ele.me/eus/v5/user_detail",
            "headers": {
                "Referer": "https://h5.ele.me/",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604",
                "Cookie": cookie
            }
        };

        // 发送请求并返回结果
        return await _0x113831(_0x1714ca);
    } catch (_0x2abd42) {
        // 发生错误时返回错误信息
        return _0x2abd42.response.body;
    }
}


