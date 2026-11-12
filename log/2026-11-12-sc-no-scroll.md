# 2026-11-12 SC 停止滚动与最新显示位置（v0.6.18）

## 目标

在现有醒目留言（SC）显示区域内新增「停止滚动」开关和「最新 SC 显示位置」互斥选项，解决开启 SC 永久显示后、SC 数量超过画布垂直范围时新 SC 不可见的问题。只调整 SC 显示布局，不修改直播连接、礼物掉落、大航海、登录、金额/有效期、翻译、头像补全、历史数据结构或 100 条上限。

## 需求边界

- 新增 `scDisableScroll`：布尔，默认 `false`，旧配置缺字段视为关闭。
- 新增 `scNewestPosition`：`top` 或 `bottom`，默认 `bottom`，两项互斥。
- 关闭停止滚动：保留现有自动往返滚动、速度、两端停留、悬停/聚焦暂停、自动折叠和显示期限；顶部模式只改变排列顺序，底部模式保持原顺序。
- 开启停止滚动：不播放自动滚动；按所选方向直接更新。底部模式最新 SC 固定在底部，顶部模式固定在顶部；新 SC 始终优先，最旧 SC 可退出可见区域但不从数据中删除。
- 可见内容按矩形实际高度和每条 SC 的实际渲染高度决定，不按固定条数。单条 SC 高于整个矩形时，底部模式对齐其标题顶部，避免把可点击标题裁掉。
- 矩形尺寸、字体/缩放导致的布局变化、展开/折叠、自动折叠、语言切换和连续新 SC 后重新计算可见位置。
- 旧 SC 仍保留在 `SCStore` 和 overlay 渲染列表中，总量继续受 100 条上限约束，不新增持久化历史。
- 两项设置自动保存、跨重启恢复，SC「恢复默认」同时重置；不影响礼物、大航海、语言、登录和其他分区。
- 控制台预览与 OBS overlay 通过 SSE 同步；切换语言不清空 SC、不重置有效期或折叠状态。

## 实现

- `src/shared/rules.mjs`
  - `defaults` 增加 `scDisableScroll:false`、`scNewestPosition:'bottom'`。
  - `config()` 只接受布尔 `scDisableScroll` 和 `top`/`bottom` 的 `scNewestPosition`；非法值保留旧值，旧配置自动使用默认值。
- `src/overlay/superchat.mjs`
  - 渲染顺序：`top` 时 `[...visible].reverse()`，`bottom` 时保持最旧到最新。
  - 停止滚动时 `overflow:hidden`；`anchorNewest()` 按位置把 `scrollTop` 设为 0 或最大滚动值，单卡高于区域时改为显示其标题顶部。
  - 新卡、展开/折叠、自动折叠、配置（宽高/位置/方向/开关）、语言、`ResizeObserver` 和字体加载后重新锚定。
  - 关闭停止滚动时保留原 `scrollSC()` 往返、速度和悬停/聚焦暂停；普通更新保留当前 `scrollTop`，从停止状态重新开启或切换顶部/底部时从对应边缘开始，避免重复动画和错误跳动。
  - 焦点恢复从按索引改为按 SC id 恢复，顶部反转后仍保持原焦点卡片。
- `src/control/control.mjs`
  - SC 永久显示下方新增「停止滚动」复选框；其下新增互斥单选组，`name=scNewestPosition`，默认底部。
  - 自动保存、SSE 回显、语言切换保持选中；显式保存按钮只提交选中的单选值；SC 恢复默认提交两个新键。
- `src/control/style.css`
  - 新增紧凑单选组样式，覆盖 `.settings-group .check` 的上下外边距，窄屏下无横向溢出。
- `src/shared/i18n/{zh-CN,ja,en}.mjs`
  - 新增 `scDisableScroll`、`scNewestPosition`、`scNewestTop`、`scNewestBottom`、`scNewestHint`；更新 `scHint` 说明两种滚动状态。
- `scripts/smoke-sc.mjs`、`scripts/smoke-windows.mjs`
  - HTTP/SSE 与 EXE smoke 覆盖新设置保存、语言/可见性切换保持、重启持久化和默认值。

## 验证

### 自动测试

- `node --test --test-isolation=none`：**68/68 通过**（本轮新增 4 项，原 64 项保持通过）。
- 新增 `tests/sc-layout.test.mjs`，覆盖：默认值与旧配置、JSON 重启、语言保持、非法值、顶部/底部顺序、停止时 120 帧不滚动、新卡底部锚定、单条超高显示标题、ResizeObserver 重排、恢复滚动、100 条上限与可见区域独立、三语键。
- `tests/control.test.mjs` 增加开关/互斥单选默认值、自动保存、SSE 回显、恢复默认。
- `tests/superchat.test.mjs` 的 fake DOM 增加 `dataset`，保留原有滚动、永久显示、折叠、语言和到期回归。

### HTTP/SSE

- 隔离数据目录、端口 19331 下运行源码服务，`scripts/smoke-sc.mjs` 通过：模拟 SC、快照、折叠同步、语言/禁用保持到期、新设置保存并在请求间保持、永久模式保留/切回重计时、清空。
- 未连接真实 Bilibili 付费 SC 事件。

### 浏览器视觉

Chrome 154 无头 + CDP，隔离端口 19331/9223，overlay 1920×1080、控制台 390×844：

- 底部模式：5 张卡片、区域高 216px，`scrollTop=486` 等于最大滚动；最新卡完整可见，最旧卡离开可见区域，`overflow:hidden`；900ms 后位置不变。
- 新 SC 后 `scrollTop` 更新到新最大 626，最新卡保持可见，旧卡仍在 DOM。
- 顶部模式：`scrollTop=0`，顺序为最新到最旧；新卡进入第一位；区域高度改为 40% 后仍锚定顶部。
- 单条超长卡：卡片高 1406px、区域 130px 时显示卡片标题顶部，未裁掉标题。
- 连续 105 条：overlay DOM 保持 100 张，最旧 `n0` 已按 100 条上限淘汰，最新 `n104` 可见。
- 恢复滚动：`scrollTop` 从 0 推进到约 98/101，自动滚动仍工作。
- 控制台预览与 overlay：3 条模拟 SC 同序、同为 `overflow:hidden`、顶部锚定；390px 三语控制台 `scrollWidth=375 < 390`，语言切换后开关和顶部选中状态保持。
- 截图：`docs/screenshots/sc-no-scroll-zh-CN-390.png`、`sc-no-scroll-ja-390.png`、`sc-no-scroll-en-390.png`。
- 上述 SC 内容通过测试脚本向 overlay 的 EventSource 注入合成事件，用于稳定覆盖长文本、超高卡和 100 条连续场景；不等同真实平台事件。

### Windows EXE

- 在仓库中执行 `node scripts/build-windows.mjs` 和 `node scripts/smoke-windows.mjs`，通过启动/重复启动、HTTP/SSE、SC 停止滚动/最新位置配置、三语、配置重启持久化、全部内嵌前端逐字节一致和退出端口释放。
- 已生成 Windows v0.6.18 EXE/ZIP 与发布材料；旧 v0.6.17 ZIP 保留在 `dist`，未被本次构建覆盖。

### 未验收

- 真实 Bilibili 付费 SC 的平台到期/删除事件、真实直播换房。
- 真实 OBS 实机；完整三语窄屏所有控件逐项视觉。
- 全部视频编码、长期高峰和全新 Windows 环境。
- 不沿用历史版本的真实平台/OBS 通过结论。

## 文档与发布

- 已更新 `README.md` 三语说明、`docs/PROJECT_PLAN.md`、`docs/ACCEPTANCE.md`、`docs/WINDOWS.md` 和本日志。
- 产品版本更新为 `0.6.18`；已更新 `package.json`、三语发布说明 `docs/releases/v0.6.18.md` 和 `dist/RELEASE_{TAG,TITLE,NOTES}`、`SHA256SUMS.txt`。
- 未提交、未创建 Git 标签、未推送、未发布远程 Release。
