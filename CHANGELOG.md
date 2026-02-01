# 更新日志

## [2.0.1] - 2025-02-01

### 🐛 Bug 修复：MCP 会话初始化错误

**问题**：
```
method "tools/call" is invalid during session initialization
```

**原因**：
缺少 MCP 协议要求的 `initialized` 通知步骤

**修复**：
- ✅ 添加 `sendMcpNotification()` 函数支持发送通知
- ✅ 在 `initializeMcpSession()` 中发送 `initialized` 通知
- ✅ 更新测试脚本，正确实现 MCP 协议流程

**详情**：参见 [FIX_INITIALIZATION.md](FIX_INITIALIZATION.md)

---

## [2.0.0] - 2025-02-01

### 重大变更：实现完整的 MCP 客户端

#### 问题
之前的版本直接调用 MCP 服务器的 `tools/call` 端点，违反了 MCP 协议规范：
- 没有会话初始化 (`initialize`)
- 没有工具发现 (`tools/list`)
- 不支持会话状态维护
- 在 OpenClaw 等不支持 MCP 的平台上无法正常工作

#### 解决方案
实现了完整的 MCP 客户端协议支持，包括：

1. **会话管理** (`index.js`)
   - 新增 `mcpSession` 状态对象
   - 实现 `initializeMcpSession()` 函数
   - 支持会话 ID 和服务器能力缓存

2. **JSON-RPC 通信层**
   - 实现 `sendMcpRequest()` 通用请求函数
   - 统一的错误处理和日志记录
   - 符合 JSON-RPC 2.0 规范

3. **工具发现**
   - 实现 `getMcpTools()` 函数
   - 动态获取 MCP 服务器的工具列表
   - 无需硬编码工具定义

4. **工具调用**
   - 实现 `callMcpTool()` 函数
   - 自动初始化（懒加载）
   - 支持多种内容类型（text、image）

5. **连接维护**
   - 实现 `pingMcpServer()` 函数
   - 保持连接活跃
   - 失败时自动重连

6. **Skill 生命周期**
   - `onLoad()`: 启动时初始化会话
   - `tools()`: 返回 MCP 服务器的工具定义
   - `call()`: 调用 MCP 工具
   - `onUnload()`: 清理会话状态

#### 新增文件

- `test-mcp-client.js`: MCP 客户端测试脚本
- `ARCHITECTURE.md`: 架构文档，详细说明 MCP 客户端实现
- `USAGE_GUIDE.md`: 使用指南，包含所有命令和场景示例
- `CHANGELOG.md`: 更新日志（本文件）

#### 改进

- ✅ 完全符合 MCP 2024-11-05 协议规范
- ✅ 支持任何 MCP 服务器（不仅限于 xiaohongshu-mcp）
- ✅ 自动工具发现，无需手动维护工具定义
- ✅ 详细的日志输出，便于调试
- ✅ 优雅的错误处理和重连机制
- ✅ 懒加载，减少启动时间

#### 向后兼容性

- ⚠️ 不兼容旧版本 OpenClaw（如果有的话）
- ✅ 环境变量 `XIAOHONGSHU_MCP_URL` 保持不变
- ✅ 工具调用接口保持不变

---

## 测试指南

### 1. 确保 xiaohongshu-mcp 服务器正在运行

```bash
# 在另一个终端
cd /path/to/xiaohongshu-mcp
npm start
```

### 2. 运行 MCP 客户端测试

```bash
node test-mcp-client.js
```

预期输出：
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

============================================================
✅ 所有测试通过!
============================================================
```

### 3. 在 OpenClaw 中测试

1. 将 Skill 安装到 OpenClaw 插件目录
2. 重启 OpenClaw
3. 查看日志确认初始化成功
4. 尝试调用工具，如 `/check-login`

---

## 文件变更总结

### 修改的文件

**index.js** (597 行)
- 新增 MCP 客户端状态管理
- 实现完整的 MCP 协议支持
- 添加详细的日志输出
- 改进错误处理

**README.md**
- 新增 "Architecture" 章节
- 添加 MCP 协议流程图
- 添加测试脚本使用说明

### 新增的文件

**test-mcp-client.js** (158 行)
- MCP 客户端测试脚本
- 彩色日志输出
- 完整的测试流程

**ARCHITECTURE.md** (350 行)
- MCP 客户端架构文档
- 数据流说明
- 调试指南

**USAGE_GUIDE.md** (500 行)
- 完整的使用指南
- 所有命令示例
- 常见问题解答

**CHANGELOG.md** (本文件)
- 更新日志
- 版本变更记录

---

## 下一步计划

### 功能增强
- [ ] 添加重试机制和超时配置
- [ ] 支持批量工具调用
- [ ] 添加工具调用缓存
- [ ] 支持流式响应（如果 MCP 服务器支持）

### 文档完善
- [ ] 添加视频教程
- [ ] 添加更多使用案例
- [ ] 添加性能优化建议

### 工具改进
- [ ] 创建交互式 CLI 工具
- [ ] 添加配置文件支持
- [ ] 添加日志级别配置

---

## 贡献者

- @[yourusername] - MCP 客户端实现
- [xpzouying](https://github.com/xpzouying) - xiaohongshu-mcp 服务器

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
