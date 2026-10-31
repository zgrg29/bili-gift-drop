# Windows v0.6.15 Preview / 日本語 / English

当前包：BiliGiftDrop-v0.6.15-windows-x64.zip。支持礼物、SC和默认开启的大航海；单一预览编辑三个区域，各自透明度默认100%。大航海按素材比例显示，观众信息在下方，宽度设置最高100%，高素材缩小以适应画面。自定义大航海素材可正常替换默认像素舰船，三个等级按同一条中轴线对齐，每人播放时长可设置，位置与大小可一键恢复默认。礼物上限全部由设置决定，礼物尺寸只按单个礼物的单价；礼物和醒目留言都提供恢复默认按钮。控制台最下方新增可折叠的本场直播礼物历史，按观众汇总并显示电池；历史观众显示头像和昵称，匿名连接的星号礼物昵称在事件有 UID 时用公开资料补全；没有 UID 时用事件头像兜底，昵称保留平台星号。控制台左侧新增 B 站登录（扫码/手动 Cookie），登录后使用账号 Cookie/UID 连接；匿名连接可能隐藏礼物观众昵称/UID，完整昵称通常需要登录。以下按版本排列的说明保留功能演进，最终行为以v0.6.15为准。

現行パッケージはBiliGiftDrop-v0.6.15-windows-x64.zip。ギフト・SC・大航海を単一プレビューで編集し、各不透明度の初期値は100%。大航海は素材比率を維持して情報を下に表示、要求幅は最大100%、画面高さに合わせて縮小。カスタム素材は既定のピクセル艦船を置き換えて表示し、3 ランクは同じ中心軸で揃います。1 人あたりの再生時間を設定でき、位置とサイズは初期値に戻せます。ギフトの上限は設定値に従い、サイズは 1 個あたりの単価だけで決まり、ギフトとスーパーチャットの設定に初期化ボタンがあります。コンソール最下部に折りたたみ式の配信ギフト履歴を追加し、視聴者ごとに集計してバッテリーを表示。履歴にはアバターと名前を表示し、匿名接続の星号名は UID がある場合に公開情報で補完、UID がない場合はイベント画像でアバターのみ補完します。コンソール左側に B 站ログイン（QR/Cookie）を追加し、ログイン後はアカウントの Cookie/UID で接続します。匿名接続では名前/UID が隠れる場合があり、完全な名前には通常ログインが必要です。以下の版別説明は履歴、最終動作はv0.6.15です。

Current package: BiliGiftDrop-v0.6.15-windows-x64.zip. One preview edits gifts, SC and enabled-by-default subscriptions; opacity defaults to100% per layer. Subscription proportions follow media with viewer details below, up to100% requested width and scaling down to fit canvas height. Custom subscription media replaces the default pixel ship, all three tiers share one center axis, play time per viewer is configurable, and position/size can be restored to defaults. Gift caps follow your settings, gift size depends only on the unit price, and both gift and Super Chat settings include restore-defaults buttons. A collapsible this-stream gift history at the bottom of the control panel groups support by viewer and shows batteries; it shows viewer avatars and names, resolving masked anonymous gift names through public UID lookup when a UID exists and falling back to the event face when the UID is empty. A Bilibili login (QR/manual cookies) is available on the left; after login the app connects with the account's cookies/UID. Anonymous connections may hide gift-viewer names/UIDs; full nicknames usually require login. Versioned sections below retain history; v0.6.15 describes final behavior.

v0.6.15 登录二维码修复：本地静态服务现在为 `.js` 返回 JavaScript Content-Type，二维码库可正常执行，登录面板显示二维码。兜底不再显示可点击链接，只显示可选文本，避免误跳 B 站外部登录页或下载第三方播放器；界面提示用手机客户端扫码。登录/Cookie/历史/翻译逻辑不变。用户实测扫码登录成功（2026-10-31）；登录后完整礼物昵称是否解除遮罩待确认。

v0.6.15 ログイン QR 修正：静的配信が `.js` に JavaScript Content-Type を返すようになり、QR ライブラリが実行されログイン画面に QR が表示されます。フォールバックはクリック可能なリンクをやめ、選択可能なテキストのみにして、外部ログインページや第三者プレイヤーのダウンロードへの誤遷移を防ぎます。スマホアプリでのスキャンを案内します。ログイン/Cookie/履歴/翻訳は変更ありません。ユーザーが QR ログイン成功を実測（2026-10-31）。ログイン後の完全なギフト名の伏せ解除は確認待ちです。

v0.6.15 login QR fix: the static server now returns a JavaScript Content-Type for `.js`, so the QR library executes and the login panel shows a QR code. The fallback is selectable text instead of a clickable link, preventing accidental navigation to Bilibili's external login page or third-party player downloads; the UI tells users to scan with the mobile app. Login/cookie/history/translation logic is unchanged. The user confirmed a successful QR login on 2026-10-31; whether gift-name masks are fully removed after login is pending confirmation.

v0.6.14 B 站登录：控制台左侧可手机扫码或手动粘贴 Cookie。界面提示匿名连接可能隐藏礼物观众昵称/UID，完整昵称通常需要登录。登录后使用账号 Cookie/UID 连接；凭据默认只在内存，勾选「记住登录」才写入本机数据目录；不写日志、不出现在状态 API/OBS/截图，也不发往 Bilibili 以外服务。登录成功自动重连，退出登录回匿名。二维码使用 MIT 许可的 qrcode-generator，许可随 ZIP 提供。

v0.6.14 B 站ログイン：コンソール左側でスマホ QR または Cookie 貼り付け。匿名接続では名前/UID が隠れる場合があり、完全な名前には通常ログインが必要と明示。ログイン後はアカウントの Cookie/UID で接続。情報は初期設定でメモリのみ、『ログインを記憶』でローカル保存。ログ、状態 API、OBS、スクリーンショットには出さず、Bilibili 以外へ送りません。成功時は自動再接続、ログアウトで匿名。QR は MIT ライセンスの qrcode-generator を使用し、ライセンスを ZIP に同梱。

v0.6.14 Bilibili login: the left panel supports mobile QR or manual cookie input. The UI warns that anonymous connections may hide gift-viewer names/UIDs and that full nicknames usually require login. After login the app connects with the account's cookies/UID. Credentials are memory-only by default; "Remember login" writes them to the local data directory. They never appear in logs, status APIs, OBS or screenshots, and are not sent anywhere except Bilibili. A successful login reconnects automatically; logout returns to anonymous. QR generation uses the MIT-licensed qrcode-generator, whose license is included in the ZIP.

v0.6.13 空 UID 礼物头像兜底：部分匿名礼物事件的 UID 为空、昵称被平台遮罩，但 `face` 头像仍在。历史现在即使没有 UID 也会缓存事件头像并更新对应观众，头像可正常显示；昵称仍保留平台 `欠***` 遮罩，因为事件没有 UID，公开资料无法补全。完整昵称需要登录/Cookie 或其他授权来源；v0.6.13 当时仍不使用 Cookie，v0.6.14 起支持登录。

v0.6.13 空 UID ギフトのアバター補完：匿名ギフトイベントの一部は UID が空で名前が伏せられますが、`face` アバターは残っています。UID がなくてもイベント画像を保存して該当視聴者に反映し、アバターを表示します。UID がないため公開情報で名前は補完できず、`欠***` の伏せ名は残ります。完全な名前にはログイン/Cookie など許可済みの情報源が必要です。v0.6.13 時点では Cookie を使いませんでしたが、v0.6.14 でログインを追加しました。

v0.6.13 empty-UID gift avatar fallback: some anonymous gift events have an empty UID and a masked name, but still carry a `face` avatar. History now caches that face and updates the viewer even without a UID, so the avatar appears. The nickname remains the platform mask such as `欠***` because the event has no UID and public lookup cannot recover it. A full nickname needs login/cookies or another authorized source; v0.6.13 still used no cookies, and v0.6.14 adds a login option.

v0.6.12 礼物翻译与 SC 翻译按钮：历史礼物名称默认用内置词典翻译；中文原名保留，日语界面显示日语译名和片假名读音，英语界面只显示英文译名、不做英文发音。未知礼物保持原名，历史工具栏可关闭翻译。每条 SC 旁有「翻译」按钮，点击后才用 Chrome 内置 Translator API 翻成当前界面语言，原文保留并附译文；不自动翻译 SC，不使用 Cookie 或外部翻译 API。译文只在控制台历史显示，OBS 内置浏览器通常不支持。

v0.6.12 ギフト翻訳と SC 翻訳ボタン：履歴のギフト名は内蔵辞書で初期設定のまま翻訳。中国語の原名を残し、日本語 UI は日本語訳と片仮名の読み、英語 UI は英語訳のみ（英語の読みなし）。未知ギフトは原名のまま、履歴ツールバーでオフ可。各 SC の「翻訳」ボタンを押した時だけ Chrome 内蔵 Translator API で現在の UI 言語へ翻訳し、原文を残して訳文を表示。SC の自動翻訳はせず、Cookie も外部翻訳 API も使いません。訳文はコンソール履歴のみで、OBS 内蔵ブラウザは通常非対応です。

v0.6.12 gift translation and SC button: history gift names use the built-in glossary by default. The Chinese original stays; Japanese UI shows a Japanese translation and katakana reading, English UI shows English only (no English pronunciation). Unknown gifts keep their original name, and the history toolbar can disable translation. Each SC has a "Translate" button; only a click uses Chrome's built-in Translator API to translate into the current UI language, keeping the original and appending the translation. SC is never translated automatically; no cookies or external translation API. Translations are console-history only; OBS's embedded browser usually does not support the API.

v0.6.11 历史只保留有电池的礼物：免费/0 电池礼物不进入本场直播礼物历史，只送免费礼物的观众不会出现，免费礼物也不会占一行「0 电池」。控制台「最近礼物」和 OBS 掉落仍按原设置显示免费礼物；模拟事件仍不计入。

v0.6.11 履歴はバッテリーのあるギフトのみ：無料/0 バッテリーのギフトは履歴に入らず、無料ギフトだけ送った視聴者も表示されません。0 バッテリーの行も出ません。コンソールの「最近のギフト」と OBS の落下は従来どおり無料ギフトを表示し、テスト送信は履歴に含みません。

v0.6.11 history keeps only gifts with batteries: free/0-battery gifts stay out of the stream gift history, viewers who sent only free gifts do not appear, and free gifts do not take a "0 batteries" row. The console's "Recent gifts" and OBS drops still show free gifts per their settings; simulations remain excluded.

v0.6.10 头像与昵称：历史观众显示圆形头像和昵称。匿名连接的礼物昵称被平台遮罩为「首字***」时，用礼物事件 UID 查询公开用户资料补全昵称和头像；SC/大航海头像也同步到历史。不需要 Cookie 或登录。查询失败保留星号昵称，并用昵称首字占位头像；查询有缓存、并发限制和失败退避。

v0.6.10 アバターと名前：履歴に丸いアバターと名前を表示。匿名接続でギフト名が「先頭文字***」に伏せられた場合、ギフトイベントの UID で公開プロフィールを照会して名前とアバターを補完。SC・大航海のアバターも履歴へ反映。Cookie・ログイン不要。失敗時は星号名と先頭文字の代替アバターを表示。キャッシュ・同時実行制限・バックオフあり。

v0.6.10 avatars and names: history shows a round avatar and name. When an anonymous connection masks a gift name as "first character***", the gift UID resolves the public profile nickname and avatar; SC/subscription avatars are also applied. No cookies or login. Failures keep the masked name and use the initial as an avatar placeholder, with caching, concurrency limits and backoff.

v0.6.9 历史：控制台最下方可折叠的「本场直播礼物历史」按观众汇总礼物、SC 和大航海。相同礼物累加数量，同一等级大航海累加次数和月份，不同礼物/等级分开；SC 留言全文始终展开。每位观众和每条记录显示电池；默认只显示电池，「金额显示」可切换人民币/日元，日元使用每日在线汇率并显示日期，失败时回退电池。只记录真实事件，模拟不计入；清空画面不清空历史，可单独清空。历史只在本次运行内保存，SC 留言不写盘。

v0.6.9 履歴：コンソール最下部の折りたたみ式「この配信のギフト履歴」は、視聴者ごとにギフト・SC・大航海をまとめます。同じギフトは数量、同ランクの大航海は回数と月数を合算し、異なるギフト・ランクは分離。SC コメントは常に全文表示。視聴者ごとの合計と各記録のバッテリーを表示し、初期値はバッテリーのみ。「金額表示」で人民元/日本円を切り替え、日本円は毎日のオンラインレートと日付を表示、失敗時はバッテリーに戻します。実際のイベントのみ記録し、テストは含まず、画面クリアでは履歴を消さず専用ボタンで消去。履歴は今回の起動中のみ保持し、SC コメントは保存しません。

v0.6.9 history: the collapsible "This stream's gift history" at the bottom groups gifts, SC and subscriptions by viewer. The same gift adds quantity; the same tier adds purchases and months; different gifts/tiers stay separate. SC messages always show in full. Each viewer and every record shows batteries; the default is batteries only, with CNY/JPY switching. JPY uses a daily online rate with the date shown and falls back to batteries on failure. Real events only; simulations are excluded. Clearing the screen does not clear history, which has its own clear button. History lasts only for this run and SC messages are not written to disk.

v0.6.8 头像：SC 昵称左侧显示圆形头像；SC 和大航海优先使用事件头像，缺失或下载失败时按 UID 查询公开资料，再下载到本地。无需登录或付费触发测试；平台查询失败时显示昵称首字，模拟事件用本地示例头像。下载异步完成，不改变 SC 到期/折叠状态或大航海播放时间。公开接口可能受网络或平台限制，不保证每次获取成功。

v0.6.8 アバター：SC の名前の左に丸い画像を表示。SC と大航海はイベント画像を優先し、不足・取得失敗時は UID で公開情報を照会して保存します。ログイン・有料テスト不要。失敗時は名前の先頭文字、シミュレーションはサンプル画像を使用。取得後も SC の期限・開閉状態や大航海の再生時間を変更しません。ネットワーク・プラットフォームによって取得できない場合があります。

v0.6.8 avatars: SC shows a round avatar before the sender name. SC and subscriptions prefer event avatars and fall back to public UID lookup and local download. No login or paid test is required. Failures show the name initial; simulations use a sample image. Async updates preserve SC expiry/collapse state and subscription timing. Network or platform restrictions can prevent retrieval.

当前礼物待生成队列无固定容量或超时丢弃，停刷后仍可能继续播放积压礼物。 / 現在のギフト生成待ちに固定容量や期限はなく、受信停止後も残りを再生する場合があります。 / Pending gifts have no fixed queue capacity or expiry and may continue playing after incoming gifts stop.

验收：55项自动测试和本机EXE回归，浏览器移动/缩放、竖版GIF、替换素材实际显示、放开后的上限保存、三个上舰模拟按钮、礼物/大航海/醒目留言恢复默认、不同比例素材共用中轴、播放时长生效、390px三语历史面板、历史头像布局、礼物翻译/SC 翻译按钮、登录面板/二维码和日元显示已有证据；公开 UID 昵称与真实头像下载实测成功；用户实测扫码登录成功（2026-10-31）。真实上舰、付费SC、OBS、全部视频编码、长期和全新Windows仍待验收。 / 検証：自動55件・EXE回帰、ブラウザ操作・縦長GIF・カスタム素材表示・上限値の保存・3つの大航海テストボタン・各設定の初期化・比率の異なる素材の中心軸一致・再生時間の反映・390pxの3言語履歴パネル・履歴アバター配置・ギフト/SC 翻訳・ログイン画面/QR・日本円表示を確認。公開 UID の名前と実画像取得、ユーザーによる QR ログイン成功（2026-10-31）を実測。実際の上艦・SC・OBS・全コーデック・長時間・新規Windowsは未検証。 / Validation includes 55 automated tests, local EXE regression, browser interaction, portrait GIF, replaced media display, saved uncapped values, all three subscription test buttons, gift/Great Voyage/Super Chat resets, one shared center axis across media ratios, the configured play time, the 390px three-language history panel, history avatar layout, gift/SC translation, login panel/QR and JPY display; public UID nickname and real avatar download were verified, and the user confirmed a successful QR login on 2026-10-31. Real subscriptions, paid SC, OBS, all codecs, long-running streams and clean Windows installations remain unverified.


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

## 早期行为记录 / 旧版の動作 / Historical behavior

以下旧版段落中的1.5秒丢弃已在v0.6.4取消；当前队列无固定容量或超时。 / 1.5秒での破棄はv0.6.4で撤廃。現在の生成待ちに固定容量・期限はありません。 / The 1.5-second expiry below was removed in v0.6.4; pending gifts now have no fixed capacity or expiry.

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

v0.6.7：大航海每人播放时长可设置（默认8秒，最小1秒，无上限，从下一位生效）；新增“恢复大航海位置与大小”和“恢复醒目留言默认设置”，均不清除素材、现有留言或有效期。 / 大航海の1人あたり再生時間を設定可能（初期8秒・最小1秒・上限なし、次の待機者から適用）。「位置とサイズを初期値に戻す」「スーパーチャット設定を初期値に戻す」を追加。素材・表示中のコメント・有効期限は保持。 / Configurable play time per viewer (8s default, 1s minimum, no upper bound, applies from the next viewer), plus restore buttons for Great Voyage position/size and Super Chat defaults that keep media, visible messages and expiry.

图片兼容：按文件签名识别 PNG/JPEG/GIF/WebP，支持 CDN 的 png 标签。 / ファイル署名で画像形式を判定し、CDN の png に対応。 / File signatures identify supported images despite CDN png labels.
