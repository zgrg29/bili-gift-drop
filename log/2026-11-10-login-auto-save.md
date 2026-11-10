# 登录自动保存（v0.6.17）

日期：2026-11-10（Asia/Shanghai）。范围：B 站登录凭据的保存策略、登录面板交互与三语文案。

## 背景与现象

用户反馈：扫码登录成功后，关闭程序再启动又回到未登录，需要重新扫码。检查发现打包版数据目录 `%LOCALAPPDATA%\BiliGiftDrop\data` 只有 `config.json`，没有 `login.json`。

根因是 v0.6.14 的设计：登录默认只保存在内存，只有勾选「记住登录」才写盘；而这个勾选框位于「无法扫码？手动粘贴 Cookie」折叠区内，扫码用户看不到，实际等于永远不保存。恢复链路本身正常：隔离数据目录预置 `login.json` 后重启，状态接口返回 `loggedIn:true`，说明不是加载 bug。

## 决定

用户选择「登录即记住」：不再要求额外操作。扫码或手动 Cookie 登录成功即自动保存；退出登录即删除本机凭据。

## 实现

- `src/server/login.mjs`：`LoginStore` 移除 `remember` 参数与 `qrRemember`；`setCookies()` 校验成功后调用 `persist()` 写 `data/login.json`（`0o600`，未额外加密），写盘失败只令 `remembered=false`，不阻断本次内存登录；`logout()` 删除文件；`load()` 行为不变。
- `src/server/index.mjs`：`POST /api/login/qr` 调用 `startQR()`，`POST /api/login/cookie` 调用 `setCookies(cookies)`，不再读取 `remember`。
- `src/control/control.mjs`、`src/control/index.html`：移除 `rememberLogin` 勾选框及其读取。
- 三语 `src/shared/i18n/{zh-CN,ja,en}.mjs`：删除 `rememberLogin` 键；`loginHint`、`loginCookieHint` 改为说明自动保存位置（本机数据目录、未加密）、重启保持登录、「退出登录」删除凭据。
- 测试：`tests/login.test.mjs` 改为不传 remember 仍持久化；新增手动 Cookie 自动保存用例；无效凭据不落盘。`tests/control.test.mjs` 移除已不存在的元素 id。

## 验证

- `node --test --test-isolation=none`：64/64 通过。
- 打包 EXE 隔离验证：临时数据目录预置 `login.json` 后连续启动两次，`GET /api/login/status` 两次均返回 `loggedIn:true`、`uid:123`、`remembered:true`。
- `node scripts/smoke-windows.mjs`：启动/重复启动、HTTP/SSE、礼物/SC/大航海、三语、内嵌源码逐字节一致、退出端口释放全部通过。EXE 与 ZIP 为 v0.6.17，`dist/SHA256SUMS.txt` 已重新生成。
- 未用真实账号完成「扫码 → 写盘 → 重启」端到端验证（无主播账号）；写盘路径由单元测试和预置文件的重启恢复共同覆盖。

## 环境备注

构建期间发现工作区 `build`/`dist` 缺少当前用户的 Windows 文件写权限，导致子进程无法写入。按内置诊断脚本备份并修复了 `build` 的权限（恢复命令和报告在 `acl-recovery/`）；构建与 EXE 回归按工具要求单独申请完全权限执行。未修改真实配置、账号或缓存。

## 边界与未验收

- 凭据明文存于本机数据目录，依赖 Windows 账户与文件权限，只建议在可信电脑使用。
- 启动不重新校验已过期的 B 站 Cookie：界面可能仍显示「已登录」，但连接或取昵称失败，此时需退出后重新登录。
- 真实扫码登录后的完整昵称遮罩解除、真实礼物/SC、OBS 实机、完整三语窄屏、长期直播和全新 Windows 环境仍未验收；包未签名。
- 用户授权本地 commit 与本地 tag `v0.6.17`；不推送、不发布远程 Release。
