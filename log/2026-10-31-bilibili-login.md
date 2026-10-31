# B 站登录与完整礼物昵称（v0.6.14）

日期：2026-10-31（Asia/Shanghai）。范围：B 站网页扫码登录、手动 Cookie 登录、使用登录凭据连接直播间、控制台登录状态与隐私提示。

## 背景

匿名礼物事件可能同时没有 UID 和完整昵称（实测 `uid` 为空、`uname` 被遮罩、`face` 存在），公开 UID 查询无法补全名字。用户确认需要增加登录选项，并在界面提醒：要看礼物观众的完整昵称需要登录。

参考的开源/接口资料（只参考协议流程，没有复制应用代码）：

- Bilibili-API-Collect 二维码登录文档：<https://github.com/socialsisteryi/bilibili-api-collect/blob/master/docs/login/login_action/QR.md>
- qrcode-generator（MIT）：<https://github.com/kazuhikoarase/qrcode-generator>

## 实现

### 服务端登录

- 新增 `src/server/login.mjs`：`LoginStore` 管理登录状态，不向前端返回 Cookie。
  - 二维码：`GET passport.bilibili.com/x/passport-login/web/qrcode/generate` 获取 URL/key；`GET .../qrcode/poll` 轮询等待/已扫/成功/失效。
  - 登录成功：优先从 poll 的 `Set-Cookie` 和返回 URL 查询参数合并 `SESSDATA`、`bili_jct`、`DedeUserID`、`DedeUserID__ckMd5`、`sid` 等；用 `web-interface/nav` 验证 `isLogin`、UID、昵称和头像。
  - 手动 Cookie：`parseCookieString` 支持只粘贴 SESSDATA、完整 Cookie 或带 `Cookie:` 前缀；同样经 nav 验证。
  - 默认只保存在内存；勾选「记住登录」才写入 `data/login.json`（`0o600`，Windows 上仍建议保护账户/目录）；退出登录删除文件。
  - 状态对象只有 `loggedIn/uid/user/avatar/verifiedAt/remembered`，不含 Cookie；日志不输出 Cookie。
- `src/server/bilibili.mjs`：`api()` 支持登录 Cookie；`LiveRoom` 使用登录 Cookie 获取房间/弹幕 token，并在 `SEND_AUTH` 中使用登录 UID（匿名仍为 0）。
- `src/server/wbi.mjs`：`credentials(cookie)` 优先使用登录 Cookie 的 `buvid3`。
- 服务端 API：
  - `GET /api/login/status`
  - `POST /api/login/qr`、`POST /api/login/qr/poll`
  - `POST /api/login/cookie`、`POST /api/login/logout`
  - 登录成功/退出通过 SSE `login` 事件广播；连接中的直播间会自动重连以应用登录状态。
- 第三方二维码生成：引入 MIT 许可的 `qrcode-generator` 到 `src/control/vendor/qrcode.js`，许可文件 `src/control/vendor/qrcode.LICENSE.txt` 随源码和 Windows ZIP 提供。

### 控制台

- 左侧新增「B站登录」区：登录状态、账号头像/昵称/UID、登录/退出按钮、扫码二维码、手动 Cookie 输入、记住登录复选项。
- 明确提示：匿名连接时 B 站可能隐藏礼物观众的昵称和 UID，完整昵称通常需要登录；凭据只在本机使用，不写日志、不上传其他服务。
- 扫码轮询显示等待/已扫/失效/成功；登录成功后关闭面板并自动重连；退出登录回到匿名。
- 三语文案同步；二维码和手动 Cookie 面板在 390px 下检查。

## 验证

- `node --test --test-isolation=none`：55/55 通过。
  - 新增：Cookie 解析（SESSDATA/完整/Cookie: 前缀）、二维码等待/已扫/失效、成功登录持久化与退出、无效凭据拒绝、状态不暴露 Cookie、登录面板三语渲染、登录事件后账号区显示。
  - 原有：历史、空 UID 头像兜底、词典翻译、SC 翻译、免费礼物过滤、电池、汇率、礼物 V2 等继续通过。
- 真实接口：B 站二维码生成返回 URL/key；未扫码轮询返回等待状态；无效 SESSDATA 登录返回授权失败。未打印或保存任何 Cookie。
- 390px 登录面板/二维码静态布局截图：`docs/screenshots/login-qr-390.png`。
- Windows v0.6.14 EXE/ZIP 已构建；`node scripts/smoke-windows.mjs` 隔离回归通过：启动/重复启动、HTTP/SSE、历史快照与模拟排除、金额显示重启持久化、三语、初始匿名登录状态、全部内嵌源码逐字节一致、退出端口释放；ZIP 包含二维码许可文件。
- 构建/截图期间按工具要求对写入 build/dist 和 Chrome 截图的命令单独申请了完全权限；测试使用临时隔离数据目录。

## 未验收与边界

- **没有主播账号，无法完成真实扫码登录、登录后完整礼物昵称和真实上舰/SC 的端到端验证。** 登录后的账号权限、Cookie 失效、B 站风控以及遮罩是否真正解除仍需实机确认。
- 登录凭据等同账号权限；「记住登录」文件未额外加密，依赖本机账户和文件权限保护。只建议在可信电脑使用。
- 二维码 180 秒失效；B 站网页登录接口变化可能导致失败。OBS 内置浏览器不参与登录，历史/翻译仍在控制台。
- 真实礼物/SC、OBS、完整三语窄屏、全部视频编码、长期高峰和全新 Windows 仍未验收。
- 本轮只做本地构建与验证，不提交、不打标签、不推送、不发布远程 Release。
