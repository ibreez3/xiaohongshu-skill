# MCP 客户端实现架构

## 概述

本项目实现了完整的 MCP (Model Context Protocol) 客户端，使 OpenClaw Skill 能够通过标准 MCP 协议与 xiaohongshu-mcp 服务器通信。

## 为什么需要完整的 MCP 客户端？

OpenClaw 原生不支持 MCP 协议。它提供的是简单的插件 API：

```javascript
// OpenClaw Skill API
export default {
  async tools() { return [...]; },
  async call(name, params) { return {...}; }
}
```

而 MCP 协议要求：
1. **会话初始化** (`initialize`)
2. **工具发现** (`tools/list`)
3. **工具调用** (`tools/call`)
4. **连接维护** (`ping`)

因此我们需要在 Skill 内部实现完整的 MCP 客户端逻辑。

## 核心组件

### 1. 会话状态管理

```javascript
let mcpSession = {
  initialized: false,    // 会话是否已初始化
  sessionId: null,       // 会话 ID
  capabilities: null,    // 服务器能力
  tools: [],             // 可用工具列表
  lastPing: 0           // 最后 ping 时间
};
```

### 2. JSON-RPC 通信层

```javascript
async function sendMcpRequest(method, params) {
  // 发送 JSON-RPC 2.0 请求
  // 处理响应和错误
}
```

**关键点：**
- 使用 JSON-RPC 2.0 协议
- 每个请求都有唯一的 ID
- 统一的错误处理

### 3. 会话初始化

```javascript
async function initializeMcpSession() {
  const result = await sendMcpRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'xiaohongshu-openclaw-skill',
      version: '1.0.0'
    }
  });

  mcpSession.sessionId = result.sessionId;
  mcpSession.capabilities = result.capabilities;
  mcpSession.initialized = true;
}
```

**MCP 协议要求：**
- 指定协议版本 `2024-11-05`
- 提供客户端信息
- 保存会话 ID 和服务器能力

### 4. 工具发现

```javascript
async function getMcpTools() {
  const result = await sendMcpRequest('tools/list', {});
  mcpSession.tools = result.tools;
  return mcpSession.tools;
}
```

**优点：**
- 动态获取可用工具
- 无需硬编码工具定义
- 自动适配服务器更新

### 5. 工具调用

```javascript
async function callMcpTool(toolName, args) {
  // 确保会话已初始化
  if (!mcpSession.initialized) {
    await initializeMcpSession();
    await getMcpTools();
  }

  const result = await sendMcpRequest('tools/call', {
    name: toolName,
    arguments: args
  });

  // 解析返回的内容
  return parseMcpResult(result);
}
```

**特点：**
- 自动初始化（懒加载）
- 统一的结果解析
- 支持 text 和 image 类型内容

### 6. 连接维护

```javascript
async function pingMcpServer() {
  await sendMcpRequest('ping', {});
  mcpSession.lastPing = Date.now();
}
```

**用途：**
- 保持连接活跃
- 检测服务器状态
- 失败时自动重连

## OpenClaw Skill 集成

### Skill 生命周期

```javascript
export default {
  // 1. 加载时初始化
  async onLoad() {
    await initializeMcpSession();
    await getMcpTools();
  },

  // 2. 返回工具定义
  async tools() {
    return mcpSession.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
  },

  // 3. 调用工具
  async call(toolName, params) {
    return await callMcpTool(toolName, params);
  },

  // 4. 卸载时清理
  async onUnload() {
    mcpSession.initialized = false;
  }
};
```

## 错误处理策略

### 1. 初始化失败

```javascript
async onLoad() {
  try {
    await initializeMcpSession();
  } catch (error) {
    // 不阻止 Skill 加载
    // 在首次调用时重试
  }
}
```

### 2. 调用失败

```javascript
async call(toolName, params) {
  try {
    const result = await callMcpTool(toolName, params);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 3. Ping 失败

```javascript
async pingMcpServer() {
  try {
    await sendMcpRequest('ping', {});
  } catch (error) {
    // 标记会话为未初始化
    // 下次调用会重新初始化
    mcpSession.initialized = false;
  }
}
```

## 数据流

### 典型的工具调用流程

```
用户请求
   ↓
OpenClaw 调用 Skill.call(toolName, params)
   ↓
MCP 客户端检查会话状态
   ↓
[如果未初始化] initializeMcpSession()
   ↓
[如果未获取工具] getMcpTools()
   ↓
sendMcpRequest('tools/call', { name, arguments })
   ↓
MCP 服务器处理请求
   ↓
返回 JSON-RPC 响应
   ↓
解析结果 (parseMcpResult)
   ↓
返回给 OpenClaw
   ↓
OpenClaw 返回给用户
```

## 测试

### 运行测试脚本

```bash
node test-mcp-client.js
```

测试覆盖：
1. ✅ 会话初始化
2. ✅ Ping 服务器
3. ✅ 获取工具列表
4. ✅ 调用测试工具

### 预期输出

```
============================================================
MCP 客户端测试
服务器: http://127.0.0.1:18060/mcp
============================================================

[测试 1/4] 初始化会话 (initialize)
✅ 成功
会话 ID: session_xxx
服务器能力: {...}

[测试 2/4] Ping 服务器 (ping)
✅ 成功

[测试 3/4] 获取工具列表 (tools/list)
✅ 成功
获取到 13 个工具:
  1. publish_content
  2. publish_with_video
  ...

[测试 4/4] 调用工具 (tools/call)
调用 check_login_status...
✅ 成功
登录状态: {...}

============================================================
✅ 所有测试通过!
============================================================
```

## 调试

### 启用详细日志

所有 MCP 客户端操作都会输出日志：

```
[MCP Client] 正在初始化 MCP 会话...
[MCP Client] 发送请求: initialize
[MCP Client] 响应成功: initialize
[MCP Client] ✅ MCP 会话初始化成功
```

### 常见问题

**Q: 连接超时**
```
MCP 服务无响应，请确认服务是否运行在 http://127.0.0.1:18060/mcp
```
解决方案：检查 xiaohongshu-mcp 是否正在运行

**Q: 初始化失败**
```
MCP 会话初始化失败: Connection refused
```
解决方案：
1. 确认 MCP 服务器已启动
2. 检查 XIAOHONGSHU_MCP_URL 环境变量
3. 运行测试脚本验证连接

**Q: 工具调用失败**
```
MCP Error: Method not found (code: -32601)
```
解决方案：
1. 检查工具名称是否正确
2. 运行 `tools/list` 查看可用工具

## 性能考虑

### 会话缓存

会话初始化后，状态会被缓存：
- 避免重复初始化
- 工具列表只获取一次
- 减少 MCP 服务器负载

### 懒加载

- 首次调用时才初始化会话
- Skill 加载失败不影响启动
- 按需建立连接

## 扩展性

### 支持其他 MCP 服务器

只需修改 `MCP_SERVER` 环境变量：

```bash
export XIAOHONGSHU_MCP_URL="http://another-server:port/mcp"
```

### 添加新功能

1. 在 MCP 服务器端实现工具
2. 客户端会自动通过 `tools/list` 发现
3. 无需修改 Skill 代码

## 参考资源

- [MCP 协议规范](https://modelcontextprotocol.io/)
- [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp)
- [JSON-RPC 2.0 规范](https://www.jsonrpc.org/specification)
