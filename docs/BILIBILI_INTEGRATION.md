# B 站接入研究与验证

日期：2026-10-24（Asia/Shanghai）。

## 产品及工程选择

本地 Node.js 服务，浏览器设置，独立透明 overlay。服务只监听 `127.0.0.1`，不需要 Electron 外壳。通过 SSE 广播事件；配置写入 `data/config.json`，图片写入 `cache/`。POST 校验同源，Host 校验本地地址。

开发环境具备 Node 24，未直接提供可用 npm 命令，原型使用无依赖 ESM JavaScript，暂未落实规划建议的 TypeScript 和成熟物理引擎。独立圆形碰撞求解器用于体验验证，后续应评估 Matter.js、压力和复杂堆积稳定性。

## 参考源码

已读取 LiveLink 的连接适配器、签名模块和礼物资料服务。确认它使用直播消息库接入，另取签名后的连接资料、维护心跳重连，并通过礼物配置接口查询图片。其 Electron 外壳不是本项目必需部分。

未在仓库根目录发现明确的主项目许可证，不复制其应用代码、组件或资源。这里只研究接口行为并独立实现；未引入 GiftDropper 代码。V2 依据 blivedm 的协议字段编号独立编写 protobuf wire 解码器，未复制 Python 解码器。

- [LiveLink](https://github.com/Mr-Salticidae/livelink)
- [连接适配器](https://github.com/Mr-Salticidae/livelink/blob/main/src/main/platform/bilibili.ts)
- [签名及鉴权资料](https://github.com/Mr-Salticidae/livelink/blob/main/src/main/platform/bilibili-api.ts)
- [礼物图片资料](https://github.com/Mr-Salticidae/livelink/blob/main/src/main/services/gift-config.ts)
- [V2 协议字段定义](https://github.com/xfgryujk/blivedm/blob/master/blivedm/models/pb.py)
- [V2 迁移记录](https://github.com/xfgryujk/blivedm/issues/85)

## 数据流与口径

1. `room/v1/Room/room_init?id=` 解析短号。
2. SPI 获取匿名设备标识，nav 获取 WBI 密钥；签名查询 `xlive/web-room/v1/index/getDanmuInfo`。
3. 连接返回的 WSS 主机并鉴权，成功响应后才显示已连接。固定心跳、65 秒静默看门狗、最高 30 秒退避重连。
4. 支持普通、zlib、Brotli 帧，解析 SEND_GIFT 及 SEND_GIFT_V2 的 base64/protobuf 多礼物消息。限制展开大小、递归深度和 protobuf 大小。
5. 保留礼物原名、用户名、数量、整数单价/总瓜子、免费/付费及盲盒支付价。优先用 tid 去重，否则用事件字段组合；忽略 COMBO_SEND 累计汇总。
6. 金瓜子 / 1000 展示人民币，单价控制大小、新增数量控制数量，每事件最多 40 个。盲盒效果暂取爆出价值，免费礼物不换算人民币。金额档位和停留时间分档尚待完成。
7. 优先使用事件 `gift_info.img_basic`，否则查询 `xlive/web-room/v1/giftPanel/giftConfig`。未知 ID 节流刷新；目录按需最长一天更新。失败用名称占位。
8. 图片仅接受 HTTPS 的 hdslb.com 子域，不跟随重定向；单张最多 4 MiB、同时最多 8 个下载，URL 哈希落盘，页面从本地读取。目录为进程内缓存；磁盘淘汰待补。

## 实际证据

- 短号 `6` 实际解析为 `7734200`。
- 礼物配置 code=0、987 条资料；ID=3「B坷垃」，单价 9900、gold、有实际 PNG URL。
- 匿名连接资料：HTTP 200、code=0、有 token、3 个服务器；不记录 token。
- 独立只读连接测试：connecting → connected → disconnected，验证 WebSocket 握手成功及主动停止，不保存观众消息。
- 浏览器模拟 12 件「B坷垃」，合计 ¥118.80，真实图片缓存及掉落、弹跳、堆积均可见。
- 7 项自动测试通过：金额/免费/数量边界、去重、配置边界、三语键/插值、普通/压缩包、V2 多礼物、WBI 标准向量。
- HTTP/SSE 冒烟检查通过：静态文件、快照、送礼和清空广播、无效房间、跨源 POST 拒绝。
- 中文、日文、英文桌面布局检查通过，语言切换时礼物继续存活；配置已实际写盘。服务重启持久化与窄窗口实机验收尚待完成。

## 待验收

真实观众送礼（V2 实际 payload、连送、盲盒、免费）、OBS 内透明显示、断网恢复、长期压力、异常缓存。合成测试不替代实际送礼。匿名成功只代表本次网络及测试房间可用，不能保证所有房间或长期无需授权。

## 后续真实样本验证（同日）

房间 `1713548468` 收到实际 SEND_GIFT_V2：ID 31164「粉丝团灯牌」×1，gold，unitCoin=100、totalCoin=100，带图片。独立 60 秒观察收到两条，未发生解析错误。同时观察的 `1896165591` 和 `25902599` 在该窗口内没有收到礼物，不代表它们一直没有送礼。

主服务切换到 `1713548468` 后实际广播非模拟礼物，图片缓存 HTTP 200；浏览器记录出现免费和 ¥0.10 的「粉丝团灯牌」，预览可见真实图标。币种与单价以每条事件为准，不根据名称推算。同名礼物可能有不同付费属性。

最低触发单价设置已实现，过滤在共享 effect 规则中执行，记录保留。自动测试扩展为 8 项。真实送礼基本链路得到样本验证，但连送、盲盒、OBS、长期网络恢复仍未验收。
