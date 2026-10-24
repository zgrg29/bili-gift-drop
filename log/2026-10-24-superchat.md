# SC 功能与不显示倒计时

2026-10-24（Asia/Shanghai）。用户明确要求提前开发 SC：开关、设置位置、自动折叠并可点击展开、按 B 站金额时长与配色。后续补充：不在卡片上显示倒计时。已遵循。

## 官方规则证据

- 官方介绍：https://live.bilibili.com/blackboard/live-superchat-intro-web.html
- 官方页面中的权益表：https://activity.hdslb.com/blackboard/activity18620/static/img/table.1687b63c.png
- Web 工具可读正文确认最长两小时、不同直播间以实际档位为准。图片经本地网络读取失败后，使用 Chrome 打开成功，目视核对全部六档：30/50/100/500/1000/2000 元分别60/120/300/1800/3600/7200秒，区间上限为下一档之前。
- 不从未经核实资料推断十六进制配色。真实事件使用 background_bottom_color/background_color/message_font_color；缺失时使用安全通用样式。用户原始留言不翻译，JPN 事件仍读取 message 原文。

## 实现与边界

- shared/superchat.mjs 规范化与有界存储；server 接入 SC、删除、测试、展开同步和刷新快照；overlay DOM 卡片与礼物 Canvas 独立。
- 独立持久化开关/左/上/宽/折叠秒数，三语资源一致。事件优先计时，官方表仅在有起始时间且缺少事件时长时补充。无屏幕倒计时。
- 默认关闭 SC，开启后默认15秒折叠；关闭显示不暂停时间。点击展开在设置预览与 OBS“交互”中操作，状态经 SSE 同步。新展开再次等待配置秒数折叠。
- 显示3条、保留最新100条，等待中的卡片仍按原时刻到期。删除、清空、换房清理卡片；重复消息不延长到期时间。服务重启不回放。

## 验证

- node --test：24/24，通过金额边界、事件优先级、原文保留、过期、去重、容量、删除、配置迁移和语言保持。renderer VM 验证无倒计时、自动折叠、点击请求、三语、关闭继续到期；原礼物回归通过。
- scripts/smoke.mjs：静态文件、模拟礼物、SSE、清空、输入和 Origin 检查通过。
- scripts/smoke-sc.mjs：模拟SC、快照恢复、展开同步、语言/关闭保持到期、布局数值、清空通过（隔离数据服务19329）。
- Chrome 窄屏375/390像素：中日英文案、折行、横向不溢出已检查；无倒计时卡片、自动折叠及再次点击展开已观察。最终截图 docs/screenshots/sc-no-countdown.png。
- 自动拖动未观察到坐标变化，不能声称鼠标拖动实机通过；已补充指针拖动处理/保存的自动测试及方向键移动。Chrome 中 ArrowRight 将 SC 左侧从12.5改为13.5，数值与方向键布局可用。未完成真实 SC、OBS、Windows EXE 重建。源码改动未提交/推送。

## v0.4.0 发布准备补充验收

用户进一步要求正式完成本轮验收、文档、commit与Release材料。数值停止输入约400毫秒自动保存；拖动松开立即flush。SC开关关闭时允许编辑和保存位置，开启后收到仍有效的SC即按保存布局显示。

- Chrome实际拖动：左/上从5/5到24.3/23；刷新仍24.3/23；data/sc-release-qa/data/config.json一致，无需点保存。上轮鼠标拖动缺口本轮补齐。
- Chrome数值设置18/10、宽40，自动保存同步；此前三语窄屏、无倒计时、折叠/展开、方向键移动证据继续有效。
- node --test 24/24通过；node scripts/build-windows.mjs构建v0.4.0成功；沙箱外隔离运行node scripts/smoke-windows.mjs通过，增加SC smoke、SC配置重启持久化和shared/overlay superchat内嵌资源逐字一致检查。原有礼物、SSE、三语、重复启动和退出释放端口继续通过。
- README、WINDOWS、PROJECT_PLAN、ACCEPTANCE与docs/releases/v0.4.0.md更新。dist生成EXE、BiliGiftDrop-v0.4.0-windows-x64.zip、SHA256SUMS.txt、RELEASE_TAG.txt、RELEASE_TITLE.txt、RELEASE_NOTES.md。
- 本轮本地commit及annotated tag v0.4.0，不推送或发布远程Release。实际hash以git log为准。预览版尚未完成真实付费SC/配色、OBS内交互、长期和全新Windows验收。

最终同屏证据：docs/screenshots/sc-release-acceptance.png，显示SC开关、18%/10%/40%持久化布局和无倒计时卡片。19328隔离源码服务及19329隔离EXE回归均已收尾，不改用户生产配置。
