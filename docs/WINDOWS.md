# Windows / 日本語 / English

命令行提示始终同时显示中文、日语和英语；不受控制面板语言设置影响。

コンソールの案内は、設定画面の言語にかかわらず、中国語・日本語・英語を同時に表示します。

Console instructions always appear in Chinese, Japanese and English together, regardless of the control panel language.

命令行窗口 / コンソール / Console：双击 EXE 后保留可见命令行窗口，窗口中显示控制面板与 OBS 地址。关闭此服务窗口（或 Ctrl+C）才会停止程序并释放端口；只关闭浏览器不会停止服务。如果提示已有服务运行，需要关闭原来的服务窗口。

EXE をダブルクリックするとコンソールが表示され、設定画面と OBS の URL を確認できます。このサービスウィンドウを閉じるか Ctrl+C で終了し、ポートを解放します。ブラウザを閉じてもサービスは停止しません。起動済みの場合は、元のサービスウィンドウを閉じてください。

Double-clicking the EXE keeps a visible console with the control panel and OBS URLs. Close that service window or press Ctrl+C to stop the program and release the port. Closing the browser does not stop the service. If a service is already running, close its original console window.

重复启动 / 再起動 / Launching again：已有礼物服务运行时自动打开已有控制面板，新进程退出属于正常行为。其他启动失败会显示错误码；交互窗口按回车关闭。

サービスが既に起動している場合は、その設定画面を開いて新しいプロセスを終了します。その他の起動エラーはコードを表示し、対話ウィンドウでは Enter キーを待ちます。

If the gift service is already running, another launch opens its control panel and exits normally. Other startup errors display an error code and wait for Enter in an interactive console.

简体中文：适用于 Windows 10/11 x64。解压后双击 `BiliGiftDrop-windows-x64.exe`，自动打开浏览器控制面板，无需安装 Node.js。保持服务窗口运行，关闭窗口即停止服务。OBS 浏览器源地址为 `http://127.0.0.1:19321/overlay`，宽 1920、高 1080。设置和缓存保存在 `%LOCALAPPDATA%\BiliGiftDrop`，升级时替换 EXE 即可。请先停止旧版本，再启动新版；端口 19321 被其他程序占用时会提示启动失败；已有礼物服务运行时会打开原面板。此构建未签名。SC 尚未实现，OBS 实机验收尚未完成。

日本語：Windows 10/11 x64 対応。展開して `BiliGiftDrop-windows-x64.exe` をダブルクリックすると、ブラウザに設定画面が開きます。Node.js のインストールは不要です。サービスのウィンドウを開いたままにしてください。閉じると停止します。OBS ブラウザソースは `http://127.0.0.1:19321/overlay`、幅 1920、高さ 1080。設定とキャッシュは `%LOCALAPPDATA%\BiliGiftDrop` に保存され、EXE を交換しても保持されます。更新前に旧版を終了してください。ポート 19321 を別のアプリが使用している場合はエラーを表示し、既存のギフトサービスの場合はその画面を開きます。署名なしのビルドです。SC は未実装、OBS 内の動作確認は未完了です。

English: Windows 10/11 x64. Extract and double-click `BiliGiftDrop-windows-x64.exe` to open the browser control panel. No Node.js installation is needed. Keep the service window open; closing it stops the service. Use `http://127.0.0.1:19321/overlay` as an OBS browser source, width 1920, height 1080. Settings and cache are stored in `%LOCALAPPDATA%\BiliGiftDrop` and survive EXE replacement. Stop the old version before upgrading. If another application uses port 19321, startup reports an error; an existing gift service is reused. This build is unsigned. SC is not implemented; testing inside OBS is still pending.

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
