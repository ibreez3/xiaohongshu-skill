# 在 OpenClaw 中引导 AI 使用新 Skill 的对话模板

## 🎯 核心策略

由于 OpenClaw 的 AI 会记住之前的对话模式，我们需要在对话中**明确引导**它使用新的 Skill 方式。

---

## 💡 推荐对话流程

### 第一步：建立新的对话上下文

**在 OpenClaw 中发送以下消息**：

```
我现在使用小红书的方式已经改变了。之前是通过 MCP 直接调用，但现在改用 Skill 方式。请不要再去查找 xiaohongshu-mcp 进程，而是使用 xiaohongshu-auto-publish Skill。
```

### 第二步：确认理解

**AI 回复后，继续强化**：

```
对，请记住：使用 xiaohongshu-auto-publish Skill，而不是直接调用 MCP。
```

### 第三步：测试新的方式

```
请使用 xiaohongshu-auto-publish Skill 调用 check_login_status 工具，检查登录状态。
```

---

## 🗣️ 实际对话示例

### 示例 1：首次引导

**你**：
```
我现在使用小红书的方式已经改变了。之前是通过 MCP 直接调用，但现在改用 Skill 方式。请不要再去查找 xiaohongshu-mcp 进程，而是使用 xiaohongshu-auto-publish Skill。
```

**AI**：
```
好的，我明白了。我会使用 xiaohongshu-auto-publish Skill 而不是直接查找 xiaohongshu-mcp 进程。
```

**你**：
```
请使用 xiaohongshu-auto-publish Skill 调用 check_login_status 工具，检查登录状态。
```

**AI**：
```
[调用 check_login_status 工具... 返回登录状态...]
```

### 示例 2：发布内容

**你**：
```
请使用 xiaohongshu-auto-publish Skill 的 publish_content 工具发布内容：
- 标题：周末探店
- 内容：发现一家超棒的咖啡馆
- 图片：/Users/xxx/Pictures/cafe.jpg
```

**AI**：
```
[调用 publish_content 工具... 发布成功...]
```

---

## 📝 可用的对话模板

### 模板 1: 强调使用 Skill

```
请使用 xiaohongshu-auto-publish Skill 调用 [工具名称] 工具
```

### 模板 2: 明确指定工具

```
请调用 check_login_status 工具
```

```
请使用 publish_content 工具发布：[参数]
```

### 模板 3: 解释使用方式

```
注意：小红书功能现在通过 Skill 提供，不要尝试直接连接 MCP。
使用 xiaohongshu-auto-publish Skill 即可。
```

---

## 🚨 如果 AI 仍然尝试查找旧进程

### 方案 A: 直接纠正

**AI**：
```
ps aux | grep xiaohongshu-mcp | grep -v grep | awk '{print $2}'
```

**你**：
```
不要执行这个命令。小红书功能现在通过 Skill 提供，请使用 xiaohongshu-auto-publish Skill。
```

### 方案 B: 重新引导

```
请忘记之前的配置。现在小红书功能通过 xiaohongshu-auto-publish Skill 提供。
所有小红书相关的工具（check_login_status, publish_content 等）都在这个 Skill 中。
请直接调用这些工具即可。
```

---

## 🎯 完整使用流程

### 1. 建立新对话上下文

**发送**：
```
请使用 xiaohongshu-auto-publish Skill，不要查找 xiaohongshu-mcp 进程。
```

### 2. 测试基本功能

**发送**：
```
请使用 xiaohongshu-auto-publish Skill 调用 check_login_status 工具。
```

### 3. 开始使用

**发送**：
```
请搜索小红书上关于"咖啡"的内容，前10条。
```

---

## 💡 关键点

1. **明确指定 Skill 名称**：总是说 "使用 xiaohongshu-auto-publish Skill"
2. **明确说 "工具"**：说 "调用 xxx 工具" 而不是 "执行 xxx 命令"
3. **立即纠正**：如果 AI 尝试查找进程，立即说 "不要查找，使用 Skill"
4. **重复强化**：在前几次对话中每次都明确说明使用 Skill

---

## 🔍 验证是否生效

### 成功的标志

当 AI：
- ✅ 不再尝试查找 `xiaohongshu-mcp` 进程
- ✅ 直接调用 Skill 的 `call` 方法
- ✅ 调用适配器 API (localhost:3000)
- ✅ 返回正确的结果

### 查看日志确认

**Skill 调用日志**：
```bash
tail -f ~/.openclaw/logs/gateway.log | grep -E "\[OpenClaw Skill\]|xiaohongshu"
```

**适配器调用日志**：
```bash
tail -f logs/adapter.log
```

---

## 📝 快速参考

### ✅ 正确说法

- "请使用 xiaohongshu-auto-publish Skill 调用 xxx 工具"
- "请调用 check_login_status 工具"
- "使用 xiaohongshu-auto-publish Skill 的 publish_content 工具发布"

### ❌ 错误说法

- "检查小红书 MCP" (不要提 MCP)
- "连接到 xiaohongshu-mcp" (不要提连接)
- "xiaohongshu-mcp 进程" (不要提进程)

---

## 🎉 成功案例

### 案例 1: 搜索

**你**：
```
请使用 xiaohongshu-auto-publish Skill 搜索"咖啡"相关内容。
```

**AI 会**：
1. 调用 Skill 的 `call` 方法
2. Skill 调用适配器 API: `/api/search?keyword=咖啡`
3. 返回搜索结果

### 案例 2: 发布

**你**：
```
请使用 xiaohongshu-auto-publish Skill 的 publish_content 工具发布：
- 标题：春日午后
- 内容：分享一家安静的咖啡馆
- 图片：/Users/xxx/Pictures/cafe.jpg
- 标签：[咖啡, 日常]
```

**AI 会**：
1. 调用 Skill 的 `call` 方法
2. Skill 调用适配器 API: `/api/publish`
3. 返回发布结果

---

## 📞 需要帮助？

如果 AI 仍然尝试查找旧进程：

1. **完全退出并重启 OpenClaw**
2. **在新对话的第一条消息就明确说明使用 Skill**
3. **在前几次对话中每次都重复强调使用 Skill**

---

**关键**：OpenClaw 的 AI 会学习模式，需要通过新的对话教会它使用新方式！
