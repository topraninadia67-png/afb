# 交接说明 / HANDOFF —— 给新会话的我

> 这个文件是为「新会话的我」准备的。新会话的我请**先完整读这个文件**，再继续。
> 用户是三亚千古情艺术团的管理者，**非技术背景，明确表示"不想自己做"**——所有构建由 AI 通过飞书 CLI 自动完成，用户只做必要的授权确认。请全程用中文、耐心、给手机/网页可操作的指引。

---

## ⭐ 最新进度（2026-06-09 云端会话验证）—— 现已改为「本地 Claude Code」执行

用户本地（Windows 电脑）的 Claude Code **已成功安装并可用**，因此最终方案改为
**在用户本地的 Claude Code 里建表**，而不是云端。原因：App Secret 全程留在用户自己
电脑上，永不进入任何云端聊天记录，最安全；且需要"用户身份授权扫码"时浏览器就在手边。

**云端会话已替你验证好的事实（本地无需重复怀疑）：**
- ✅ 飞书 CLI 包名 `@larksuite/cli`，安装后 bin 名为 **`lark-cli`**（注意不是 `lark`），当前版本 `1.0.49`。
- ✅ 凭证配置命令：`lark-cli config init --app-id <id> --app-secret-stdin`
  （`--app-secret-stdin` 从标准输入读 Secret，避免出现在进程列表/命令历史里）。
  - 本环境 `OPENCLAW_HOME`/`HERMES_HOME` 为空 → **不是 Agent 受限上下文**，直接用 `config init` 即可，
    无需 `config bind` 或 `--force-init`。本地若也非 Agent 上下文，同理。
- ✅ `lark-cli base` 子命令齐全，建系统需要的全部能力都在，确切命令名：
  - Base：`+base-create` / `+base-get` / `+base-copy`
  - 表：`+table-create`（可同时建字段和视图）/ `+table-list` / `+table-get` / `+table-update` / `+table-delete`
  - 字段：`+field-create` / `+field-list` / `+field-update` / `+field-delete`
  - 视图：`+view-create` / `+view-set-filter` / `+view-set-visible-fields` / `+view-set-group` / `+view-set-sort` 等
  - 表单：`+form-create` / `+form-questions-create` / `+form-update` / `+form-questions-list`
  - 角色权限：`+role-create` / `+role-update` / `+role-list` / `+advperm-enable`（开高级权限）
  - 自动化：`+workflow-create` / `+workflow-enable` / `+workflow-list`
  - 记录：`+record-batch-create` / `+record-upsert` 等
  - 通用兜底：`lark-cli api <METHOD> <path> --params/--data`，以及 `lark-cli schema <service.resource.method>` 查准确入参。
- ⏳ 唯一未做：写入 App Secret（按方案故意留给本地，不在云端贴 Secret）。

### 本地 Claude Code 执行指引（Windows）

1. **拉最新代码**：`git pull origin claude/gifted-johnson-iyt81p`，先读本 HANDOFF。
2. **确认 Node**：`node -v`（需 v18+，建议 v20/v22）。没有就去 nodejs.org 装 LTS。
3. **装 CLI**：`npm install -g @larksuite/cli`，然后 `lark-cli --version` 确认。
4. **配凭证（Secret 不要出现在命令行参数里！用 stdin）**：
   - 让用户把重置后的新 App Secret 准备好（App ID 固定 `cli_a9094f4ff4791bd7`）。
   - PowerShell：`"<新Secret>" | lark-cli config init --app-id cli_a9094f4ff4791bd7 --app-secret-stdin`
   - 或直接 `lark-cli config init`（无参）进交互式 TUI，把 Secret 粘到输入框（更不易泄漏到命令历史）。
   - **绝不把 Secret 写进任何文件 / 提交到 Git。**
5. **验证身份**：`lark-cli doctor`（应能以 bot 身份拿到 tenant token，不再 403）。
6. **用户身份授权（在用户云盘建 Base 时需要）**：
   `lark-cli auth login --no-wait --json --domain base,im,docs` → 把设备码授权链接/二维码发给用户，
   用户在飞书 App 里确认后，用 `--device-code` 收尾。若提示缺 scope，引导用户去开放平台「权限管理」开通对应权限（bitable/base、im 等）再重试。
7. **依次建**：Base → 6 张表(见下) → 字段 → 视图 → 表单 → 角色/高级权限 → 自动化。
   每个命令先 `lark-cli base <子命令> --help` 或 `lark-cli schema ...` 看准确入参再执行。
8. 边建边用中文向用户说明进度和需要确认的点。

## 一句话目标
用 **飞书 CLI（@larksuite/cli）** 在**用户自己的飞书**里，自动搭出「三亚千古情艺术团管理系统」的多维表格（Base）+ 表单 + 权限 + 自动化。功能对标本仓库已写好的微信小程序版（见 `miniprogram/` 与 `cloudfunctions/`，那是同一套需求的另一实现，可作为功能规格参考）。

## 功能需求（5 大块 + 权限）
1. **日常检查汇总**：团员按区域填报每日检查（消防/卫生/安全等多项，正常/异常），管理员看全部、可筛异常。
2. **制度查询**：制度条目库，可按关键词查。
3. **扣分查询**：扣分记录表，团员查自己，管理员录入/查全部。
4. **安全培训 + 随机出题**：培训资料 + 题库（单选/判断），随机抽题考试、判分、记成绩；管理员看全部成绩。
5. **匿名意见箱**：匿名提交（不记录身份），仅管理员可见。
- **权限**：管理员看全部汇总/意见/成绩；普通团员只看自己的。

## 建议的飞书多维表格结构（Base：千古情艺术团管理）
- 表 `日常检查`：日期、团员、检查区域、检查项明细、异常数、备注、提交时间
- 表 `扣分记录`：团员、扣分值、原因、日期
- 表 `制度库`：分类、标题、正文、关键词
- 表 `题库`：题型(单选/判断)、题干、选项、正确答案、分类
- 表 `考试成绩`：团员、得分、对/总、是否通过、时间
- 表 `匿名意见`：类别、内容、状态、（不记录提交人）
- 用「表单」收集日常检查 / 匿名意见；用「角色/高级权限」做管理员vs团员可见范围；可加「自动化」如新意见提醒管理员。

## 飞书应用凭证
- **App ID**：`cli_a9094f4ff4791bd7`（正式应用，挂"三亚千古情旅游演艺有限公司"名下，已启用）
- **App Secret**：⚠️ 旧的已在聊天中明文暴露，已请用户**重置**。新会话开始时**向用户索要新的 App Secret**，用 `lark-cli config init --app-id cli_a9094f4ff4791bd7 --app-secret-stdin` 经 stdin 写入，**切勿提交到 Git**。

## 操作步骤（历史，云端版；本地版见上方「⭐ 最新进度」）
1. 确认本环境网络可达飞书：`curl -sS -o /dev/null -w "%{http_code}" https://open.feishu.cn/`（不再是 "Host not in allowlist" 即可）。
2. 装 CLI：`npm install -g @larksuite/cli`（bin 名为 `lark-cli`，PATH 可能在 /opt/node22/bin）。
3. 配凭证（向用户要新 Secret，stdin 写入）。
4. `lark-cli doctor` 应通过 bot 身份（拿到 tenant token，不再 403）。
5. 需要用户身份建在用户云盘时：`lark-cli auth login --no-wait --json --domain base,im,docs` 取设备授权链接/二维码，发给用户在手机飞书确认，再用 `--device-code` 完成。
   - 若应用缺少对应权限 scope，会报错并指出缺哪个；引导用户到开放平台「权限管理」开通后重试（base/bitable、im 等）。
6. 用 `lark-cli base ...` 子命令依次创建 Base、各表、字段、视图、表单、角色权限、自动化。先 `lark-cli base --help` / `lark-cli schema ...` 查准确语法再执行。
7. 边建边把进度和给用户的确认点用中文说明。

## 失败排查备忘
- `Host not in allowlist`：本环境网络白名单没放飞书 → 需在网页端把环境网络设为 Full 或 Custom(`*.feishu.cn`,`feishu.cn`)，并以新会话生效。
- 本地（用户 Windows 电脑）装 Claude Code 失败：`ECONNREFUSED downloads.claude.ai`——中国大陆直连 Anthropic 下载服务器受限，故改走"云端我 + 放开网络"的方案，不要再让用户在本地装。

## 仓库现状
- `miniprogram/` + `cloudfunctions/`：已完成并推送的微信小程序版（功能规格参考）。
- 分支：`claude/qianguguo-arts-management-app-splw3g`。
