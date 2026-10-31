# 同词相遇 · 多人联机网页版

真正的实时联机：Node.js + Socket.IO。2–20 人；房间号/邀请链接；每轮私密提交；全员提交后揭晓；自动判定全员同词；历史记录；掉线后同浏览器重连。

## 本地运行

安装 Node.js 18+，在本目录执行：

```bash
npm install
npm start
```

打开 http://localhost:3000

## 让异地朋友一起玩

将本文件夹上传至支持 Node.js 长驻服务及 WebSocket 的托管平台（例如 Render 的 Web Service），Build Command 为 `npm install`，Start Command 为 `npm start`。平台提供的 HTTPS 网址就是游戏地址；创建房间后复制邀请链接发给朋友。

注意：静态网页托管（如单独上传 index.html）无法提供联机功能。房间仅存在于服务器内存，服务重启后会消失；多实例部署需增加共享存储及 Socket.IO adapter。当前没有账号系统，持有原浏览器 token 的用户可以重连。
