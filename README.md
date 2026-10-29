# Bili Gift Drop

B站直播礼物、醒目留言（SC）与大航海的本地 OBS 透明画面工具。浏览器设置，支持简体中文、日本語和 English。

Bilibili配信用のギフト・SC・大航海を表示するローカルOBSツール。ブラウザで設定し、中国語・日本語・英語に対応。

A local, transparent OBS overlay for Bilibili gifts, Super Chat and Great Voyage subscriptions, with a Chinese/Japanese/English browser control panel.

## 当前版本 / 現行版 / Current version

**v0.6.8 Preview** · Windows x64 · [Release notes](docs/releases/v0.6.8.md) · [验收记录 / 検証 / Acceptance](docs/ACCEPTANCE.md)

- ZIP: `BiliGiftDrop-v0.6.8-windows-x64.zip`
- Tag: `v0.6.8`
- Title: **Bili Gift Drop v0.6.8 — 醒目留言与大航海头像（Preview）**
- 发布材料位于 `dist/RELEASE_TAG.txt`、`dist/RELEASE_TITLE.txt`、`dist/RELEASE_NOTES.md` 和 `dist/SHA256SUMS.txt`。 / リリース用ファイルは `dist/` 内。 / Release fields and checksums are prepared in `dist/`.

图片兼容修复：按 PNG/JPEG/GIF/WebP 文件签名识别，兼容 CDN 返回 `Content-Type: png`，错误网页不缓存。

画像互換性の修正：ファイル署名で PNG/JPEG/GIF/WebP を判定し、CDN の `Content-Type: png` に対応。エラーページは保存しません。

Image compatibility fix: identify PNG/JPEG/GIF/WebP by file signature, accepting CDN `Content-Type: png` labels while rejecting error pages.

v0.6.8：SC 在昵称左侧显示圆形头像；大航海与 SC 在消息缺少头像或下载失败时，按 UID 查询公开资料并缓存。无需登录或付费测试；失败显示昵称首字。异步补齐不重置 SC 到期/折叠状态或大航海播放时间。模拟按钮使用本地示例头像。

v0.6.8：SC の名前の左に丸いアバターを表示。大航海と SC はアバターがない場合や取得に失敗した場合、UID で公開情報を照会して保存します。ログイン・有料テスト不要。失敗時は名前の先頭文字を表示し、SC の期限・開閉状態と大航海の再生時間を維持します。テストボタンはローカルのサンプル画像を使います。

v0.6.8: SC shows a round avatar to the left of the sender name. Missing or failed SC and subscription avatars use public UID profile lookup and local caching, without login or paid testing. Failures show the name initial. Async updates preserve SC expiry/collapse state and subscription timing. Simulation buttons use a local sample avatar.

## 简体中文

### 启动与 OBS

1. 解压 Windows 包，双击 `BiliGiftDrop-windows-x64.exe`，无需安装 Node.js。
2. 保持服务命令行窗口打开；浏览器未自动打开时访问 [控制面板](http://127.0.0.1:19321)。
3. 输入 B 站直播间号并连接；可先用模拟礼物、模拟 SC、模拟上舰检查画面，不产生实际购买。
4. OBS 添加浏览器源：`http://127.0.0.1:19321/overlay`，宽1920、高1080。预览棋盘格和编辑框不会出现在透明输出中。
5. 关闭服务窗口或按 Ctrl+C 才会停止程序。升级前先关闭旧服务；重复启动会复用已有面板。

### 画面与设置

- 一个预览，三个独立设置分区。绿色框为礼物掉落区域，拖动标签移动，右下角调整宽高；紫色框为SC，可移动和独立调整宽高；蓝色框为大航海，按素材比例缩放。保留百分比输入与方向键微调，拖动松开保存，数值停止输入约400毫秒后保存。
- 礼物、SC、大航海各有0–100%透明度滑杆，默认100%。切换语言和修改透明度不清空效果、不重置SC到期或大航海队列。
- 礼物按单个礼物的单价缩放，数量只影响图标个数；最小50%、最大150%、100元达到最大为默认值。100%对应1920×1080画布中的80像素。最低触发金额按单价判断；画面数量、生成速度、面积和尺寸由用户设置约束；待生成队列不设固定容量或超时丢弃。礼物设置可独立恢复默认。
- SC默认开启，独立按平台有效期移除，无可见倒计时。默认15秒折叠，0关闭折叠；标题可展开。有效卡片按区域高度排列，超出后往返滚动，默认20画布像素/秒，0停止。悬停或聚焦暂停滚动但不暂停到期。最多保留最新100条。可打开透明画面或在OBS浏览器源中使用“交互”操作卡片。
- 大航海默认开启，显示头像、原始昵称、舰长/提督/总督和本次购买期限。明确单位为月时显示“3个月舰长”等，特殊单位保留原信息，缺期限标记未知，缺头像显示昵称首字。
- 每位上舰播放时长可设置（默认8秒、最小1秒、无上限，修改从下一位生效），按收到顺序依次播放，最多100位等待；满队提示并跳过新事件。关闭大航海、换房或清空会清除对应队列；重启不回放旧购买。一次多月只播放一次。
- 三个等级分别提供AI像素舰船默认素材，可替换PNG/JPEG/WebP/GIF/MP4/WebM，单文件不超过32 MiB。视频静音循环，每位按配置时长轮换。各等级按实际图片/GIF尺寸或视频元数据决定比例，观众信息独立位于素材下方。设置宽度最大100%，高素材会整体缩小以适应画面，不拉伸素材。读取或解码失败回退默认显示。
- 更换素材后，预览会按当前播放等级布局；空闲时点击舰长、提督或总督模拟按钮测试对应等级，共用月数输入。三个等级共用中轴线；大航海位置与大小、醒目留言设置各有恢复默认按钮，保留素材和现有留言有效期。

### 保存、验收与限制

EXE设置、缓存及上传素材在 `%LOCALAPPDATA%\BiliGiftDrop`；配置在 `data/`、上传素材在 `media/`。升级替换EXE即可；迁移电脑时保留配置和素材两个目录。源码运行默认使用项目目录，`BILI_GIFT_DATA_DIR`可指定隔离数据目录。

37项自动测试和本机EXE隔离回归通过；已有浏览器鼠标移动/缩放、三语桌面和100×200竖版GIF比例证据。真实大航海、真实付费SC与各金额配色、OBS实机、完整三语窄屏、全部视频编码、长期直播和全新Windows环境仍待验收。匿名连接可能受平台限制；不保证收到的上舰通知总含头像、明确月份或稳定的交易标识。部分真实V2礼物已验证，不能据此推定所有平台事件均通过。本构建未签名，作为预览发布。

## 日本語

1. Windows x64 ZIPを展開し `BiliGiftDrop-windows-x64.exe` を起動。Node.js不要。コンソールを開いたまま [設定画面](http://127.0.0.1:19321) でルーム番号を入力します。テスト機能は実際の購入を発生させません。
2. OBSブラウザソースに `http://127.0.0.1:19321/overlay`、幅1920・高さ1080を設定。市松模様と編集枠は出力されません。終了はコンソールを閉じるかCtrl+C。更新前に旧サービスを停止してください。
3. 単一プレビュー上で、緑のギフト領域はラベルをドラッグして移動、右下で幅・高さ変更。紫のSCも幅と高さを個別に変更。青の大航海は素材比率を維持。数値入力・矢印キーも使用でき、離した時または入力停止後約400msで自動保存します。各エフェクトの不透明度は0–100%、初期100%。言語・不透明度の変更でタイマーをリセットしません。
4. ギフトサイズは1個あたりの単価で決まり、個数はアイコン数のみ変更。既定50%–150%、100人民元で最大、100%は1920×1080上の80px。最低額は単価で判定し、表示個数・面積・生成速度・サイズはユーザー設定に従います。生成待ちに固定容量や時間切れはなく、ギフト設定は初期化できます。
5. SCは初期設定で有効。期限は個別、カウントダウンなし。既定15秒で折りたたみ、0で無効。領域を超えると初期20画素/秒で往復し、0で停止。ホバー・フォーカスでスクロールを一時停止しますが期限は進みます。最新100件まで保持。透明画面、またはOBSの「対話」で見出しを操作できます。
6. 大航海は初期設定で有効。アバター・元の名前・ランク・今回の購入期間を表示。月以外の単位は元情報を保持し、期間不明は不明、アバター未取得は名前の先頭文字を表示。1人あたりの時間は設定可能（初期8秒、最小1秒、上限なし、次の人から適用）。受信順、最大100人待機。満杯時は新規分を通知してスキップ。複数月でも1回再生。無効化・ルーム変更・クリアで列を消去し、再起動後は過去分を再生しません。
7. 各ランクの標準AI素材をPNG/JPEG/WebP/GIF/MP4/WebM（最大32 MiB）に置換可能。動画は無音ループ。画像・GIFサイズまたは動画メタデータから比率を自動計算し、視聴者情報は下に表示。設定幅は最大100%、縦長素材は画面内に収まるよう全体を縮小。失敗時は標準表示。待機中は艦長・提督・総督の3つのテストボタンと共通の月数入力を使用します。3ランクは同じ中心軸で揃い、大航海の位置・サイズとSC設定を初期化できます。素材やコメントの有効期限は保持します。
8. 保存先は `%LOCALAPPDATA%\BiliGiftDrop`、設定は `data/`、素材は `media/`。移行時は両方を保持。37件の自動テスト・EXE回帰と一部ブラウザ操作は検証済み。実際の上艦・有料SC・OBS、完全な3言語狭幅レイアウト、全コーデック、長時間配信、新規Windows環境は未検証。匿名接続が制限されたり、一部フィールドが欠ける場合があります。署名なしのプレビュー版です。

## English

1. Extract the Windows x64 ZIP and run `BiliGiftDrop-windows-x64.exe`. No Node.js installation is required. Keep its console open and enter a room ID in the [control panel](http://127.0.0.1:19321). Simulations do not make purchases.
2. Add an OBS browser source at `http://127.0.0.1:19321/overlay`, width 1920, height 1080. Checkerboard and editing frames are preview-only. Close the console or press Ctrl+C to stop; stop the previous service before upgrading.
3. One preview contains green gift-region, purple SC and blue subscription frames. Drag the gift label to move its region; use bottom-right handles to resize gift/SC width and height independently. Subscription resizing follows media proportions. Numbers and arrow keys remain available. Changes save on release or about 400 ms after typing. Each layer has a 0–100% opacity slider, default 100%. Language and opacity changes preserve timers.
4. Gift sizes follow the unit price; quantity only changes the icon count. Defaults are 50%–150%, reaching maximum at CNY 100;100% means 80 px on a 1920×1080 canvas. Minimum trigger price uses unit price. On-screen count, spawn rate, area and size follow user settings. Pending gifts have no fixed queue cap or expiry. Gift settings have a restore-defaults button.
5. SC is enabled by default, expires independently and shows no countdown. Default collapse delay is 15 seconds;0 disables it. Overflow scrolls back and forth at 20 canvas pixels/second by default;0 stops motion. Hover/focus pauses scrolling without pausing expiry. Retains the latest 100 active messages. Use the transparent page or OBS Interact to operate headings.
6. Subscriptions are enabled by default and show avatar, original name, tier and purchased duration. Non-month units retain their original information; missing duration is marked unknown and missing avatars use the first name character. Play time is configurable (8 seconds by default, minimum 1, no upper bound), applying from the next viewer, in arrival order, with up to 100 waiting. Full queues skip new events with a warning. Multi-month purchases play once. Disabling, changing room or clearing removes the queue; shutdown never replays old purchases.
7. Replace each tier’s default AI pixel ship with PNG/JPEG/WebP/GIF/MP4/WebM, up to 32 MiB per file. Videos loop muted. Native image/GIF dimensions or video metadata determine layout; viewer details sit below. Requested width supports 100%, with tall content scaling down to fit the canvas. Failures fall back to default display. While idle, use the Captain, Admiral or Governor test buttons with the shared month input. All tiers share a center axis. Restore buttons reset subscription position/size or SC settings while preserving media and message expiry.
8. EXE data lives in `%LOCALAPPDATA%\BiliGiftDrop`: configuration in `data/`, uploaded files in `media/`. Retain both when moving computers.37 automated tests and local EXE regressions pass, with browser interaction and portrait-GIF evidence. Real subscriptions, paid SC/colors, OBS, complete narrow layouts in all three languages, all codecs, long-running streams and clean Windows installations remain unverified. Anonymous access may be restricted and platform fields may be missing. This is an unsigned preview.

## 开发 / 開発 / Development

源码运行 / ソース起動 / Run source（Node.js22+；本机验证Node.js24 / tested with Node.js24）：

```powershell
node src/server/index.mjs
node --test
```

Windows x64构建与隔离回归 / ビルドと検証 / Build and isolated regression：

```powershell
node scripts/build-windows.mjs
node scripts/smoke-windows.mjs
```

运行代码无外部npm依赖；首次构建下载并校验postject及Node许可。 / ランタイムは外部npm依存なし。初回ビルドでpostjectとNodeライセンスを取得。 / Runtime has no external npm dependencies; the first build downloads verified postject and Node license notices.

## 文档与许可 / 資料・ライセンス / Documentation and license

[Windows说明](docs/WINDOWS.md) · [工程规划](docs/PROJECT_PLAN.md) · [验收报告](docs/ACCEPTANCE.md) · [本轮日志](log/2026-10-26-guard-duration-resets.md) · [接入研究](docs/BILIBILI_INTEGRATION.md)

原创代码采用 [MIT License](LICENSE)，允许商用、修改和分发，保留版权与许可，无担保。第三方运行时、平台图片和商标遵循各自许可和平台规则。 / オリジナルコードはMIT、商用利用・改変・再配布可。著作権と許諾表示を保持、無保証。第三者コンテンツには各規約が適用されます。 / Original code is MIT licensed, permitting commercial use, modification and redistribution with notices retained, without warranty. Third-party runtimes, platform images and trademarks follow their own licenses and rules.
