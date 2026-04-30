# Cron 配置指南

**用途**：指导用户配置 OpenClaw Gateway 定时任务

---

## OpenClaw 定时任务配置方式

### Cron 是 Gateway 内置调度器

- **运行位置**：Gateway 进程内部（不是独立服务）
- **存储位置**：`~/.openclaw/cron/jobs.json`
- **创建方式**：CLI 命令或工具调用
- **两种模式**：
  - **Main session**：下次 heartbeat 时执行，使用主会话上下文
  - **Isolated**：独立会话 `cron:<jobId>`，可配置推送通知

---

## CLI 创建命令

### 一次性任务（Main session）

```bash
openclaw cron add \
  --name "Plan 执行任务" \
  --at "2026-03-24T18:00:00Z" \
  --session main \
  --system-event "读取 plan_0323.md，执行下一个功能点" \
  --wake now
```

### 周期性任务（Isolated 模式，带飞书推送）

```bash
openclaw cron add \
  --name "Plan Automator" \
  --cron "*/30 * * * *" \
  --tz "Asia/Shanghai" \
  --session isolated \
  --message "读取 plan_0323.md，执行下一个功能点，生成文档，更新进度" \
  --announce \
  --channel feishu \
  --to "chat:oc_aaa6659b00007835ce76715986c696c3"
```

### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `--name` | 任务名称 | `"Plan Automator"` |
| `--cron` | Cron 表达式（5 字段） | `"*/30 * * * *"`（每 30 分钟） |
| `--tz` | 时区 | `"Asia/Shanghai"` |
| `--session` | 执行模式 | `main` 或 `isolated` |
| `--message` | 执行提示词（isolated 模式） | `"读取 plan..."` |
| `--system-event` | 系统事件文本（main 模式） | `"执行任务"` |
| `--wake` | 是否唤醒 | `now`（立即）或 `next-heartbeat` |
| `--announce` | 启用推送通知 | （无参数，启用即可） |
| `--channel` | 推送渠道 | `feishu` / `telegram` / `discord` 等 |
| `--to` | 推送目标 | `chat:xxx` / `user:xxx` |

---

## Cron 表达式示例（5 字段）

| 表达式 | 含义 |
|--------|------|
| `*/30 * * * *` | 每 30 分钟 |
| `0 * * * *` | 每小时整点 |
| `0 9-18 * * 1-5` | 工作日 9:00-18:00 每小时 |
| `0 9 * * 1-5` | 工作日每天 9:00 |
| `0 */2 * * *` | 每 2 小时 |
| `0 0 * * *` | 每天 0:00 |

**注意**：OpenClaw 使用 5 字段 cron 表达式（不包含秒）

---

## 工具调用方式（Agent 内部）

当技能在 agent 内部运行时，可以直接调用 `cron` 工具：

```json
{
  "action": "add",
  "job": {
    "name": "Plan Automator",
    "schedule": {
      "kind": "cron",
      "expr": "*/30 * * * *",
      "tz": "Asia/Shanghai"
    },
    "sessionTarget": "isolated",
    "payload": {
      "kind": "agentTurn",
      "message": "读取 plan_0323.md，找到下一个待执行功能，操作浏览器，生成文档，更新进度"
    },
    "delivery": {
      "mode": "announce",
      "channel": "feishu",
      "to": "chat:oc_aaa6659b00007835ce76715986c696c3"
    }
  }
}
```

---

## 常用命令

```bash
# 查看所有任务
openclaw cron list

# 查看任务运行历史
openclaw cron runs --id <job-id> --limit 10

# 手动触发任务
openclaw cron run <job-id>

# 编辑任务
openclaw cron edit <job-id> --message "新提示词" --model "opus"

# 禁用任务
openclaw cron edit <job-id> --enabled false

# 删除任务
openclaw cron remove <job-id>
```

---

## 配置问题清单（Premium Wizard）

创建 cron 前询问用户：

1. **触发频率**：多久执行一次？
   - 每 30 分钟（`*/30 * * * *`）
   - 每小时（`0 * * * *`）
   - 工作时间（`0 9-18 * * 1-5`）
   - 自定义 cron 表达式

2. **执行模式**：
   - Isolated（推荐）：独立会话，不污染主聊天
   - Main session：使用主会话上下文（适合依赖上下文的 task）

3. **推送通知**：是否推送进度到飞书？
   - 是，推送到当前群聊（自动获取 chat_id）
   - 是，推送到指定频道（需频道 ID）
   - 否（`--no-deliver`）

4. **时区设置**：
   - 默认：`Asia/Shanghai`（根据 Gateway 主机时区）

---

## 推送通知配置

### 飞书推送内容模板（Announce 模式）

```
📊 Plan Automator 进度摘要

任务：plan_0323.md
时间：2026-03-24 10:30

进度：12/75（16%）
本次完成：
- MK-REC-001 创建推荐活动 ✅
- MK-REC-002 配置推荐规则 ✅

待执行：63 个功能
预计完成：2026-03-25 18:00
```

### 错误通知

Gateway 自动重试机制：
- **瞬时错误**（429/5xx/网络）：指数退避重试（30s→1m→5m→15m→60m）
- **永久错误**（认证失败/配置错误）：立即禁用任务并通知

---

## 验证 Cron 是否生效

```bash
# 查看所有任务
openclaw cron list

# 查看任务运行历史
openclaw cron runs --id <job-id> --limit 10

# 手动触发测试
openclaw cron run <job-id>
```

---

## 配置存储

- **任务存储**：`~/.openclaw/cron/jobs.json`
- **运行日志**：`~/.openclaw/cron/runs/<jobId>.jsonl`
- **日志修剪**：默认保留 2MB 或 2000 行

---

## 错误处理

### 常见问题

| 问题 | 排查方式 |
|------|---------|
| 任务不执行 | `openclaw cron list` 检查 enabled 状态 |
| 推送失败 | 检查 channel 和 to 参数格式 |
| 时区不对 | 确认 `--tz` 参数或 Gateway 主机时区 |
| 日志过多 | 调整 `cron.runLog.maxBytes` 和 `keepLines` |

### 重试策略

- **一次性任务**：瞬时错误重试 3 次（30s→1m→5m）
- **周期性任务**：指数退避（30s→1m→5m→15m→60m），成功后重置
