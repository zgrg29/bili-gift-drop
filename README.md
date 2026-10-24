# Bili Gift Drop

## v0.4.0 醒目留言与布局自动保存（2026-10-24）

醒目留言可独立启用。拖动布局框松开即提交保存；左侧、顶部、宽度和折叠秒数停止输入约400毫秒后自动保存，同步到OBS。支持方向键微调与刷新/重启恢复布局，无需再点击保存。默认15秒自动折叠，点击标题再次展开；卡片不显示倒计时，到期自动移除。切换语言和关闭显示不重置计时。

SC uses platform expiry/duration and colors first; Japanese, Chinese and English UI are included. SCの位置・幅は自動保存され、カウントダウンは表示しません。

发布 tag：`v0.4.0`；标题：**Bili Gift Drop v0.4.0 — 醒目留言与布局自动保存（Preview）**。下载包：`dist/BiliGiftDrop-v0.4.0-windows-x64.zip`；[三语 Release notes](docs/releases/v0.4.0.md)。验收记录见[SC日志](log/2026-10-24-superchat.md)。下方版本章节为历史记录。

## v0.3.1 自动保存设置（2026-10-24）

「掉落设置」中的数值和免费礼物开关修改后自动保存，无需点击保存按钮。停止输入约 400 毫秒后保存有效值并同步到 overlay；空值、越界或不符合步长的输入不会保存。尺寸设置仍对新收到的礼物生效，不追溯改变已有和队列中礼物的尺寸。保留保存按钮，便于手动重试。保存失败显示错误提示。

日本語：落下設定の有効な数値・スイッチ変更は約 400 ミリ秒後に自動保存・反映されます。保存ボタンは不要です。無効な値は保存しません。失敗時はエラーを表示し、保存ボタンで再試行できます。

English: Valid numbers and toggles in Drop settings save and apply automatically after about 400 ms without typing. No Save click is needed. Invalid values are not saved. Errors are shown; the Save button remains available for retrying.

验收：19/19 自动测试及 Windows EXE 回归通过；Chrome 未点击保存修改为 85%/35 元，刷新保持；新增自动保存提示的中日英 390 像素窄屏检查通过。OBS 实机和长期运行仍待验收。

发布 tag：`v0.3.1`；标题：**Bili Gift Drop v0.3.1 — 设置自动保存（Preview）**。发布包为 `dist/BiliGiftDrop-v0.3.1-windows-x64.zip`，附 `SHA256SUMS.txt`；[三语 Release notes](docs/releases/v0.3.1.md)。历史版本记录保留在下方。

## v0.3.0 自定义礼物尺寸（2026-10-24）

用户可在「掉落设置」中设置并保存**最小礼物尺寸、最大礼物尺寸、达到最大尺寸的金额**。默认 50%、150%、100 元；100% 为 1920 × 1080 画布中的 80 像素，尺寸范围 10%–400%。按本次总金额线性缩放，超过满尺寸金额封顶，免费礼物使用最小尺寸。最大值低于最小值时自动提高至最小值。

例如默认设置下，本次总金额 0/50/100 元对应 40/80/120 像素。普通礼物总金额为单价 × 本次数量；最低触发门槛仍按单价判断。点击保存后同步至 overlay，对新收到的礼物生效；已有及队列中礼物保留接收时尺寸。掉落区域和面积保护可能进一步缩小实际尺寸。可使用「模拟送礼」与现有实时预览检查效果。旧配置自动补默认值，切换语言不清空效果。

日本語：設定画面で最小・最大サイズと最大サイズに達する金額を保存できます。既定は 50%、150%、100 人民元。今回の合計金額に比例して拡大し、無料ギフトは最小サイズです。100% は 80 ピクセルです。保存後の新しいギフトに適用され、既存・待機中のサイズは維持されます。領域と面積制限により実際のサイズが小さくなる場合があります。

English: Save minimum size, maximum size and the amount for maximum size in Drop settings. Defaults: 50%, 150%, CNY 100. Size scales linearly with the event total; free gifts use the minimum. 100% is 80 pixels. Saved changes apply to newly received gifts; existing and queued icons retain their size. Region and area limits may reduce the displayed size.

验收：**19/19 自动测试通过，本机 Windows EXE 回归通过**。覆盖总金额缩放、上限、免费礼物、配置迁移/保存/重启、三语提交和实际绘制尺寸。Chrome 已确认自定义数值保存及刷新恢复，新增设置在 390 像素窄屏的中日英布局无横向溢出。完整页面视觉、OBS、长期实机及全新 Windows 验收尚未完成。详见 [尺寸验收日志](log/2026-10-24-gift-size.md)。以下历史章节中的测试数量及状态保留当时记录，本节为最新结论。

发布 tag：`v0.3.0`；标题：**Bili Gift Drop v0.3.0 — 自定义礼物尺寸（Preview）**；使用 **Pre-release**。三语 [Release notes](docs/releases/v0.3.0.md) 已准备。上传 `dist/BiliGiftDrop-v0.3.0-windows-x64.zip` 与 `dist/SHA256SUMS.txt`，标题和正文分别见 `dist/RELEASE_TITLE.txt`、`dist/RELEASE_NOTES.md`。本轮提交并推送代码及 tag，GitHub Release 由用户发布。

## v0.2.0 礼物高峰保护（2026-10-24）

本次为预览版本。已实现每秒生成限流、短队列合并与过期、数量及估算面积双上限、拥挤提前淡出、掉落区域百分比设置和预览统计；低价礼物在查图前过滤，碰撞改为邻近网格检查，减少缓存读盘与最近记录重绘。以下旧记录保留当时验收状态，本节与 [本次验收日志](log/2026-10-24-crowd-protection.md) 为最新增量。

- 默认每秒最多 12 个图标，同时最多 120 个；面积预算为掉落区域的 15%（可调 1–30%）。按旋转图标外接方形面积求和，属于保守估算，不是像素遮挡率。
- 一次送 1,000 个不会生成 1,000 张图：单事件最多 40 个视觉副本，同类待生成副本合并；队列最多 32 组，超过 1.5 秒丢弃。原始送礼数量、金额在最近记录中保留。
- 接近上限时旧图标提前淡出；修改为更小上限时必要的旧图标直接移除。清空操作同时清空画面和待生成队列。
- 可设置掉落区域左/上位置及宽/高（画布百分比），区域越界会自动收缩。画面裁切在该区域内，建议避开主播人物。
- 未知礼物自动查询平台目录并缓存图片；目录查询合并、失败退避。平台协议兼容时一般无需为新增礼物更新代码；全新上架实测仍待完成。
- 新设置及统计完整支持中日英，保存后重启恢复；只切换语言不清空画面和队列。

日本語：v0.2.0 はプレビュー版です。生成レート、短い待機キュー、個数・推定面積の上限、混雑時の早期フェード、落下領域の設定と統計を追加しました。既定は毎秒 12 個、最大 120 個、領域の推定面積 15%。生成待ちは 1.5 秒で破棄されます。三言語と設定保存に対応。今回のブラウザ目視確認と OBS 実機検証は未完了です。

English: v0.2.0 is a preview with bounded spawning, a short pending queue, count and estimated-area limits, early fading under crowding, configurable drop regions and preview statistics. Defaults: 12 icons/second, 120 active icons and a 15% region-area budget. Pending effects expire after 1.5 seconds. Settings persist and support all three languages. Browser visual QA and OBS verification remain pending.

本次自动化测试 **16/16 通过**，包括规则/三语资源、三语控制面板执行、持续风暴及完整 overlay 事件与绘制循环。Windows EXE 本机回归通过，包含新设置重启恢复与内嵌源码一致性。浏览器视觉验收因工具无法连接本地页面及可靠识别 URL 而未完成，不据此宣称窄屏三语或 OBS 实机通过。（此为v0.2.0历史状态；SC已于v0.4.0实现预览。）可编辑礼物金额档位、长期实机压力及全新 Windows 验收仍待完成。

发布信息：tag **`v0.2.0`**，标题 **Bili Gift Drop v0.2.0 — 礼物高峰保护（Preview）**，勾选 **Pre-release**。完整三语说明见 [Release notes](docs/releases/v0.2.0.md)。本地构建输出 `dist/BiliGiftDrop-v0.2.0-windows-x64.zip`、`SHA256SUMS.txt`、`RELEASE_TAG.txt`、`RELEASE_TITLE.txt` 和 `RELEASE_NOTES.md`。上传带版本号 ZIP 与校验文件即可；本轮不推送或发布远程 Release。

本地运行、浏览器设置的 Bilibili 礼物掉落原型，为 OBS 提供透明浏览器源。礼物掉落与醒目留言可组合显示，SC 已在 v0.4.0 提供预览功能。

## 工程进度与验收（早期记录，最新增量见上文）

目前交付为可运行的开发原型，尚未达到第一版正式发布标准。

| 任务 | 状态 | 验收结果 |
| --- | --- | --- |
| 开源方案调研、独立本地及 GitHub 仓库 | 已完成 | 独立仓库，参考接入方式；未复制 LiveLink 应用代码 |
| 工程规划、对话纪要和 log 目录 | 已完成 | 阶段、验收标准和决策记录已建立 |
| 房间连接、真实礼物与图片掉落 | 样本通过 | 房间 1713548468 的真实 V2 免费及 ¥0.10 礼物；图片缓存及浏览器预览通过 |
| 金额影响效果、最低触发金额 | 部分完成 | 总金额线性缩放，最小/最大尺寸与满尺寸金额可保存；数量有上限；最低单价可保存；分档停留时间待做 |
| 主播定制 | 部分完成 | 重力、弹性、停留时间、数量/面积上限、尺寸缩放、免费开关与区域数值设置；拖拽编辑待做 |
| 中日英语言设置 | 当前界面通过 | 资源键/参数一致、切换、保存和桌面布局已检查；完整窄屏验收待做 |
| Windows x64 便携 EXE | 已构建，本机回归通过 | 内含运行时；可见命令行同时显示中日英；重复启动、配置重启及退出释放端口已验证；全新电脑及完整浏览器自动打开验收待做 |
| OBS 浏览器源 | 待实机验收 | 透明页面及接入地址已提供，尚未确认 OBS 内实际显示 |
| 新礼物自动适配 | 部分完成 | 动态目录、未知 ID 刷新与图片缓存已实现；全新上架礼物和异常场景待验证 |
| SC 金额时长与自定义位置 | v0.4.0 预览实现，真实SC/OBS待验收 | 独立计时、拖动与宽度自动保存、折叠/展开及三语已具备 |
| 可靠性及正式交付 | 待完成 | 连送/盲盒实测、断网恢复、长期压力、缓存清理和新环境启动待验收 |

本轮复验：`node --test` **8/8 通过**；`node scripts/smoke.mjs` **通过**。真实送礼与截图采用同日已取得的验证证据，不代表本轮重新监听或 OBS 已验收。

Windows EXE 回归：`node scripts/smoke-windows.mjs` **通过**，覆盖控制台子系统、三语启动与重复启动提示、静态资源、模拟送礼、清空、配置重启恢复及退出后端口释放。构建为未签名预览版，尚未发布 GitHub Release。

日本語：開発用プロトタイプです。実際の一部の V2 ギフト、ブラウザ表示、最低単価と三言語 UI を検証済みです。OBS 内表示、SC、配置編集、長時間運用は未検証または未実装です。

English: This is a development prototype. Some real V2 gifts, browser rendering, the minimum unit price and the three-language UI have been verified. All 8 automated tests and HTTP/SSE checks pass. OBS rendering, SC, layout editing and long-running reliability remain pending.

下一步优先验收 OBS 实机透明显示，再补齐金额分档、区域编辑与可靠性；SC 已在 v0.4.0 实现，真实事件及OBS继续验收。完整任务清单和证据见 [任务验收报告](docs/ACCEPTANCE.md)。

## 启动 / 起動 / Start

### Windows 便携版 / Windows ポータブル版 / Windows portable app

1. 下载并解压 Release 包，双击 `BiliGiftDrop-windows-x64.exe`，无需另装 Node.js。
2. 保持可见命令行窗口打开。窗口同时显示中、日、英三语说明、控制面板和 OBS 地址。
3. 程序会尝试自动打开浏览器；没有打开时，把 `http://127.0.0.1:19321/` 复制到浏览器。
4. **关闭原来的服务命令行窗口，或在其中按 Ctrl+C，即可停止程序并释放端口。关闭浏览器页面不会停止服务。**
5. 重复启动会尝试打开已有面板，然后退出新进程；要停止服务，仍须关闭原来的服务窗口。其他启动错误会显示错误码，并在交互窗口等待回车。

设置与图片缓存保存在 `%LOCALAPPDATA%\BiliGiftDrop`，升级前先关闭旧服务，再替换 EXE；设置会保留。源码运行仍使用项目中的 `data/` 和 `cache/`。

日本語：ZIP を展開し、`BiliGiftDrop-windows-x64.exe` をダブルクリックします。Node.js は不要です。コンソールには中国語・日本語・英語の案内が同時に表示されます。ブラウザが開かない場合は `http://127.0.0.1:19321/` を貼り付けてください。元のサービスウィンドウを閉じるか Ctrl+C で終了し、ポートを解放します。ブラウザを閉じても終了しません。再実行は既存の画面を開いて新しいプロセスを終了します。設定とキャッシュは `%LOCALAPPDATA%\BiliGiftDrop` に保存されます。更新前に旧サービスを終了してください。

English: Extract the ZIP and double-click `BiliGiftDrop-windows-x64.exe`; no Node.js installation is needed. Keep its visible console open. Instructions appear in Chinese, Japanese and English together. If the browser does not open, visit `http://127.0.0.1:19321/`. Close the original service console or press Ctrl+C to stop the program and release the port; closing the browser does not stop it. Another launch opens the existing panel and exits the new process. Settings and cache live in `%LOCALAPPDATA%\BiliGiftDrop`. Stop the old service before replacing the EXE.

### 源码启动 / ソースから起動 / Run from source

源码运行需要 Node.js 22 或更新版本，无需安装 npm 依赖。

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

## 礼物堆积与消失 / 積み重なりと消去 / Stacking and expiry

礼物受到重力、旋转、弹跳与圆形近似碰撞影响，会在底部堆积。默认从生成起显示 30 秒，最后 0.75 秒逐渐淡出，随后删除；停留时间可设 5–120 秒。达到数量上限时最早的礼物会提前直接移除；「清空画面」会立即清空。v0.2.0 还会在拥挤时提前淡出旧图标，修改上限时裁减超额对象；待生成效果不会无限积压。

日本語：ギフトは重力・回転・反発と円形の近似衝突によって底に積み重なります。生成から既定で 30 秒間表示され、最後の 1 秒でフェードアウトします。5～120 秒に設定できます。個数上限を超えると古いギフトが先に削除され、クリア操作は即時に反映されます。

English: Gifts fall, rotate, bounce and stack at the bottom using approximate circular collisions. They last 30 seconds from spawning by default and fade out during the final 0.75 seconds. Lifetime is configurable from 5 to 120 seconds. The oldest gifts are removed immediately when the object limit is reached; Clear screen removes all gifts immediately.

## Windows 构建与 Release / ビルドと Release / Build and Release

在 Windows x64、Node.js 24 下运行 `node scripts/build-windows.mjs`。首次构建需要联网下载固定版本且校验 SHA-256 的 postject 构建工具，以及 Node.js 许可声明；使用者运行 EXE 不需要 npm 依赖。构建会输出：

- `dist/BiliGiftDrop-windows-x64.exe`：可直接运行的未签名预览版。
- `dist/BiliGiftDrop-v0.2.0-windows-x64.zip`：EXE、三语使用说明和 Node.js 许可声明。
- `dist/SHA256SUMS.txt`：ZIP 的 SHA-256 校验值。

GitHub Release 可上传 ZIP 与校验文件；本次只生成本地产物并提交源码和文档，未创建或上传远程 Release。`build/`、`dist/`、个人设置和缓存均被 Git 忽略。构建后的本机检查为 `node scripts/smoke-windows.mjs`，使用隔离数据和端口 19329，完成后停止测试进程。

日本語：Windows x64 と Node.js 24 で `node scripts/build-windows.mjs` を実行します。初回はビルドツールとライセンスをダウンロードします。`dist/` に EXE、説明書とライセンスを含む ZIP、SHA-256 ファイルを生成します。ZIP とチェックサムを GitHub Release に添付できます。未署名のプレビュー版であり、この作業では Release を公開していません。ビルド成果物と個人設定は Git に含めません。

English: Run `node scripts/build-windows.mjs` on Windows x64 with Node.js 24. The first build downloads the checksum-verified build tool and Node license. Outputs in `dist/` include the EXE, a ZIP with instructions and license notices, and its SHA-256 checksum. Upload the ZIP and checksum to GitHub Release when ready. This is an unsigned preview; no remote Release was published. Build outputs and personal settings are excluded from Git.

## 当前能力与限制 / 制限 / Limitations

- 三语控制面板、语言及配置保存、模拟真实礼物图片、透明画面、重力/旋转/圆形碰撞/弹跳/堆积/过期清理。
- 房间短号解析、WBI 签名、匿名 WebSocket 接入、心跳/重连、旧版及 V2 礼物消息解析、交易去重、动态礼物资料及图片缓存。
- 已实测公开房间匿名握手、987 条礼物资料、真实 V2 免费及付费礼物接收、图片缓存与浏览器掉落；尚未验收 OBS 软件内显示及所有礼物类型。匿名连接可能受平台限制，当前没有登录/授权功能。
- 固定 1920×1080 逻辑画布和圆形碰撞近似；拖拽区域编辑、金额档位编辑、长期实机压力验证与缓存空间管理待做。透明页不回放刷新前的礼物。
- 盲盒保留支付单价与爆出价值，效果暂按爆出价值计算；免费礼物不折算人民币；忽略连击汇总以避免重复掉落。

日本語：一部の実際の V2 ギフト受信とブラウザ上の落下表示は検証済みです。OBS 内の表示と全ギフト種類は未検証です。匿名接続が制限される場合があります。ログイン機能、ギフト領域のドラッグ編集と金額別プリセットは未実装です。SC は v0.4.0 で利用できます。画面更新時に過去のギフトは再生されません。

English: Some real V2 gifts and browser drops have been verified. Rendering inside OBS and all gift types are not yet verified. Anonymous access may be restricted. Login, gift-region drag editing and editable price tiers are not implemented. SC is available in v0.4.0. Refreshing the overlay does not replay earlier gifts.

## 文档

- [Windows EXE 三语使用与构建说明](docs/WINDOWS.md)：`node scripts/build-windows.mjs`，输出 `dist/BiliGiftDrop-v0.2.0-windows-x64.zip`，可上传 GitHub Release。无需使用者另装 Node.js。
- [Windows EXE 构建、启动修复与三语命令行日志](log/2026-10-24-windows-exe.md)
- [项目规划与进度](docs/PROJECT_PLAN.md)
- [接入研究与验证记录](docs/BILIBILI_INTEGRATION.md)
- [本次开发日志](log/2026-10-24-development.md)
- [初始需求纪要](log/2026-10-24-conversation.md)
- [真实送礼与金额门槛记录](log/2026-10-24-live-validation.md)
- [本轮任务汇总与验收日志](log/2026-10-24-acceptance.md)

## 开源许可 / ライセンス / License

本项目原创代码采用 [MIT License](LICENSE)，允许商用、修改、分发及闭源使用；分发时须保留版权和许可声明，软件不提供担保。第三方运行时、平台礼物图片、商标及其他第三方内容不因本项目许可而获得授权，须遵守其各自许可和平台条款。

日本語：本プロジェクトのオリジナルコードは [MIT License](LICENSE) で公開されています。商用利用、改変、再配布、非公開ソフトウェアへの組み込みが可能です。配布時は著作権表示と許諾表示を保持してください。無保証です。第三者のランタイム、ギフト画像、商標などには、それぞれのライセンスとプラットフォーム規約が適用されます。

English: Original project code is licensed under the [MIT License](LICENSE), allowing commercial use, modification, redistribution and inclusion in proprietary software. Retain the copyright and permission notices when distributing copies. The software is provided without warranty. Third-party runtimes, platform gift images, trademarks and other third-party content remain subject to their own licenses and platform terms.

### SC / 醒目留言 / スーパーチャット（v0.4.0）

中文：设置里启用醒目留言，调整左侧、顶部、宽度与自动折叠秒数（0关闭自动折叠）；修改自动保存。点击预览标题展开/折叠并同步 OBS，OBS 内使用“交互”。卡片不显示倒计时，到期自动移除。最多显示3条、保留最新100条，等待不会延长时间。运行 v0.4.0 EXE 或源码 start.cmd 使用此功能。

日本語：設定で SC を有効にし、左・上・幅・自動折りたたみ秒数（0で無効）を設定すると自動保存されます。見出しをクリックして展開・折りたたみを OBS と同期。OBS は「対話」を使用。カウントダウンは非表示で、期限切れで削除。最大3件表示、最新100件まで保持し、待機中も期限は延長されません。v0.4.0 の EXE または start.cmd で起動できます。

English: Enable SC in settings and adjust left, top, width and auto-collapse seconds (0 disables). Changes save automatically. Click preview headings to sync expansion with OBS; in OBS use Interact. Cards show no countdown and expire on schedule. Up to 3 display; latest 100 retained, with no lifetime extension while waiting. Run the v0.4.0 EXE or the source using start.cmd.
