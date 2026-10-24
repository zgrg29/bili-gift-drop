# 大航海事件与特效方案调研

日期：2026-10-24（Asia/Shanghai）。本轮仅调研与建议，未修改运行代码。

## 来源

- B 站官方开放平台消息文档：https://openhome.bilibili.com/doc/4/c7b549c9-d5d6-0331-b510-465ed4107e01
  - 当前文档展示 OPEN_LIVEROOM_GUARD，包含 guard_level、guard_num、guard_unit、price、msg_id、timestamp、user_info。
  - unit 为月时结合数量解释；非月单位按字段本身表达，例如 *3天，不将数量直接视为月份。user_info.uface 为用户头像，不是舰船动画。
- blivedm 当前项目源码（网页协议实现的一手资料，非 B 站接口稳定性承诺）：
  - https://github.com/xfgryujk/blivedm/blob/master/blivedm/handlers.py
  - https://github.com/xfgryujk/blivedm/blob/master/blivedm/models/web.py
  - GUARD_BUY 有等级、数量、价格、礼物 ID/名称，但缺少明确单位；USER_TOAST_MSG_V2 解析 pay_info.num/unit/price、guard_info、sender_uinfo、option.source。源码对 source 语义明确含有猜测，需实测，不作为确定平台规则。
  - 模型注释指出上舰 start_time/end_time 可能相同，不能据此计算权益期限。handler 同时支持 GUARD_BUY 与 USER_TOAST_MSG_V2，需核验同次购买的跨消息合并。

## 建议与待验证

独立大航海归一化事件，保留等级、数量、原始单位、来源和可用唯一标识。优先按明确单位展示本次购买期限；缺失时不猜测。避免根据售价反推月份，避免把购买期限当成剩余权益或累计上舰时长。

建议使用三套可替换素材、一次购买一次主动画、多月显示准确数量、动画强度封顶；支持任意正整数月数，不限制为固定套餐。该视觉方案尚未由用户选定。事件中的头像/礼物 ID 不等同完整官方特效资源，资源获取失败应有内置占位。

未捕获真实上舰样本；本项目当前不是开放平台接入，官方文档字段仅用作方案参考。后续先验证现有连接收到的实际格式、重复通知、特殊单位、来源和价格口径，再实现三语设置及模拟、真实事件和 OBS 验收。本轮不构建、不提交、不发布。

## 用户补充与首版概念图

- 用户确定：多月直接叠加“几个月舰长 / 几个月提督 / 几个月总督”文字；使用 AI 图片，可用像素风与程序运动形成动画感，无需视频素材。
- 使用内置 image_gen 生成首版三级像素舰船概念预览，文件 docs/concepts/guard-pixel-ships-v1.png。蓝/紫/金配色及科幻舰船造型是本轮设计假设，待用户反馈；尚未接入 overlay，也未生成逐帧动画。
- 文字由程序独立绘制，不烘焙进素材；任意月数沿用集中三语资源。后续可用漂浮、尾焰闪烁及像素粒子制作轻量动画。
- 生成提示词：Use case: stylized-concept. Create a preview concept sheet for a Bilibili livestream OBS great-voyage subscription celebration. Three separate original pixel-art fantasy spacecraft arranged horizontally, evenly spaced with generous transparent separation: left a compact blue/cyan captain ship, middle a larger purple/silver admiral ship, right a majestic gold/amber governor flagship. Consistent charming premium 16-bit game sprite style, crisp square pixel clusters, dark pixel outlines, same three-quarter side view pointing right, readable silhouettes at small overlay sizes. Each ship floating independently, small pixel thrusters, restrained luminous accents. Actual transparent background. No text, letters, numerals, labels, logos, borders, backdrop, watermark or UI. This is a concept preview of three tiers, not an animation sprite sheet. No baked-in month count; software will overlay localized text separately.
