
const {
    sendNotify, allEnvs, sleep
} = require('./quantum');

var message = "安卓抓包软件已更新，回复：饿了么抓包\n您的以下饿了么账号已经过期。请收藏保存你的ck，然后打开饿了么app，重新提交ck，自动复活。";

!(async () => {
    var envs = await allEnvs("elmck", 2, false, "");
    console.log("获取过期环境变量" + envs.length + "个");
    var ts = [];
    for (var i = 0; i < envs.length; i++) {
        if (ts.length > 0 && ts.filter((t) => t.UserId === envs[i].UserId).length > 0) {
            ts.filter((t) => t.UserId === envs[i].UserId)[0].List.push(envs[i].UserRemark)
        } else {
            ts.push({
                UserId: envs[i].UserId,
                List: [envs[i].UserRemark]
            });
        }
    }
    if (ts.length > 0) {
        for (var i = 0; i < ts.length; i++) {
            await sleep(5000);
            await sendNotify(message + "\n" + ts[i].List.join(","), false, ts[i].UserId);
        }
    }
})();







