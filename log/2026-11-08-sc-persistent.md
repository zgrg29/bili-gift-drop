# 2026-11-08 SC 永久显示（v0.6.16）

## 目标

在现有醒目留言（SC）设置中增加「SC 永久显示」开关，保持礼物、大航海、金额配色、翻译和历史统计不变。永久仅指本次运行内不按平台有效期自动过期，不跨重启保存留言。

## 需求边界

- 默认关闭；旧配置没有 `scPersistent` 时视为关闭；保存后跨重启恢复。
- 开启：当前及新收到的 SC 不因平台有效期结束而移除；所有金额同一规则；无额外倒计时；仍保留最新 100 条，第 101 条淘汰最旧。
- 普通 → 永久：当前仍存在的 SC 立即停止到期移除；已移除的历史不恢复；折叠、头像、内容、翻译状态和顺序不变。
- 永久 → 普通：当前保留的 SC 从切换时刻起重新获得一次完整平台显示时长；不瞬间清空；新 SC 继续用平台原始有效期；不改变折叠状态，不产生重复计时器。
- 自动折叠、手动展开、滚动、悬停/焦点暂停、透明度、语言、头像补齐和翻译与生命周期互相独立。
- 清空画面、切换直播间、重启仍按原逻辑清除 SC；不把留言写入磁盘。
- 控制面板与 OBS overlay 实时同步，无需重连或刷新。

## 实现

- `src/shared/superchat.mjs`
  - `normalizeSC` 保存平台推导的 `duration = (end - start) / 1000`，优先使用绝对 `start_time`/`end_time`，没有写死金额与秒数映射。
  - `SCStore` 增加 `persistent`、`setPersistent`、`clear`；永久模式跳过 `prune` 和平台删除事件，普通模式切回时按 `duration` 重设 `end`，保留原 `start`，因此自动折叠状态不重置。
  - 100 条上限仍按 Map 插入顺序淘汰最旧一条。
- `src/server/index.mjs`
  - 读取配置后以 `scPersistent` 初始化 `SCStore`；`/api/config` 持久化后切换模式并广播 `sc-list`；关闭时先发重新计时的列表再发配置，开启时先发配置再发列表，避免 overlay 闪空。
  - 头像异步补齐在永久模式不再因 `end` 已过而跳过；清空和换房改用 `scStore.clear()`。
- `src/overlay/superchat.mjs`
  - 永久模式不按 `end` 过滤；普通模式仍按平台有效期隐藏。保留原始列表，不因普通模式渲染丢弃条目，切换模式时可恢复当前会话内仍保留的卡片。
- `src/control/control.mjs`
  - 在 SC 分区「启用醒目留言」下方新增「SC 永久显示」复选框及说明；自动保存，SC 恢复默认会提交 `scPersistent:false`。
- `src/shared/i18n/{zh-CN,ja,en}.mjs`
  - 新增 `scPersistent`、`scPersistentHint`，更新 `scHint`；三语键和插值参数保持一致。

## 验证

- `node --test --test-isolation=none`：63/63 通过。新增 `tests/sc-persistent.test.mjs` 覆盖配置兼容、普通/永久生命周期、模式切换、重新计时、100 条淘汰、清空/重启、三语文案；`tests/superchat.test.mjs` 新增永久模式渲染与 0/15 秒自动折叠；`tests/control.test.mjs` 新增开关自动保存、配置回显和恢复默认。
- 隔离源码 HTTP/SSE smoke：`scripts/smoke-sc.mjs` 增加永久保留、切回普通模式重新计时、`start` 不变和最终到期清除，通过。
- Windows v0.6.16 EXE/ZIP 已构建；`node scripts/smoke-windows.mjs` 通过启动/重复启动、HTTP/SSE、SC 持久保留/重计时、三语、`scPersistent` 重启持久化、全部内嵌源码逐字节一致和退出端口释放。
- 未验证：真实付费 SC 的平台到期/删除事件、真实直播换房、OBS 实机、完整三语窄屏浏览器视觉检查、长期高峰和全新 Windows 环境。本轮未做真实付费测试，未虚报这些检查通过。

## 工程与发布

- 版本更新为 `0.6.16`，新增三语 `docs/releases/v0.6.16.md`，同步 README、`docs/WINDOWS.md`、工程规划、验收报告和本日志。
- 本地构建 `dist/BiliGiftDrop-windows-x64.exe`、`BiliGiftDrop-v0.6.16-windows-x64.zip`、`RELEASE_NOTES.md`、`RELEASE_TAG.txt`、`RELEASE_TITLE.txt`、`SHA256SUMS.txt`。
- 按用户授权创建本地 Git commit；不打标签、不推送、不发布远程 Release。
