# Bili Gift Drop

B站直播礼物、醒目留言（SC）与大航海的本地 OBS 透明画面工具。浏览器设置，支持简体中文、日本語和 English。

Bilibili配信用のギフト・SC・大航海を表示するローカルOBSツール。ブラウザで設定し、中国語・日本語・英語に対応。

A local, transparent OBS overlay for Bilibili gifts, Super Chat and Great Voyage subscriptions, with a Chinese/Japanese/English browser control panel.

## 当前版本 / 現行版 / Current version

**v0.6.15 Preview** · Windows x64 · [Release notes](docs/releases/v0.6.15.md) · [验收记录 / 検証 / Acceptance](docs/ACCEPTANCE.md)

- ZIP: `BiliGiftDrop-v0.6.15-windows-x64.zip`
- Tag: `v0.6.15`
- Title: **Bili Gift Drop v0.6.15 — 登录二维码显示修复（Preview）**
- 发布材料位于 `dist/RELEASE_TAG.txt`、`dist/RELEASE_TITLE.txt`、`dist/RELEASE_NOTES.md` 和 `dist/SHA256SUMS.txt`。 / リリース用ファイルは `dist/` 内。 / Release fields and checksums are prepared in `dist/`.

v0.6.15：修复登录面板只显示原始 URL、不显示二维码的问题。本地静态服务现在为 `.js` 返回 JavaScript Content-Type，二维码库可在浏览器执行；兜底不再显示可点击链接，只显示可选中的纯文本，避免误跳外部登录页或下载第三方播放器。界面提示用 B 站手机客户端扫码，不要点击外部页面或下载第三方播放器。登录逻辑、Cookie 保存、历史与翻译不变。

v0.6.15：ログイン画面が QR を表示せず URL だけになる問題を修正。静的配信が `.js` に JavaScript Content-Type を返すようになり、QR ライブラリが実行されます。フォールバックはクリック可能なリンクをやめ、選択可能なテキストのみにして、外部ログインページや第三者プレイヤーのダウンロードへの誤遷移を防ぎます。B站スマホアプリでスキャンし、外部ページを開かないよう表示します。ログイン処理、Cookie 保存、履歴/翻訳は変更ありません。

v0.6.15: Fixes the login panel showing only the raw URL instead of a QR code. The static server now returns a JavaScript Content-Type for `.js`, so the QR library executes; the fallback is selectable text instead of a clickable link, preventing accidental navigation to external login pages or third-party player downloads. The UI tells users to scan with the Bilibili mobile app and not open external pages. Login logic, cookie storage, history and translation are unchanged.

v0.6.14：控制台新增 B 站登录，支持手机扫码和手动粘贴 Cookie。界面明确提示：匿名连接时 B 站可能隐藏礼物观众的昵称和 UID，完整昵称通常需要登录。登录后使用账号 Cookie/UID 连接直播间；登录凭据默认只在内存，勾选「记住登录」才写入本机数据目录；不写日志、不出现在状态 API/OBS/截图，也不发往 Bilibili 以外服务。登录成功会自动重连当前直播间，退出登录回到匿名。

v0.6.14：コンソールに B 站ログインを追加。スマホ QR と Cookie 貼り付けに対応。匿名接続ではギフト視聴者の名前と UID が隠れる場合があり、完全な名前には通常ログインが必要と明示。ログイン後はアカウントの Cookie/UID で接続。ログイン情報は初期設定でメモリのみ、『ログインを記憶』でローカルデータに保存。ログ、状態 API、OBS、スクリーンショットには出さず、Bilibili 以外へ送りません。ログイン成功時は現在のルームへ再接続し、ログアウトで匿名に戻ります。

v0.6.14: Adds Bilibili login with mobile QR and manual cookie input. The UI states that anonymous connections may hide gift viewers' names and UIDs, and that full nicknames usually require login. After login the app connects with the account's cookies/UID. Credentials are memory-only by default; "Remember login" writes them to the local data directory. They never appear in logs, status APIs, OBS or screenshots, and are not sent anywhere except Bilibili. A successful login reconnects the current room; logout returns to anonymous access.

v0.6.13：修复匿名礼物观众“有头像 URL 但历史仍显示首字占位”的问题。部分礼物事件的 UID 为空、昵称被平台遮罩，但事件仍带 `face` 头像；现在即使 UID 为空也会缓存事件头像并更新对应观众。昵称仍无法通过公开 UID 补全，因为事件没有 UID，历史保留平台给的 `欠***` 这类遮罩名；完整昵称需要登录/Cookie 或其他授权来源；v0.6.13 当时仍不使用 Cookie，v0.6.14 起新增登录选项。

v0.6.13：匿名ギフト視聴者の「アバター URL はあるのに履歴が先頭文字の代替表示になる」問題を修正。UID が空で名前が伏せられていても、`face` のアバターを保存して該当視聴者に反映します。UID がないため公開プロフィールで名前は補完できず、`欠***` のような伏せ名は残ります。完全な名前にはログイン/Cookie など許可済みの情報源が必要です。v0.6.13 時点では Cookie を使いませんでしたが、v0.6.14 でログインを追加しました。

v0.6.13: Fixes anonymous gift viewers showing an initial placeholder even though the event carries an avatar URL. Some gift events have an empty UID and a masked name but still include a `face` avatar; the history now caches that avatar and updates the viewer even without a UID. The nickname still cannot be recovered by public UID lookup because the event has no UID, so the platform mask such as `欠***` remains. A full nickname needs login/cookies or another authorized source; v0.6.13 still used no cookies, and v0.6.14 adds a login option.

v0.6.12：历史礼物名称默认翻译。中文原名保留；日语界面显示日语译名和片假名读音，英语界面只显示英语译名、不做英文发音。内置词典覆盖常见礼物，未知礼物保持原名；历史工具栏可关闭「翻译礼物名称」。每条 SC 新增「翻译」小按钮，点击后才用 Chrome 内置 Translator API 翻成当前界面语言，原文保留并附译文；不自动翻译 SC，不使用 Cookie 或外部翻译 API。

v0.6.12：履歴のギフト名を初期設定で翻訳。中国語の原名を残し、日本語 UI は日本語訳と片仮名の読み、英語 UI は英語訳のみ（英語の読みなし）。内蔵辞書の一般ギフトが対象で、未知ギフトは原名のまま。履歴ツールバーで翻訳をオフにできます。各 SC に「翻訳」ボタンを追加し、押した時だけ Chrome 内蔵 Translator API で現在の UI 言語へ翻訳。原文を残して訳文を下に表示し、SC の自動翻訳はしません。Cookie も外部翻訳 API も使いません。

v0.6.12: Gift names in history are translated by default. The Chinese original stays; Japanese UI shows a Japanese translation and katakana reading, English UI shows English only (no English pronunciation). The built-in glossary covers common gifts; unknown gifts keep their original name, and the history toolbar can turn gift translation off. Each SC gets a "Translate" button; only a click uses Chrome's built-in Translator API to translate into the current UI language, keeping the original and appending the translation. SC is never translated automatically; no cookies or external translation API.

v0.6.11：本场直播礼物历史不再记录免费/0 电池礼物，只保留有实际电池的礼物。只送免费礼物的观众不会出现在感谢名单，免费礼物也不会占一行「0 电池」。控制台「最近礼物」和 OBS 掉落仍按原设置显示免费礼物；模拟事件仍不计入。

v0.6.11：この配信のギフト履歴は無料/0 バッテリーのギフトを記録せず、実際にバッテリーのあるギフトだけを残します。無料ギフトだけ送った視聴者は感謝リストに表示されず、0 バッテリーの行も出ません。コンソールの「最近のギフト」と OBS の落下は従来どおり無料ギフトを表示し、テスト送信は履歴に含みません。

v0.6.11: The stream gift history no longer records free/0-battery gifts; only gifts with batteries remain. Viewers who sent only free gifts no longer appear in the thank-you list, and free gifts no longer take a "0 batteries" row. The console's "Recent gifts" and OBS drops still show free gifts per their settings; simulations remain excluded.

v0.6.10：礼物历史显示观众头像。匿名连接下 B 站把礼物昵称遮罩成「首字***」时，用礼物事件的 UID 查询公开资料补全昵称和头像；SC 和大航海头像也会同步。不需要 Cookie 或登录。查询失败保留平台遮罩昵称，并用昵称首字占位头像；有缓存、并发限制和失败退避。

v0.6.10：ギフト履歴に視聴者アバターを表示。匿名接続で B 站が名前を「先頭文字***」に伏せた場合、ギフトイベントの UID で公開プロフィールを照会し、名前とアバターを補完。SC・大航海のアバターも反映。Cookie・ログイン不要。失敗時は伏せられた名前と先頭文字の代替アバターを表示。キャッシュ・同時実行制限・バックオフあり。

v0.6.10: Gift history shows viewer avatars. When Bilibili masks a gift sender as "first character***" on anonymous connections, the gift UID resolves the public profile nickname and avatar; SC and subscription avatars are also applied. No cookies or login. Failures keep the masked name and use the first character as an avatar placeholder, with caching, concurrency limits and backoff.

本场直播礼物历史：控制台最下方新增可折叠历史区，按观众汇总礼物、SC 和大航海。相同礼物、同一等级大航海自动累加，不同礼物和等级分开；SC 留言全文始终展开。每位观众显示总电池，每条礼物、SC 和大航海显示电池。默认只显示电池，可切换人民币或日元；日元使用每日在线汇率并显示日期。模拟事件不计入，清空画面不清空历史，另有清空历史按钮。历史只在本次运行内保存，不把 SC 留言写入磁盘。

この配信のギフト履歴：コンソール最下部に折りたたみ式の履歴を追加し、視聴者ごとにギフト・SC・大航海を集計。同じギフトと同ランクの大航海は自動合算し、異なるギフト・ランクは分離。SC コメントは常に全文表示。視聴者ごとの合計バッテリーと、各ギフト・SC・大航海のバッテリーを表示。初期値はバッテリーのみで、人民元または日本円に切り替え可能。日本円は毎日のオンラインレートを使い日付を表示。テスト送信は含まず、画面クリアでは履歴を消さず、専用ボタンで消去。履歴は今回の起動中のみ保持し、SC コメントはディスクに保存しません。

This stream's gift history: a collapsible history section at the bottom of the control panel summarizes gifts, SC and subscriptions by viewer. The same gift and the same subscription tier add up automatically; different gifts and tiers stay separate. SC messages always show in full. Each viewer shows total batteries, and every gift, SC and subscription shows batteries. The default display is batteries only, with optional CNY or JPY; JPY uses a daily online rate with the date shown. Simulations are excluded, clearing the screen does not clear history, and a separate button clears it. History lasts only for this run and SC messages are not written to disk.

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

### B 站登录（可选）

- 控制台左侧「B站登录」支持手机客户端扫码，也支持手动粘贴 Cookie（一般只需 SESSDATA，也可粘贴完整 Cookie）。
- **匿名连接下 B 站可能隐藏礼物观众的昵称和 UID；完整昵称通常需要登录。** 登录后使用账号 Cookie/UID 连接直播间，B 站可能返回完整昵称。
- 登录凭据默认只保存在内存；勾选「记住登录」后写入本机数据目录（未额外加密），请只在可信电脑使用并保护 Windows 账户。不会出现在日志、状态 API、OBS 画面或截图中，也不发往 Bilibili 以外的服务。
- 登录成功会自动重连当前直播间；退出登录回到匿名连接。二维码 180 秒失效。
- 2026-10-31 用户实测扫码登录成功；登录后完整礼物昵称是否解除遮罩请以实际直播为准。

### 画面与设置

- 一个预览，三个独立设置分区。绿色框为礼物掉落区域，拖动标签移动，右下角调整宽高；紫色框为SC，可移动和独立调整宽高；蓝色框为大航海，按素材比例缩放。保留百分比输入与方向键微调，拖动松开保存，数值停止输入约400毫秒后保存。
- 礼物、SC、大航海各有0–100%透明度滑杆，默认100%。切换语言和修改透明度不清空效果、不重置SC到期或大航海队列。
- 礼物按单个礼物的单价缩放，数量只影响图标个数；最小50%、最大150%、100元达到最大为默认值。100%对应1920×1080画布中的80像素。最低触发金额按单价判断；画面数量、生成速度、面积和尺寸由用户设置约束；待生成队列不设固定容量或超时丢弃。礼物设置可独立恢复默认。
- SC默认开启，独立按平台有效期移除，无可见倒计时。默认15秒折叠，0关闭折叠；标题可展开。有效卡片按区域高度排列，超出后往返滚动，默认20画布像素/秒，0停止。悬停或聚焦暂停滚动但不暂停到期。最多保留最新100条。可打开透明画面或在OBS浏览器源中使用“交互”操作卡片。
- 大航海默认开启，显示头像、原始昵称、舰长/提督/总督和本次购买期限。明确单位为月时显示“3个月舰长”等，特殊单位保留原信息，缺期限标记未知，缺头像显示昵称首字。
- 每位上舰播放时长可设置（默认8秒、最小1秒、无上限，修改从下一位生效），按收到顺序依次播放，最多100位等待；满队提示并跳过新事件。关闭大航海、换房或清空会清除对应队列；重启不回放旧购买。一次多月只播放一次。
- 三个等级分别提供AI像素舰船默认素材，可替换PNG/JPEG/WebP/GIF/MP4/WebM，单文件不超过32 MiB。视频静音循环，每位按配置时长轮换。各等级按实际图片/GIF尺寸或视频元数据决定比例，观众信息独立位于素材下方。设置宽度最大100%，高素材会整体缩小以适应画面，不拉伸素材。读取或解码失败回退默认显示。
- 更换素材后，预览会按当前播放等级布局；空闲时点击舰长、提督或总督模拟按钮测试对应等级，共用月数输入。三个等级共用中轴线；大航海位置与大小、醒目留言设置各有恢复默认按钮，保留素材和现有留言有效期。
- 控制台最下方「本场直播礼物历史」可折叠。按观众汇总：相同礼物累加数量、同一等级大航海累加次数和月份，不同礼物和等级分开；SC 留言全文始终展开，不折叠。每位观众显示头像和昵称；匿名连接下平台把礼物昵称遮罩成「首字***」时，若事件仍有 UID，就用公开资料补全昵称和头像；若平台连 UID 也隐藏，则只能用事件 `face` 补头像，昵称保留平台星号。礼物名称默认用内置词典翻译，日语界面同时显示片假名读音；未知礼物保持原名，可在历史工具栏关闭。每条 SC 有「翻译」按钮，点击后才用 Chrome 内置翻译显示译文，原文保留；不自动翻译 SC。每位观众显示总电池，每条礼物、SC 和大航海也显示电池。默认只显示电池，「金额显示」可切换人民币或日元；日元使用每日在线汇率并显示汇率日期，取不到时回退显示电池。只记录有电池的真实礼物；免费/0 电池礼物、模拟送礼/SC/上舰不计入；清空画面不会清空历史，可单独点「清空历史」。历史仅本次运行内保留，重启清空，不把 SC 留言写入磁盘。

### 保存、验收与限制

EXE设置、缓存及上传素材在 `%LOCALAPPDATA%\BiliGiftDrop`；配置在 `data/`、上传素材在 `media/`。升级替换EXE即可；迁移电脑时保留配置和素材两个目录。源码运行默认使用项目目录，`BILI_GIFT_DATA_DIR`可指定隔离数据目录。

55项自动测试和本机EXE隔离回归通过；本轮新增 B 站登录（Cookie 解析、二维码状态、持久化/退出、无效凭据、状态不暴露 Cookie）和登录面板三语渲染的回归，保留空 UID 头像兜底、礼物词典翻译/日语读音、SC 翻译按钮、免费/0 电池过滤、公开 UID 昵称/头像、390px 历史头像布局和日元显示检查；已有浏览器鼠标移动/缩放、三语桌面和100×200竖版GIF比例证据。真实大航海、真实付费SC与各金额配色、OBS实机、完整三语窄屏、全部视频编码、长期直播和全新Windows环境仍待验收。匿名连接可能受平台限制；不保证收到的上舰通知总含头像、明确月份或稳定的交易标识。部分真实V2礼物已验证，不能据此推定所有平台事件均通过。本构建未签名，作为预览发布。

## 日本語

1. Windows x64 ZIPを展開し `BiliGiftDrop-windows-x64.exe` を起動。Node.js不要。コンソールを開いたまま [設定画面](http://127.0.0.1:19321) でルーム番号を入力します。テスト機能は実際の購入を発生させません。
2. OBSブラウザソースに `http://127.0.0.1:19321/overlay`、幅1920・高さ1080を設定。市松模様と編集枠は出力されません。終了はコンソールを閉じるかCtrl+C。更新前に旧サービスを停止してください。
3. 単一プレビュー上で、緑のギフト領域はラベルをドラッグして移動、右下で幅・高さ変更。紫のSCも幅と高さを個別に変更。青の大航海は素材比率を維持。数値入力・矢印キーも使用でき、離した時または入力停止後約400msで自動保存します。各エフェクトの不透明度は0–100%、初期100%。言語・不透明度の変更でタイマーをリセットしません。
4. ギフトサイズは1個あたりの単価で決まり、個数はアイコン数のみ変更。既定50%–150%、100人民元で最大、100%は1920×1080上の80px。最低額は単価で判定し、表示個数・面積・生成速度・サイズはユーザー設定に従います。生成待ちに固定容量や時間切れはなく、ギフト設定は初期化できます。
5. SCは初期設定で有効。期限は個別、カウントダウンなし。既定15秒で折りたたみ、0で無効。領域を超えると初期20画素/秒で往復し、0で停止。ホバー・フォーカスでスクロールを一時停止しますが期限は進みます。最新100件まで保持。透明画面、またはOBSの「対話」で見出しを操作できます。
6. 大航海は初期設定で有効。アバター・元の名前・ランク・今回の購入期間を表示。月以外の単位は元情報を保持し、期間不明は不明、アバター未取得は名前の先頭文字を表示。1人あたりの時間は設定可能（初期8秒、最小1秒、上限なし、次の人から適用）。受信順、最大100人待機。満杯時は新規分を通知してスキップ。複数月でも1回再生。無効化・ルーム変更・クリアで列を消去し、再起動後は過去分を再生しません。
7. 各ランクの標準AI素材をPNG/JPEG/WebP/GIF/MP4/WebM（最大32 MiB）に置換可能。動画は無音ループ。画像・GIFサイズまたは動画メタデータから比率を自動計算し、視聴者情報は下に表示。設定幅は最大100%、縦長素材は画面内に収まるよう全体を縮小。失敗時は標準表示。待機中は艦長・提督・総督の3つのテストボタンと共通の月数入力を使用します。3ランクは同じ中心軸で揃い、大航海の位置・サイズとSC設定を初期化できます。素材やコメントの有効期限は保持します。
8. コンソール最下部の「この配信のギフト履歴」は折りたたみ式。視聴者ごとにギフト・SC・大航海をまとめ、同じギフトは数量、同ランクの大航海は回数と月数を合算し、異なるギフト・ランクは分離します。SC コメントは常に全文表示。各視聴者のアバターと名前を表示し、匿名接続で名前が「先頭文字***」に伏せられた場合はギフトの UID で公開プロフィールを照会して名前とアバターを補完、失敗時は星号と先頭文字の代替アバターを表示します。ギフト名は内蔵辞書で初期設定のまま翻訳し、日本語 UI では片仮名の読みも表示（未知ギフトは原名、履歴ツールバーでオフ可）。各 SC の「翻訳」ボタンを押した時だけ Chrome 内蔵翻訳で訳文を表示し、原文は残します。SC の自動翻訳はしません。各視聴者の合計と各記録のバッテリーを表示し、初期値はバッテリーのみ。「金額表示」で人民元または日本円に切り替えられ、日本円は毎日のオンラインレートと日付を表示し、取得できない場合はバッテリー表示に戻します。実際のイベントのうち、バッテリーのあるギフトのみ記録し、無料/0 バッテリーのギフトとテスト送信は含みません。画面クリアでは履歴を消さず専用ボタンで消去します。履歴は今回の起動中のみ保持し、SC コメントはディスクに保存しません。
9. 保存先は `%LOCALAPPDATA%\BiliGiftDrop`、設定は `data/`、素材は `media/`。移行時は両方を保持。55件の自動テスト・EXE回帰と一部ブラウザ操作は検証済み。実際の上艦・有料SC・OBS、完全な3言語狭幅レイアウト、全コーデック、長時間配信、新規Windows環境は未検証。匿名接続が制限されたり、一部フィールドが欠ける場合があります。署名なしのプレビュー版です。

### B站ログイン（任意）

- コンソール左側の「B站ログイン」でスマホ QR または Cookie 貼り付け（通常は SESSDATA のみ、完全な Cookie も可）に対応します。
- **匿名接続では B 站がギフト視聴者の名前と UID を隠す場合があり、完全な名前には通常ログインが必要です。** ログイン後はアカウントの Cookie/UID で接続し、B 站が完全な名前を返す場合があります。
- ログイン情報は初期設定でメモリのみ。「ログインを記憶」でローカルデータに保存（追加暗号化なし）。信頼できる PC でのみ使用し、Windows アカウントを保護してください。ログ、状態 API、OBS 画面、スクリーンショットには出さず、Bilibili 以外へ送りません。
- ログイン成功時は現在のルームへ自動再接続し、ログアウトで匿名に戻ります。QR は180秒で失効します。
- 2026-10-31 ユーザーが QR ログイン成功を実測。ログイン後にギフト名の伏せが解除されるかは実際の配信で確認してください。

## English

1. Extract the Windows x64 ZIP and run `BiliGiftDrop-windows-x64.exe`. No Node.js installation is required. Keep its console open and enter a room ID in the [control panel](http://127.0.0.1:19321). Simulations do not make purchases.
2. Add an OBS browser source at `http://127.0.0.1:19321/overlay`, width 1920, height 1080. Checkerboard and editing frames are preview-only. Close the console or press Ctrl+C to stop; stop the previous service before upgrading.
3. One preview contains green gift-region, purple SC and blue subscription frames. Drag the gift label to move its region; use bottom-right handles to resize gift/SC width and height independently. Subscription resizing follows media proportions. Numbers and arrow keys remain available. Changes save on release or about 400 ms after typing. Each layer has a 0–100% opacity slider, default 100%. Language and opacity changes preserve timers.
4. Gift sizes follow the unit price; quantity only changes the icon count. Defaults are 50%–150%, reaching maximum at CNY 100;100% means 80 px on a 1920×1080 canvas. Minimum trigger price uses unit price. On-screen count, spawn rate, area and size follow user settings. Pending gifts have no fixed queue cap or expiry. Gift settings have a restore-defaults button.
5. SC is enabled by default, expires independently and shows no countdown. Default collapse delay is 15 seconds;0 disables it. Overflow scrolls back and forth at 20 canvas pixels/second by default;0 stops motion. Hover/focus pauses scrolling without pausing expiry. Retains the latest 100 active messages. Use the transparent page or OBS Interact to operate headings.
6. Subscriptions are enabled by default and show avatar, original name, tier and purchased duration. Non-month units retain their original information; missing duration is marked unknown and missing avatars use the first name character. Play time is configurable (8 seconds by default, minimum 1, no upper bound), applying from the next viewer, in arrival order, with up to 100 waiting. Full queues skip new events with a warning. Multi-month purchases play once. Disabling, changing room or clearing removes the queue; shutdown never replays old purchases.
7. Replace each tier’s default AI pixel ship with PNG/JPEG/WebP/GIF/MP4/WebM, up to 32 MiB per file. Videos loop muted. Native image/GIF dimensions or video metadata determine layout; viewer details sit below. Requested width supports 100%, with tall content scaling down to fit the canvas. Failures fall back to default display. While idle, use the Captain, Admiral or Governor test buttons with the shared month input. All tiers share a center axis. Restore buttons reset subscription position/size or SC settings while preserving media and message expiry.
8. The collapsible "This stream's gift history" at the bottom of the control panel groups gifts, SC and subscriptions by viewer. The same gift adds up quantity; the same subscription tier adds up purchases and months; different gifts and tiers stay separate. SC messages always show in full. Each viewer shows an avatar and name; when an anonymous connection masks the name as "first character***", the gift UID resolves the public profile nickname and avatar, with the masked name and an initial placeholder on failure. Gift names are translated by the built-in glossary by default, with a katakana reading in Japanese UI (unknown gifts keep the original and the history toolbar can disable it). Each SC has a "Translate" button; only a click uses Chrome's built-in translator and appends the translation while keeping the original. SC is never translated automatically. Each viewer's total and every record show batteries; the default is batteries only. "Amount display" can switch to CNY or JPY; JPY uses a daily online rate with the date shown and falls back to batteries when unavailable. Only real gifts with batteries are recorded; free/0-battery gifts and simulations are excluded. Clearing the screen does not clear history, and a separate button clears it. History lasts only for this run and SC messages are not written to disk.
9. EXE data lives in `%LOCALAPPDATA%\BiliGiftDrop`: configuration in `data/`, uploaded files in `media/`. Retain both when moving computers. 55 automated tests and local EXE regressions pass, with browser interaction, the three-language 390px history panel, avatar/translation layout and portrait-GIF evidence. Real subscriptions, paid SC/colors, OBS, complete narrow layouts in all three languages, all codecs, long-running streams and clean Windows installations remain unverified. Anonymous access may be restricted and platform fields may be missing. This is an unsigned preview.

### Bilibili login (optional)

- The "Bilibili login" section supports mobile QR login and manual cookie input (usually SESSDATA only; a full cookie string also works).
- **On anonymous connections Bilibili may hide gift viewers' names and UIDs; full nicknames usually require login.** After login the app connects with the account's cookies/UID, and Bilibili may return full names.
- Credentials are memory-only by default; "Remember login" writes them to the local data directory without extra encryption. Use only on a trusted computer and protect your Windows account. They never appear in logs, status APIs, the OBS overlay or screenshots, and are not sent anywhere except Bilibili.
- A successful login reconnects the current room automatically; logout returns to anonymous access. The QR code expires after 180 seconds.
- On 2026-10-31 the user confirmed a successful QR login; whether gift-name masks are fully removed after login still depends on the actual stream.

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

[Windows说明](docs/WINDOWS.md) · [工程规划](docs/PROJECT_PLAN.md) · [验收报告](docs/ACCEPTANCE.md) · [本轮日志](log/2026-10-31-login-qr-mime.md) · [接入研究](docs/BILIBILI_INTEGRATION.md)

原创代码采用 [MIT License](LICENSE)，允许商用、修改和分发，保留版权与许可，无担保。第三方运行时、平台图片和商标遵循各自许可和平台规则。二维码生成使用 MIT 许可的 [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)，许可见 `src/control/vendor/qrcode.LICENSE.txt` 和 ZIP 内 `QRCODE-LICENSE.txt`。 / オリジナルコードはMIT、商用利用・改変・再配布可。著作権と許諾表示を保持、無保証。第三者コンテンツには各規約が適用されます。QR 生成は MIT ライセンスの [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) を使用し、ライセンスは `src/control/vendor/qrcode.LICENSE.txt` と ZIP 内 `QRCODE-LICENSE.txt` にあります。 / Original code is MIT licensed, permitting commercial use, modification and redistribution with notices retained, without warranty. Third-party runtimes, platform images and trademarks follow their own licenses and rules. QR generation uses the MIT-licensed [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator); its license is in `src/control/vendor/qrcode.LICENSE.txt` and `QRCODE-LICENSE.txt` in the ZIP.
