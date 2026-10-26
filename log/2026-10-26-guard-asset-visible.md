# v0.6.3 自定义大航海素材不显示修复

2026-10-26（Asia/Shanghai）。用户试用“模拟上舰”并替换舰长素材后，画面仍显示默认像素舰船。本记录给出复现、根因、修复、验证与发布产物。

## 用户报告与现场数据

- 用户已在控制面板为“舰长”上传素材。运行数据 `%LOCALAPPDATA%\BiliGiftDrop` 中确认 `data/config.json` 含 `"guardAsset3": "/media/e868250b-6fbe-47f3-bc63-dc27c6af7ace.png"`，`media/` 内文件存在（PNG，327×350，110,615 字节），`/media/...` 返回 HTTP 200。
- 用户当时运行的是 `dist/BiliGiftDrop-windows-x64.exe`（2026-10-24 构建，内嵌资源与工作区源码逐字节一致），因此问题不在版本差异或上传失败。

## 复现

- 复制用户实际配置与两个素材到隔离数据目录，启动本地服务并触发 `guard-test`（level 3）。Chrome 无头模式读取 overlay DOM。
- 结果：`.guard-effect` 和 `.guard-info` 正常显示；`<img class="guard-custom">` 已创建、`complete=true`、`naturalWidth/Height=327/350`、`hidden=false`，但它的 `getBoundingClientRect().top` 落在 `.guard-ship` 底部（约 796px），而不是素材区顶部。根元素 `.guard-effect` 有 `overflow:hidden`，自定义素材被推到裁切区外，只剩一条被底部信息条盖住的边缘。
- 同一时刻 `.guard-sprite`（默认像素舰船画布）的 `hidden` 属性为 `true`，但计算样式仍是 `display:block`，尺寸约 763×816，正好占据了整个素材区。截图见 `docs/screenshots/guard-custom-before.png`（默认舰船可见，底部信息条后有一条被裁切的红色边缘）。

## 根因

`src/overlay/index.html` 的样式 `canvas{display:block;width:100%;height:100%}` 是作者样式，优先级高于浏览器默认的 `[hidden]{display:none}`。渲染代码虽然设置了 `sprite.hidden=true`，画布仍以块级元素占据版面：

1. 默认画布先占满素材区高度；
2. 自定义图片/视频作为后续行内元素被排到画布下方；
3. `.guard-effect` 的 `overflow:hidden` 把自定义素材裁掉，底部又被 `.guard-info` 覆盖。

因此无论上传图片、GIF 还是视频，用户看到的都是默认素材。v0.6.0–v0.6.2 的自动化与浏览器检查只验证了自定义元素自身的尺寸/比例，没有验证它相对裁切区的位置，故此前未发现。

## 修复

- `src/overlay/index.html` 增加 `canvas[hidden]{display:none}`。该选择器优先级高于 `canvas`，恢复 `hidden` 属性对画布的语义；默认画布被移出版面后，自定义素材回到素材区顶部。
- 既有上传文件、`guardAsset1/2/3` 配置和布局数值全部保留，用户无需重新上传。
- `tests/guard.test.mjs` 增加样式回归断言，防止再次出现“作者样式覆盖 `hidden`”。

## 验证

- `node --test --test-isolation=none`：32/32 通过（31 项原有 + 1 项样式回归）。受限沙箱禁止子进程管道，改用单进程隔离模式运行，未修改测试逻辑。
- 源码服务 + Chrome 无头：level 3（自定义素材）中 `.guard-sprite` 计算样式 `display:none`、尺寸 0×0，自定义图片回到素材区顶部并显示；level 2（未上传素材）仍显示默认紫色提督舰船。截图 `docs/screenshots/guard-custom-after.png`。
- 打包 EXE 端到端：用 `BILI_GIFT_DATA_DIR` 指向用户配置/素材的副本，`--no-open` 启动新 EXE，确认 `/src/overlay/index.html` 含修复，重复同一 DOM 检查，结果一致（自定义图片 top 与 `.guard-ship` 一致、位于裁切区内、不再被默认画布挤走）。
- 浏览器未观察到脚本错误。测试进程已停止，19321/19400/19401 无监听。

## 发布产物（v0.6.3）

- `dist/BiliGiftDrop-windows-x64.exe`（95,365,632 字节，SHA256 `afaf13eebe55f0503e16b750473b774d5c4aa73ca8dbf52654360f5a3f845acf`）。
- `dist/BiliGiftDrop-v0.6.3-windows-x64.zip`（SHA256 `c2d855935001e824f44a9c6a952eaa69a7bde3b970cd344a90a7b5d592836434`，含 EXE、Windows 说明、LICENSE、Node 许可与三语发布说明）。
- `dist/RELEASE_TAG.txt` 为 `v0.6.3`，`RELEASE_TITLE.txt` 与 README 当前版本一致；`RELEASE_NOTES.md` 与 `docs/releases/v0.6.3.md` 逐字节一致。
- 保留旧版本 ZIP；未推送、未发布远程 Release。

## 未决与观察

- 真实上舰事件、OBS 实机、全部视频编码、完整窄屏三语、长期直播仍未验收。
- 观察（未在本轮修改）：大航海位置为 0%、展示高度达到 100% 时，`guard-float` 动画上移 3% 会把素材顶部裁掉约 20–25px。这是 v0.6.0 以来的既有行为，与本轮素材不显示问题无关；如需要可单独调整动画或为顶部预留空间。
