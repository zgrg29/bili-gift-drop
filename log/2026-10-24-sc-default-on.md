# v0.4.1 醒目留言默认开启

用户明确要求醒目留言默认打开，完成后按前一版流程验收、更新文档、commit与准备Release材料。

修改统一配置默认值scEnabled=true。新安装和未包含此字段的旧配置默认开启；保存过false的用户继续关闭，不覆盖明确选择。无需新增UI文案，README、Windows指引和Release notes同步提供中日英说明。原SC计时、折叠、无可见倒计时和自动保存行为不变。

版本0.4.1，保留旧v0.4.0标签，不移动或覆盖旧标签。准备本地新commit与annotated tag，不推送、不发布远程Release。

验收结果：node --test 24/24通过，覆盖新默认值、缺失字段迁移、已保存关闭值及语言切换保持。node scripts/build-windows.mjs成功重建v0.4.1；沙箱外隔离node scripts/smoke-windows.mjs通过：首次启动默认开启、手动关闭后重启仍关闭、SC HTTP/SSE、模拟、快照/展开同步、三语、内嵌源码一致性、布局重启恢复、重复启动和退出端口释放。未新增或改变UI布局，本轮沿用v0.4.0三语布局验收。

发布材料：dist/BiliGiftDrop-v0.4.1-windows-x64.zip、EXE、SHA256SUMS.txt、RELEASE_TAG.txt、RELEASE_TITLE.txt、RELEASE_NOTES.md。README、WINDOWS、PROJECT_PLAN、ACCEPTANCE、log及三语notes已同步。本轮本地commit和v0.4.1标签，不推送、不发布远程Release。
