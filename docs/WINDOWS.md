# Windows v0.6.6 Preview / 日本語 / English

当前包：BiliGiftDrop-v0.6.6-windows-x64.zip。支持礼物、SC和默认开启的大航海；单一预览编辑三个区域，各自透明度默认100%。大航海按素材比例显示，观众信息在下方，宽度设置最高100%，高素材缩小以适应画面。自定义大航海素材可正常替换默认像素舰船，三个等级按同一条中轴线对齐，每人播放时长可设置，位置与大小可一键恢复默认。礼物上限全部由设置决定，礼物尺寸只按单个礼物的单价；礼物和醒目留言都提供恢复默认按钮。以下按版本排列的说明保留功能演进，最终行为以v0.6.6为准。

現行パッケージはBiliGiftDrop-v0.6.6-windows-x64.zip。ギフト・SC・大航海を単一プレビューで編集し、各不透明度の初期値は100%。大航海は素材比率を維持して情報を下に表示、要求幅は最大100%、画面高さに合わせて縮小。カスタム素材は既定のピクセル艦船を置き換えて表示し、3 ランクは同じ中心軸で揃います。1 人あたりの再生時間を設定でき、位置とサイズは初期値に戻せます。ギフトの上限は設定値に従い、サイズは 1 個あたりの単価だけで決まり、ギフトとスーパーチャットの設定に初期化ボタンがあります。以下の版別説明は履歴、最終動作はv0.6.6です。

Current package: BiliGiftDrop-v0.6.6-windows-x64.zip. One preview edits gifts, SC and enabled-by-default subscriptions; opacity defaults to100% per layer. Subscription proportions follow media with viewer details below, up to100% requested width and scaling down to fit canvas height. Custom subscription media replaces the default pixel ship, all three tiers share one center axis, play time per viewer is configurable, and position/size can be restored to defaults. Gift caps follow your settings, gift size depends only on the unit price, and both gift and Super Chat settings include restore-defaults buttons. Versioned sections below retain history; v0.6.6 describes final behavior.

验收：33项自动测试和本机EXE回归，浏览器移动/缩放、竖版GIF、替换素材实际显示、放开后的上限保存、三个上舰模拟按钮、礼物/大航海/醒目留言恢复默认、不同比例素材共用中轴及播放时长生效检查已有证据。真实上舰、付费SC、OBS、全部视频编码、长期和全新Windows仍待验收。 / 検証：自動33件・EXE回帰、ブラウザ操作・縦長GIF・カスタム素材表示・上限値の保存・3つの大航海テストボタン・各設定の初期化・比率の異なる素材の中心軸一致・再生時間の反映を確認。実際の上艦・SC・OBS・全コーデック・長時間・新規Windowsは未検証。 / Validation includes33 automated tests, local EXE regression, browser interaction, portrait GIF, replaced media display, saved uncapped values, all three subscription test buttons, gift/Great Voyage/Super Chat resets, one shared center axis across media ratios and the configured play time. Real subscriptions, paid SC, OBS, all codecs, long-running streams and clean Windows installations remain unverified.


命令行提示始终同时显示中文、日语和英语；不受控制面板语言设置影响。

コンソールの案内は、設定画面の言語にかかわらず、中国語・日本語・英語を同時に表示します。

Console instructions always appear in Chinese, Japanese and English together, regardless of the control panel language.

命令行窗口 / コンソール / Console：双击 EXE 后保留可见命令行窗口，窗口中显示控制面板与 OBS 地址。关闭此服务窗口（或 Ctrl+C）才会停止程序并释放端口；只关闭浏览器不会停止服务。如果提示已有服务运行，需要关闭原来的服务窗口。

EXE をダブルクリックするとコンソールが表示され、設定画面と OBS の URL を確認できます。このサービスウィンドウを閉じるか Ctrl+C で終了し、ポートを解放します。ブラウザを閉じてもサービスは停止しません。起動済みの場合は、元のサービスウィンドウを閉じてください。

Double-clicking the EXE keeps a visible console with the control panel and OBS URLs. Close that service window or press Ctrl+C to stop the program and release the port. Closing the browser does not stop the service. If a service is already running, close its original console window.

重复启动 / 再起動 / Launching again：已有礼物服务运行时自动打开已有控制面板，新进程退出属于正常行为。其他启动失败会显示错误码；交互窗口按回车关闭。

サービスが既に起動している場合は、その設定画面を開いて新しいプロセスを終了します。その他の起動エラーはコードを表示し、対話ウィンドウでは Enter キーを待ちます。

If the gift service is already running, another launch opens its control panel and exits normally. Other startup errors display an error code and wait for Enter in an interactive console.

简体中文：适用于 Windows 10/11 x64。解压后双击 `BiliGiftDrop-windows-x64.exe`，自动打开浏览器控制面板，无需安装 Node.js。保持服务窗口运行，关闭窗口即停止服务。OBS 浏览器源地址为 `http://127.0.0.1:19321/overlay`，宽 1920、高 1080。设置和缓存保存在 `%LOCALAPPDATA%\BiliGiftDrop`，升级时替换 EXE 即可。请先停止旧版本，再启动新版；端口 19321 被其他程序占用时会提示启动失败；已有礼物服务运行时会打开原面板。此构建未签名。SC 已提供预览功能，真实SC与OBS实机验收尚未完成。

日本語：Windows 10/11 x64 対応。展開して `BiliGiftDrop-windows-x64.exe` をダブルクリックすると、ブラウザに設定画面が開きます。Node.js のインストールは不要です。サービスのウィンドウを開いたままにしてください。閉じると停止します。OBS ブラウザソースは `http://127.0.0.1:19321/overlay`、幅 1920、高さ 1080。設定とキャッシュは `%LOCALAPPDATA%\BiliGiftDrop` に保存され、EXE を交換しても保持されます。更新前に旧版を終了してください。ポート 19321 を別のアプリが使用している場合はエラーを表示し、既存のギフトサービスの場合はその画面を開きます。署名なしのビルドです。SCのプレビュー機能を提供していますが、実際のSCとOBS内の動作確認は未完了です。

English: Windows 10/11 x64. Extract and double-click `BiliGiftDrop-windows-x64.exe` to open the browser control panel. No Node.js installation is needed. Keep the service window open; closing it stops the service. Use `http://127.0.0.1:19321/overlay` as an OBS browser source, width 1920, height 1080. Settings and cache are stored in `%LOCALAPPDATA%\BiliGiftDrop` and survive EXE replacement. Stop the old version before upgrading. If another application uses port 19321, startup reports an error; an existing gift service is reused. This build is unsigned. SC preview is included; real SC and testing inside OBS are still pending.

礼物默认从生成起最多存在 30 秒，最后 0.75 秒淡出。可设置 5–120 秒；拥挤时旧礼物提前淡出，缩小上限时超额旧对象直接移除。v0.2.0 默认每秒最多生成 12 个、同时最多 120 个，估算面积预算为掉落区域的 15%；待生成效果超过 1.5 秒丢弃。可在设置中调整区域左/上/宽/高百分比以避开主播。最近记录保留原始赠送数量，图标数量可能少于赠送数量。

ギフトは生成から既定で最大 30 秒間表示され、最後の 0.75 秒でフェードアウトします。5～120 秒に設定可能です。混雑時は早めに消え、上限を縮小すると超過分を削除します。v0.2.0 の既定は毎秒 12 個、最大 120 個、落下領域の推定面積 15%。生成待ちは 1.5 秒で破棄されます。領域の位置とサイズを百分率で設定できます。履歴の数量は元の値を保持し、表示アイコン数とは異なる場合があります。

Gifts last up to 30 seconds by default and fade during the final 0.75 seconds. Lifetime is configurable from 5 to 120 seconds. Crowding fades older gifts early; reducing limits removes excess old icons immediately. v0.2.0 defaults to 12 icons/second, 120 active icons and a conservative 15% drop-region area budget. Pending effects expire after 1.5 seconds. Configure the region position and size in percentages to avoid your camera. History retains original gift quantities; fewer visual icons may appear.

开发构建 / 開発ビルド / Developer build: `node scripts/build-windows.mjs` (Windows x64, Node.js 24; initial build downloads checksum-verified postject and Node license). Runtime code has no external npm dependencies.


## v0.3.0 礼物尺寸 / ギフトサイズ / Gift size

控制面板「掉落设置」可保存最小尺寸、最大尺寸和满尺寸金额；默认 50%、150%、100 元。按本次总金额线性缩放，免费取最小值；保存后对新收到的礼物生效。100% 为 80 像素（1920 × 1080 画布），安全限制可能缩小实际尺寸。

日本語：最小・最大サイズと最大サイズに達する金額を保存できます。既定は 50%、150%、100 人民元です。今回の合計金額に比例し、無料は最小サイズ。保存後の新しいギフトに適用します。

English: Save minimum size, maximum size and the amount for maximum size. Defaults: 50%, 150%, CNY 100. Size scales with the event total; free gifts use the minimum. Changes apply to newly received gifts. Region and area protection may reduce the displayed size.


## v0.3.1 自动保存 / 自動保存 / Autosave

掉落设置的有效数值和免费开关在停止输入约 400 毫秒后自动保存并同步到 overlay，无需点击保存。空值及无效输入不保存，失败提示后可用保存按钮重试。

日本語：有効な数値・無料ギフト設定は約 400 ミリ秒後に自動保存されます。無効な値は保存しません。失敗時は保存ボタンで再試行できます。

English: Valid drop settings save automatically after about 400 ms without typing. Invalid values are not saved. Use the Save button to retry after an error.

## v0.4.0 SC / 醒目留言 / スーパーチャット

中文：启用醒目留言，在布局框拖动位置（松开立即保存），或修改左侧、顶部与宽度（停止输入约400毫秒后保存）；默认15秒折叠，0关闭折叠。点击预览标题展开并同步OBS，OBS内使用“交互”。不显示倒计时，到期移除。关闭显示与切换语言不重置有效期。v0.5.0起按区域高度显示，超出时滚动，保留最新100条且不延长有效期。

日本語：SCを有効にし、枠をドラッグして位置を保存、または左・上・幅を入力して約400ミリ秒後に自動保存。初期値15秒で折りたたみ、0で無効。見出しをクリックして展開しOBSと同期（OBSでは「対話」）。カウントダウンは非表示で期限切れで削除。非表示・言語変更でも期限は変わりません。v0.5.0以降は領域の高さに応じて表示し、超過時はスクロールします。最新100件まで保持します。

English: Enable SC and drag the layout box (saves on release), or edit left/top/width (saves after about400ms). Default collapse delay15 seconds;0 disables it. Click headings to expand and sync OBS; use Interact inside OBS. No countdown is shown. Cards expire on schedule; hiding or switching language never resets expiry. From v0.5.0, cards fill the region and overflow scrolls; the latest100 are retained without extending expiry.

## v0.4.1 默认开启 / 初期設定オン / Enabled by default

中文：新安装和缺少SC设置的旧配置默认开启醒目留言；手动关闭并保存后，刷新和重启仍保持关闭。

日本語：新規インストールとSC設定のない旧設定では初期値がオンです。保存したオフ設定は画面更新・再起動後も保持されます。

English: SC defaults on for new installations and older configurations without the setting. A saved off choice stays off across refreshes and restarts.

## v0.5.0 区域滚动 / スクロール / Region scrolling

中文：SC不再限制3条。区域高度默认延伸到画面底部，超出后缓慢上下往返，端点停2秒。设置“SC区域高度”和“SC滚动速度”自动保存；默认20画布像素/秒，0停止。悬停或聚焦暂停滚动，便于展开留言；到期时间继续计时。保留最新100条，滚动不会延长留言寿命。

日本語：SCの3件制限を撤廃。表示高さを超えると上下に往復し両端で2秒停止。高さ・速度は自動保存、初期値20画素/秒、0で停止。ホバー・フォーカス中は一時停止しますが期限は進みます。最新100件まで保持します。

English: No three-card SC limit. Overflow scrolls back and forth within the configured height, pausing two seconds at each end. Height and speed save automatically; default20 canvas pixels/second, 0 stops motion. Hover/focus pauses scrolling without pausing expiry. Retains the latest100 messages.


## v0.6.0 大航海 / 大航海 / Great Voyage

中文：默认开启；同一预览中拖动大航海框移动，右下角缩放。用“模拟上舰”查看等级、月数和顺序播放。每个等级可上传图片/GIF/MP4/WebM，最大32 MiB，视频静音循环，每位8秒。素材保存在程序数据目录的media/，配置在data/；迁移时保留两个目录。窗口关闭会停止服务且不恢复旧队列。真实上舰、OBS与视频编码兼容性需实机确认。

日本語：初期設定は有効。同じプレビューの大航海枠を移動、右下でサイズ変更。テストでランク・月数・順次再生を確認。画像/GIF/MP4/WebM、最大32 MiB、無音ループ、1人8秒。素材はmedia/、設定はdata/に保存し、移行時は両方を保持。終了後は待機列を復元しません。実際の上艦、OBS、動画コーデックは実機確認が必要。

English: Enabled by default. Drag the Great Voyage frame in the shared preview; resize with its bottom-right corner. Simulate subscriptions to check tiers, months and sequential playback. Images/GIF/MP4/WebM up to 32 MiB; videos loop muted, 8 seconds per viewer. Assets live in media/ and settings in data/ under the program data directory; retain both when moving. Queues do not survive shutdown. Real subscriptions, OBS and video codecs require validation.

v0.6.0追加：同一预览用绿色框编辑礼物范围、紫色框编辑SC宽高、蓝色框等比例编辑大航海。三类各有透明度滑杆，默认100%。 / 単一プレビュー：緑はギフト、紫はSC、青は大航海。各不透明度の初期値は100%。 / One preview: green gifts, purple SC, blue Great Voyage; each opacity slider defaults to 100%.

v0.6.2：图片/GIF/视频按实际素材比例显示，编辑框自动跟随；头像昵称期限放在下方，画面高度不足时整体等比例缩小。 / 画像・GIF・動画の比率に編集枠も自動対応。情報は下に表示し、画面内に収まるよう縮小。 / Image/GIF/video aspect ratios determine the editor and effect layout. Viewer details sit below; the whole effect scales down to fit when needed.

v0.6.3：修复替换后的自定义大航海素材不显示，默认像素舰船画布不再占用版面；已上传素材无需重新上传。 / 置き換えたカスタム素材が表示されない不具合を修正。既定艦船キャンバスは領域を占有しません。再アップロード不要。 / Fixes replaced custom subscription media not appearing; the default ship canvas no longer occupies the layout. No re-upload needed.

v0.6.4：取消礼物后台固定上限（40 个、队列 32 组/1.5 秒、半径 1/3），数量、面积、生成速率和尺寸输入不再封顶；礼物设置新增恢复默认按钮；模拟上舰改为舰长/提督/总督三个按钮。 / ギフトの固定上限を撤廃し、数量・面積・生成速度・サイズの入力上限も解除。ギフト設定に初期化ボタン、大航海テストに 3 つのランクボタンを追加。 / Removes fixed gift caps and the count/area/rate/size input ceilings; adds restore-gift-defaults and three subscription test buttons.

v0.6.5：礼物尺寸只按单个礼物的单价，数量只影响图标个数；大航海三个等级按同一中轴线对齐，旧布局首次打开面板时自动换算为居中位置且画面不移动。 / ギフトサイズは単価のみで決まり、個数はアイコン数のみ変更。大航海の 3 ランクは同じ中心軸で揃い、既存配置は初回のパネル表示で中心へ換算され画面は動きません。 / Gift size follows the unit price only, quantity changes the icon count; Great Voyage tiers share one center axis, and existing layouts convert to it on first panel load without moving.

v0.6.6：大航海每人播放时长可设置（默认8秒，最小1秒，无上限，从下一位生效）；新增“恢复大航海位置与大小”和“恢复醒目留言默认设置”，均不清除素材、现有留言或有效期。 / 大航海の1人あたり再生時間を設定可能（初期8秒・最小1秒・上限なし、次の待機者から適用）。「位置とサイズを初期値に戻す」「スーパーチャット設定を初期値に戻す」を追加。素材・表示中のコメント・有効期限は保持。 / Configurable play time per viewer (8s default, 1s minimum, no upper bound, applies from the next viewer), plus restore buttons for Great Voyage position/size and Super Chat defaults that keep media, visible messages and expiry.
