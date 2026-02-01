# MCP 会话初始化修复

## 问题

错误信息：
```
❌ 搜索失败: method "tools/call" is invalid during session initialization
```

## 原因

根据 MCP (Model Context Protocol) 2024-11-05 规范，会话初始化需要以下步骤：

1. **客户端 → 服务器**: `initialize` 请求
2. **服务器 → 客户端**: `initialize` 响应（包含会话 ID 和服务器能力）
3. **客户端 → 服务器**: `initialized` **通知** ⬅️ **这是关键！**
4. **客户端 → 服务器**: `tools/call` 等其他请求

之前的实现缺少了 **第 3 步**：发送 `initialized` 通知。

## 修复

### 1. 添加发送通知的函数

```javascript
async function sendMcpNotification(method, params = {}) {
  const request = {
    jsonrpc: JSON_RPC_VERSION,
    // 注意：通知没有 id 字段
    method,
    params
  };

  const response = await fetch(MCP_SERVER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  return response.ok;
}
```

**关键点**：
- 通知（notification）是 JSON-RPC 的一种特殊请求
- 通知**没有 id 字段**，服务器不会返回响应
- 用于告知服务器某些事件完成

### 2. 更新初始化函数

```javascript
async function initializeMcpSession() {
  // 步骤 1: 发送 initialize 请求
  const initResult = await sendMcpRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'xiaohongshu-openclaw-skill',
      version: '1.0.0'
    }
  });

  // 保存会话信息
  mcpSession.sessionId = initResult?.sessionId;
  mcpSession.capabilities = initResult?.capabilities;

  // 步骤 2: 发送 initialized 通知（必需！）
  await sendMcpNotification('initialized', {});

  // 现在会话才完全初始化
  mcpSession.initialized = true;

  return true;
}
```

### 3. 更新测试脚本

测试脚本也添加了相同的流程：

```javascript
// 测试 1: Initialize
await sendRequest('initialize', {...});

// 测试 2: 发送 initialized 通知
await sendNotification('initialized', {});

// 测试 3-5: 其他请求
await sendRequest('ping', {});
await sendRequest('tools/list', {});
await sendRequest('tools/call', {...});
```

## 验证

运行测试脚本验证修复：

```bash
node test-mcp-client.js
```

预期输出：
```
============================================================
MCP 客户端测试
服务器: http://127.0.0.1:18060/mcp
============================================================

[测试 1/5] 初始化会话 (initialize)
✅ 成功
会话 ID: session_xxx
服务器能力: {...}

[测试 2/5] 发送 initialized 通知
✅ 通知发送成功

[测试 3/5] Ping 服务器 (ping)
✅ 成功

[测试 4/5] 获取工具列表 (tools/list)
✅ 成功
获取到 13 个工具:
  1. publish_content
  ...

[测试 5/5] 调用工具 (tools/call)
✅ 成功

============================================================
✅ 所有测试通过!
============================================================
```

## MCP 协议要点

### JSON-RPC 请求类型

| 类型 | 有 id 字段 | 期望响应 | 用途 |
|------|----------|---------|------|
| **请求** (request) | ✅ 是 | ✅ 是 | 需要返回结果的调用 |
| **通知** (notification) | ❌ 否 | ❌ 否 | 告知事件，不需要响应 |

### MCP 必需流程

```
客户端                          服务器
  │                              │
  │ ── initialize 请求 ────────> │
  │                              │ (会话进入"初始化中"状态)
  │ <──── initialize 响应 ─────── │
  │                              │
  │ ── initialized 通知 ───────> │ (会话完全初始化)
  │                              │
  │ ── tools/call 请求 ────────> │ (现在可以调用其他方法)
  │ <──── tools/call 响应 ────── │
  │                              │
```

### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `"tools/call" is invalid during session initialization` | 缺少 `initialized` 通知 | 在 `initialize` 响应后发送 `initialized` 通知 |
| `"initialize" called after session initialized` | 重复初始化 | 检查 `mcpSession.initialized` 标志 |

## 参考资源

- [MCP 协议规范 - Initialization](https://spec.modelcontextprotocol.io/specification/client-to-server/)
- [JSON-RPC 2.0 规范 - Notification](https://www.jsonrpc.org/specification#notification)

## 总结

**关键修复**：在 `initialize` 请求响应后，必须发送 `initialized` 通知才能开始调用其他 MCP 方法。这是 MCP 协议的强制要求。
