# xiaohongshu-mcp SSE 客户端实现说明

## 问题

xiaohongshu-mcp 使用 SSE (Server-Sent Events) 传输，而不是简单的 HTTP POST。

当前实现使用独立 HTTP POST 请求，无法维持会话状态。

## 解决方案：实现 SSE 客户端

### MCP SSE 传输协议

```
客户端                          服务器
  │                              │
  │ ── POST /mcp (initialize) ──>│
  │ <──── SSE 连接 ──────────────│
  │                              │
  │ 持续接收事件                  │
  │ <──── event: endpoint ───────│
  │ <──── event: message ────────│
  │                              │
  │ ── POST /mcp (tools/list) ──>│
  │                              │
```

### 实现步骤

1. 建立 SSE 连接到 `/mcp?sessionId=xxx`
2. 在 SSE 连接上发送请求
3. 监听 SSE 事件获取响应
4. 维持连接活跃状态

### Node.js SSE 客户端实现

可以使用 `@modelcontextprotocol/sdk` 官方 SDK：

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// 对于 SSE，需要自定义 transport
```

### 简化方案：使用 HTTP API

如果 xiaohongshu-mcp 提供了 HTTP API（非 MCP），可以直接使用：

```javascript
// 不使用 MCP 协议，直接调用 HTTP API
const response = await fetch('http://localhost:18060/api/check_login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
});
```

## 建议

1. **联系 xiaohongshu-mcp 作者**：确认是否支持非 SSE 的 HTTP MCP
2. **使用官方 MCP SDK**：`@modelcontextprotocol/sdk`
3. **考虑使用 x-mcp**：作者提供的浏览器插件版本

## 相关资源

- [MCP SDK 文档](https://modelcontextprotocol.io/)
- [xiaohongshu-mcp GitHub](https://github.com/xpzouying/xiaohongshu-mcp)
- [x-mcp 浏览器插件](https://github.com/xpzouying/x-mcp)
