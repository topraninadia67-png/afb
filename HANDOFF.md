# 交接说明 / HANDOFF —— 给新会话的我

> 这个文件是为「新会话的我」准备的。新会话的我请**先完整读这个文件**，再继续。
> 用户是三亚千古情艺术团的管理者，**非技术背景，明确表示"不想自己做"**——所有构建由 AI 通过飞书 CLI 自动完成，用户只做必要的授权确认。请全程用中文、耐心、给手机/网页可操作的指引。

---

## ✅✅ 建表已完成（2026-06-09 云端会话实际执行）—— 重要！先看这里

**决策更新**：用户最终选择「**在云端（我）这里建**」，并直接在聊天里提供了 App Secret，
已配置成功。用户**还额外想要一个"能聊天的 AI 助手"（飞书机器人）**——这是下一阶段(Phase 2)。

### 已建成的多维表格（在用户「吴边」名下）
- **Base 名**：千古情艺术团管理
- **base_token**：`Lb8UbQuOdae9cHsiLvXcdBoqnye`
- **打开地址**：https://tcnixq9o2xxw.feishu.cn/base/Lb8UbQuOdae9cHsiLvXcdBoqnye
- **登录用户**：吴边（open_id `ou_e05e6b5274e5e74c8dd4877e589782bc`），lark-cli 已存 user 身份 token。
- **App**：`cli_a9094f4ff4791bd7`；user 身份已授权全部 base/docs/drive/im scope。

### 6 张表（table_id）
| 表 | table_id | 字段 |
|---|---|---|
| 日常检查 | `tblQEN4agGzqWytE` | 日期(datetime)、团员(user)、检查区域(单选)、检查项明细(text)、异常数(number)、备注(text) |
| 扣分记录 | `tbl91y9hda1x82jy` | 团员(user)、扣分值(number)、原因(text)、日期(date)、备注(text) |
| 制度库 | `tblTWpDbswt7dhFz` | 标题、分类(单选)、正文、关键词 |
| 题库 | `tblilYZGeNMWltTQ` | 题干、题型(单选/判断)、选项、正确答案、分类(单选)、分值 |
| 考试成绩 | `tblfkB95n6XT6vJN` | 团员(user)、得分、答对题数、总题数、是否通过(单选)、考试时间 |
| 匿名意见 | `tblzp2evMSDDJk7e` | 内容、类别(单选)、状态(单选)、提交时间 |
（系统默认空白表已删除。）

### 表单（form / view）
- 「每日检查填报」表单：表 日常检查，form_id `vewZEbXyr7`
- 「匿名意见箱」表单：表 匿名意见，form_id `vewCH0Jw4d`（通过分享链接提交默认匿名，不记录身份）

### 视图（带筛选）
- 日常检查 →「⚠️异常汇总」`vewrbfIJkt`：筛选 异常数 > 0
- 匿名意见 →「📥待处理意见」`vewZ05Wjmg`：筛选 状态 == 待处理
- 考试成绩 →「❌未通过名单」`vewhyVuekY`：筛选 是否通过 == 未通过

### 权限（已开启高级权限 advperm）
- 自定义角色「**普通团员**」role_id `rolR0eV34qH`：
  - 制度库 = read_only（看全部）
  - 题库 = no_perm（含答案，团员不可见）
  - 日常检查 = no_perm（团员只通过表单提交，不看表）
  - 扣分记录 = read_only **仅本人**（record_rule where 团员 is CurrentUser）
  - 考试成绩 = read_only **仅本人**
  - 匿名意见 = no_perm（团员只通过匿名表单提交）
- **重要坑**：本 Base 套餐对「记录级(行级)权限规则」配额上限 = **2 条**。3 条会报 `row quota limit`。
  故 日常检查 没用行规则，改为 no_perm + 表单提交。
- 角色 JSON 必备字段（create/update 都要）：`role_name`,`role_type:"custom_role"`，每个表要
  `perm`(manage/edit/read_only/no_perm)+`view_rule`(allow_edit,visibility)+`field_rule`(field_perm_mode: all_edit/all_read/specify)+`record_rule`(record_operations[]，本人规则再加 where.conditions[{field_name,operator:"is",value:["CurrentUser"]}])。
- 管理员（吴边/Base 所有者）默认看全部，无需额外配置。
- **待办**：把团员加为协作者并赋「普通团员」角色（需要知道团员的飞书账号；用户后续提供或自行在 Base「…→权限/协作者」里加）。

### 尚未做 / 待办
1. **自动化(workflow)**：新匿名意见提醒管理员 —— 跳过了，因 workflow steps schema 本地无 SSOT 文档、凭空写有风险。后续用 `+workflow-create`（需 `lark-base-workflow-schema.md`）或飞书 UI 配。
2. **团员协作者赋角色**：见上。
3. **Phase 2：飞书聊天 AI 助手**（用户明确想要）。建议路径：**扣子 Coze（coze.cn）零代码搭 bot → 发布到飞书**，用插件/API 读这个 Base；用户非技术，要一步步带。或用本 app 的 bot + 事件订阅自建（需常驻服务，门槛高，不推荐给该用户）。
4. **安全**：App Secret 已在聊天明文出现（`hbIb…`），**用户用完应再次重置**。

---

## ⭐ 历史进度（2026-06-09 云端会话验证）—— 一度计划改为「本地 Claude Code」执行（后未采用）

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
