# Bili Gift Drop

本地运行、浏览器设置的 Bilibili 礼物掉落原型，为 OBS 提供透明浏览器源。先做礼物，SC 后续开发。

## 工程进度与验收（2026-10-24）

目前交付为可运行的开发原型，尚未达到第一版正式发布标准。

| 任务 | 状态 | 验收结果 |
| --- | --- | --- |
| 开源方案调研、独立本地及 GitHub 仓库 | 已完成 | 独立仓库，参考接入方式；未复制 LiveLink 应用代码 |
| 工程规划、对话纪要和 log 目录 | 已完成 | 阶段、验收标准和决策记录已建立 |
| 房间连接、真实礼物与图片掉落 | 样本通过 | 房间 1713548468 的真实 V2 免费及 ¥0.10 礼物；图片缓存及浏览器预览通过 |
| 金额影响效果、最低触发金额 | 部分完成 | 单价影响尺寸；数量有上限；最低单价可保存；可编辑金额档位及分档停留时间待做 |
| 主播定制 | 部分完成 | 重力、弹性、停留时间、数量上限、免费开关；掉落区域编辑待做 |
| 中日英语言设置 | 当前界面通过 | 资源键/参数一致、切换、保存和桌面布局已检查；完整窄屏验收待做 |
| OBS 浏览器源 | 待实机验收 | 透明页面及接入地址已提供，尚未确认 OBS 内实际显示 |
| 新礼物自动适配 | 部分完成 | 动态目录、未知 ID 刷新与图片缓存已实现；全新上架礼物和异常场景待验证 |
| SC 金额时长与自定义位置 | 后续，未实现 | 需求已记录；卡片、独立计时、拖动缩放待开发 |
| 可靠性及正式交付 | 待完成 | 连送/盲盒实测、断网恢复、长期压力、缓存清理和新环境启动待验收 |

本轮复验：`node --test` **8/8 通过**；`node scripts/smoke.mjs` **通过**。真实送礼与截图采用同日已取得的验证证据，不代表本轮重新监听或 OBS 已验收。

日本語：開発用プロトタイプです。実際の一部の V2 ギフト、ブラウザ表示、最低単価と三言語 UI を検証済みです。自動テスト 8 件と HTTP/SSE チェックに合格。OBS 内表示、SC、配置編集、長時間運用は未検証または未実装です。

English: This is a development prototype. Some real V2 gifts, browser rendering, the minimum unit price and the three-language UI have been verified. All 8 automated tests and HTTP/SSE checks pass. OBS rendering, SC, layout editing and long-running reliability remain pending.

下一步优先验收 OBS 实机透明显示，再补齐金额分档、区域编辑与可靠性；SC 按后续阶段开发。完整任务清单和证据见 [任务验收报告](docs/ACCEPTANCE.md)。

## 启动 / 起動 / Start

需要 Node.js 22 或更新版本，无需安装 npm 依赖。当前机器也可使用已存在的 Codex Node 运行时。

1. 双击 `start.cmd`，保持服务窗口运行；浏览器将自动打开设置页。
2. 输入 Bilibili 直播间号并连接。也可不连接，选择真实礼物后点击「模拟送礼」预览图片效果。
3. 在 OBS 添加「浏览器」源，地址为 `http://127.0.0.1:19321/overlay`，宽 1920、高 1080。
4. 设置最低触发单价（人民币）、重力、弹性、停留时间和数量上限，然后保存。语言切换也会保存。

金额门槛按单个礼物单价判断，达到门槛（含相等）才掉落，不按连送总价累计。0 表示不限。门槛大于 0 时免费礼物不掉落；低价礼物仍可在最近记录中看到。

日本語：最低ギフト単価（人民元）を設定できます。1 個の単価が設定額以上の場合のみ落下し、連続ギフトの合計額では判定しません。0 は制限なし。最低額が 0 より大きい場合、無料ギフトは落下しません。

English: Set the minimum gift unit price in CNY. Gifts at or above it drop; quantities are not added together to reach the threshold. 0 means no minimum. Free gifts do not drop when the minimum is above 0.

日本語：Node.js 22 以上が必要です。`start.cmd` をダブルクリックし、サービスのウィンドウを開いたままにします。ブラウザでルーム番号を入力して接続します。接続前でもギフトを選んでテストできます。OBS にブラウザソースを追加し、上記 URL・幅 1920・高さ 1080 を指定してください。設定と言語は保存されます。

English: Install Node.js 22 or later. Double-click `start.cmd` and keep the service window open. Enter your room ID in the browser, or simulate a gift without connecting. Add an OBS browser source with the URL above, width 1920 and height 1080. Settings and language are saved. No npm dependencies are required.

开发启动：`node src/server/index.mjs`。停止：服务窗口按 Ctrl+C。开发检查：`node --test`；服务启动后运行 `node scripts/smoke.mjs`。

## 当前能力与限制 / 制限 / Limitations

- 三语控制面板、语言及配置保存、模拟真实礼物图片、透明画面、重力/旋转/圆形碰撞/弹跳/堆积/过期清理。
- 房间短号解析、WBI 签名、匿名 WebSocket 接入、心跳/重连、旧版及 V2 礼物消息解析、交易去重、动态礼物资料及图片缓存。
- 已实测公开房间匿名握手、987 条礼物资料、真实 V2 免费及付费礼物接收、图片缓存与浏览器掉落；尚未验收 OBS 软件内显示及所有礼物类型。匿名连接可能受平台限制，当前没有登录/授权功能。
- 固定 1920×1080 逻辑画布和圆形碰撞近似；区域编辑、金额档位编辑、长期压力验证与缓存空间管理待做。透明页不回放刷新前的礼物。
- 盲盒保留支付单价与爆出价值，效果暂按爆出价值计算；免费礼物不折算人民币；忽略连击汇总以避免重复掉落。

日本語：一部の実際の V2 ギフト受信とブラウザ上の落下表示は検証済みです。OBS 内の表示と全ギフト種類は未検証です。匿名接続が制限される場合があります。ログイン機能、領域編集、金額別プリセット、SC は未実装です。画面更新時に過去のギフトは再生されません。

English: Some real V2 gifts and browser drops have been verified. Rendering inside OBS and all gift types are not yet verified. Anonymous access may be restricted. Login, area editing, editable price tiers and SC are not implemented. Refreshing the overlay does not replay earlier gifts.

## 文档

- [项目规划与进度](docs/PROJECT_PLAN.md)
- [接入研究与验证记录](docs/BILIBILI_INTEGRATION.md)
- [本次开发日志](log/2026-10-24-development.md)
- [初始需求纪要](log/2026-10-24-conversation.md)
- [真实送礼与金额门槛记录](log/2026-10-24-live-validation.md)
- [本轮任务汇总与验收日志](log/2026-10-24-acceptance.md)
