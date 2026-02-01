# OpenClaw Skill 加载卡住问题修复

## 🐛 问题分析

### 问题症状
OpenClaw 在加载 Skill 时卡住，但直接调用 API 正常。

### 根本原因
Skill 的 `onLoad()` 方法包含同步的 HTTP 请求：

```javascript
async onLoad() {
  const health = await callApi('/health');  // ❌ 阻塞 Skill 加载
  ...
}
```

**问题**：
- OpenClaw 在加载 Skill 时会调用 `onLoad()`
- 如果 `onLoad()` 中有异步操作（如网络请求），会等待完成
- 如果请求超时或卡住，整个 Skill 加载就会被阻塞

### 对比

| 操作 | 直接调用 API | 在 onLoad 中调用 |
|------|-------------|---------------|
| 调用者 | 用户/测试脚本 | OpenClaw Skill 加载器 |
| 阻塞性 | 不阻塞 | ⚠️ 可能阻塞整个加载 |
| 超时处理 | 简单 | ⚠️ 需要额外配置 |
| 影响 | 仅当前操作 | ⚠️ 影响 Skill 加载 |

---

## ✅ 解决方案

### 移除 onLoad 中的网络请求

**之前的代码**：
```javascript
async onLoad() {
  const health = await callApi('/health');
  console.log('[OpenClaw Skill] ✅ API 连接成功');
}
```

**修复后**：
```javascript
async onLoad() {
  console.log('[OpenClaw Skill] ✅ Skill 加载完成');
  // 不进行网络请求，避免阻塞
}
```

### 延迟检查连接

将健康检查移到**首次调用工具时**：

```javascript
async call(toolName, params = {}) {
  console.log(`[OpenClaw Skill] 调用工具: ${toolName}`);

  // 首次调用时检查连接
  if (!this.apiChecked) {
    try {
      const health = await callApi('/health');
      console.log('[OpenClaw Skill] ✅ API 连接成功');
      this.apiChecked = true;
    } catch (error) {
      console.error('[OpenClaw Skill] ⚠️ API 连接失败');
    }
  }

  // 正常调用工具...
}
```

---

## 📊 修复前后对比

### 修复前

```
OpenClaw 启动
  ↓
加载 xiaohongshu-auto-publish Skill
  ↓
调用 onLoad()
  ↓
调用 callApi('/health')
  ↓
等待响应... ⏳ 可能卡住在这里
  ↓
Skill 加载完成 ❌ 被阻塞
```

### 修复后

```
OpenClaw 启动
  ↓
加载 xiaohongshu-auto-publish Skill
  ↓
调用 onLoad()
  ↓
打印日志（无网络请求）
  ↓
Skill 加载完成 ✅ 立即完成
  ↓
用户调用工具
  ↓
首次调用时检查 API 连接
```

---

## 🎯 为什么这样修复

### 1. Skill 加载应该是快速的

- `onLoad()` 应该只做轻量级初始化
- 不应该进行 I/O 操作（网络、文件等）
- 避免阻塞加载过程

### 2. 连接检查可以延迟

- API 连接检查不一定要在加载时进行
- 可以在第一次使用时检查
- 这样不会影响 Skill 加载速度

### 3. 错误处理更灵活

- 如果 API 不可用，Skill 仍然可以加载
- 在实际使用时再提示用户
- 用户体验更好

---

## 🚀 使用新版本

### 已更新文件

- `openclaw-api.js` - 移除 onLoad 中的网络请求
- `~/.openclaw/workspace/skills/xiaohongshu-auto-publish/index.js` - 已同步更新

### 无需重启适配器

适配器不需要重启，继续运行。

### 需要重启 OpenClaw

```bash
# 完全退出 OpenClaw 应用
# 然后重新打开
```

---

## 🧪 验证修复

### 1. 检查 Skill 加载

在 OpenClaw 中，Skill 应该立即加载完成，没有卡顿。

### 2. 测试功能

在 OpenClaw 中输入：
```
请调用 check_login_status 工具检查登录状态
```

### 3. 查看日志

```bash
tail -f logs/adapter.log
```

应该看到：
```
[MCP] 调用工具: check_login_status
```

---

## 📝 经验总结

### Skill 开发最佳实践

1. **onLoad() 应该快速完成**
   - 只做内存操作
   - 避免网络请求
   - 避免文件 I/O

2. **延迟初始化**
   - 首次使用时再检查连接
   - 懒加载资源

3. **错误处理**
   - 不要让初始化失败阻止 Skill 加载
   - 提供清晰的错误信息

---

## 🔍 相关文件

- `openclaw-api.js` - 源文件（已修复）
- `~/.openclaw/workspace/skills/xiaohongshu-auto-publish/index.js` - 已同步

---

**总结**：移除 `onLoad()` 中的网络请求，让 Skill 加载更快更稳定！
