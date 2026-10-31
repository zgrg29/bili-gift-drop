# 登录二维码不显示与外部链接误点修复（v0.6.15）

日期：2026-10-31（Asia/Shanghai）。范围：B 站登录二维码显示、兜底 URL 的点击行为。

## 现象

- 登录面板只显示一串 `https://account.bilibili.com/h5/account-h5/auth/scan-web?...` 链接，没有二维码。
- 用户点击该链接后跳到 B 站自己的“哔哩哔哩扫码登录”页面，页面显示账号但“确认”按钮不可用；用户还提到出现了第三方播放器下载提示。

## 根因

1. 本地静态服务的 MIME 表只有 `.mjs`，没有 `.js`。`/src/control/vendor/qrcode.js` 因此以 `application/octet-stream` 返回。
2. 响应同时带 `X-Content-Type-Options: nosniff`，浏览器拒绝把 `application/octet-stream` 当脚本执行，`qrcode` 全局函数不存在。
3. 控制台的兜底分支把登录 URL 渲染成 `<a target="_blank">`，用户点击后离开控制台，进入 B 站外部登录页，可能触发 B 站页面的应用/播放器下载提示。该页面和下载都不是本程序的安装包。

## 修复

- 服务端 MIME 增加 `.js: text/javascript; charset=utf-8`；二维码库正常执行。
- 浏览器实测 `typeof qrcode === 'function'`，登录面板静态布局中的二维码可生成。
- 兜底不再生成可点击链接，只输出可选择、复制的纯文本 `<code>`；不会导航、不会下载。
- 登录提示新增：请用 B 站手机客户端扫码，不要点击外部页面或下载第三方播放器。
- 未改变登录/Cookie 逻辑、历史、翻译、金额和汇率。

## 验证

- `node --test --test-isolation=none`：55/55 通过。
- `scripts/smoke.mjs` 新增断言：`/src/control/vendor/qrcode.js` 必须返回 JavaScript Content-Type；`smoke-windows.mjs` 对 EXE 内嵌资源执行同样检查。
- 源码服务 + Chrome 实测：`qrcode` 脚本执行结果为 `type=function`。
- 390px 登录面板/二维码静态布局此前已检查（`docs/screenshots/login-qr-390.png`）；本轮修复后仍使用同一布局。
- Windows v0.6.15 EXE/ZIP 已构建；`node scripts/smoke-windows.mjs` 通过启动/重复启动、HTTP/SSE、历史快照与模拟排除、金额显示重启持久化、三语、初始匿名登录状态、全部内嵌源码逐字节一致和退出端口释放。

## 用户侧处理

- 关闭浏览器里那个 B 站外部登录页；不要点“确认”（该页面在桌面浏览器里不可用）。
- 如果下载了第三方播放器/安装包（用户描述为 “I believe player” 一类），那不是本程序生成的文件，请按需删除；本程序只发布 EXE/ZIP。
- 更新到 v0.6.15，重启本地服务，刷新控制台（Ctrl+F5），再点「登录 B 站」应看到二维码。
- 用户实测扫码登录成功（2026-10-31）；登录后完整礼物昵称是否解除遮罩未在本次反馈中单独确认；二维码 180 秒失效。

## 边界

- 二维码脚本依赖本地 `.js` MIME；已加 smoke 防回归。
- B 站网页登录接口变化、账号风控、Cookie 失效仍可能导致登录失败。
- 用户授权本地 commit；不打标签、不推送、不发布远程 Release。
