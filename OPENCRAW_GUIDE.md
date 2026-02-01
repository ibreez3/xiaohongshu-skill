# 在 OpenClaw 中使用小红书自动化

## 🎯 解决方案概述

由于 OpenClaw 不直接支持 SSE MCP 传输，我们创建了一个 **HTTP API 适配器** 作为中间层：

```
OpenClaw → HTTP API → 适配器 (adapter-mcp.js) → SSE MCP → xiaohongshu-mcp
```

**适配器功能**：
- ✅ 使用官方 MCP SDK 连接到 xiaohongshu-mcp
- ✅ 维护 SSE 持久连接
- ✅ 提供 RESTful API 供 OpenClaw 调用
- ✅ 自动处理会话管理

---

## 📦 快速安装

### 前置要求

1. **xiaohongshu-mcp 服务器正在运行**
   ```bash
   cd /path/to/xiaohongshu-mcp
   npm start
   ```

2. **Node.js 18+ 已安装**

### 一键安装

```bash
./install-adapter.sh
```

这个脚本会自动：
- ✅ 安装依赖（@modelcontextprotocol/sdk, express, cors）
- ✅ 启动适配器服务器（后台运行，端口 3000）
- ✅ 安装 OpenClaw Skill
- ✅ 验证连接状态

---

## 🚀 使用方法

### 启动服务

**方式 1：使用安装脚本（推荐）**
```bash
./install-adapter.sh
```

**方式 2：手动启动**
```bash
# 1. 安装依赖
npm install

# 2. 启动适配器
node adapter-mcp.js
```

### 验证服务

```bash
# 检查适配器健康状态
curl http://localhost:3000/api/health

# 预期输出：
# {
#   "status": "ok",
#   "mcp": "connected",
#   "mcpServer": "http://127.0.0.1:18060/mcp",
#   "tools": 13
# }
```

### 在 OpenClaw 中使用

重启 OpenClaw 后，可以使用以下命令：

#### 1. 检查登录状态
```
/check-login
```

#### 2. 获取登录二维码
```
/get-qrcode
```

#### 3. 发布图文内容
```
/publish "标题" "正文内容" ["/path/to/image1.jpg", "/path/to/image2.jpg"] ["标签1", "标签2"]
```

#### 4. 发布视频内容
```
/publish-video "标题" "正文内容" "/path/to/video.mp4" ["标签1", "标签2"]
```

#### 5. 搜索内容
```
/search "关键词" {"sortBy": "最多点赞", "noteType": "图文"}
```

#### 6. 获取首页列表
```
/list-feeds
```

#### 7. 获取笔记详情
```
/get-feed-detail "feed_id" "xsec_token"
```

#### 8. 发表评论
```
/post-comment "feed_id" "xsec_token" "评论内容"
```

#### 9. 点赞/收藏
```
/like-feed "feed_id" "xsec_token"
/favorite-feed "feed_id" "xsec_token"
```

---

## 🔧 管理命令

### 重启适配器

```bash
./restart-adapter.sh
```

### 停止适配器

```bash
# 如果使用 PID 文件
kill $(cat adapter.pid)

# 或者直接杀掉端口 3000 的进程
lsof -ti:3000 | xargs kill -9
```

### 查看日志

```bash
tail -f adapter.log
```

### 卸载

```bash
./uninstall-adapter.sh
```

---

## 📋 API 端点参考

适配器提供以下 HTTP API 端点：

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/tools` | 获取可用工具列表 |
| GET | `/api/check-login` | 检查登录状态 |
| GET | `/api/qrcode` | 获取登录二维码 |
| POST | `/api/publish` | 发布图文内容 |
| POST | `/api/publish-video` | 发布视频内容 |
| GET | `/api/search` | 搜索内容 |
| GET | `/api/feeds` | 获取首页列表 |
| GET | `/api/feed/:feedId` | 获取笔记详情 |
| POST | `/api/feed/:feedId/comment` | 发表评论 |
| POST | `/api/feed/:feedId/like` | 点赞 |
| POST | `/api/feed/:feedId/favorite` | 收藏 |
| GET | `/api/user/:userId` | 获取用户主页 |

---

## 🔍 故障排查

### 问题 1：适配器启动失败

**症状**：`node adapter-mcp.js` 报错

**解决方案**：
```bash
# 1. 检查 xiaohongshu-mcp 是否运行
curl http://127.0.0.1:18060/mcp

# 2. 检查端口是否被占用
lsof -i :3000

# 3. 查看详细日志
node adapter-mcp.js
```

### 问题 2：MCP 连接失败

**症状**：`mcp: disconnected`

**解决方案**：
```bash
# 1. 确保 xiaohongshu-mcp 正在运行
cd /path/to/xiaohongshu-mcp
npm start

# 2. 检查 MCP 服务器地址
echo $XIAOHONGSHU_MCP_URL
# 或
export XIAOHONGSHU_MCP_URL="http://127.0.0.1:18060/mcp"

# 3. 重启适配器
./restart-adapter.sh
```

### 问题 3：OpenClaw 无法调用工具

**症状**：工具调用失败或超时

**解决方案**：
```bash
# 1. 检查适配器是否运行
curl http://localhost:3000/api/health

# 2. 检查 OpenClaw 日志
tail -f ~/.openclaw/logs/*.log

# 3. 测试 API 调用
curl http://localhost:3000/api/check-login

# 4. 重启 OpenClaw
```

### 问题 4：未登录错误

**症状**：`未登录` 或 `请先登录`

**解决方案**：
```bash
# 1. 检查登录状态
curl http://localhost:3000/api/check-login

# 2. 获取二维码并扫码登录
curl http://localhost:3000/api/qrcode

# 3. 使用小红书 App 扫描二维码
```

---

## 📊 架构说明

```
┌─────────────┐         HTTP          ┌──────────────┐        SSE        ┌─────────────────┐
│             │                        │              │                    │                 │
│  OpenClaw   │ ─────────────────────> │   Adapter    │ ───────────────> │ xiaohongshu-mcp │
│             │  localhost:3000/api    │ (adapter-    │   localhost:18060/mcp  │                 │
│             │                        │  mcp.js)     │                    │                 │
│             │                        │              │                    │                 │
│             │                        │ - 维护SSE连接│                    │ - 浏览器自动化  │
│             │                        │ - 会话管理  │                    │ - Cookie管理    │
│             │                        │ - API转换   │                    │                 │
└─────────────┘                        └──────────────┘                    └─────────────────┘
```

**关键点**：
- OpenClaw 调用简单的 HTTP API
- 适配器使用官方 MCP SDK 维护 SSE 连接
- 适配器处理所有 MCP 协议细节
- OpenClaw 无需关心 MCP 实现

---

## ⚙️ 配置选项

### 修改 API 端口

```bash
export API_PORT=4000
node adapter-mcp.js
```

### 修改 MCP 服务器地址

```bash
export XIAOHONGSHU_MCP_URL="http://192.168.1.100:18060/mcp"
node adapter-mcp.js
```

### 在 OpenClaw 中配置

编辑 `openclaw-api.js`，修改 API 地址：

```javascript
const API_BASE = process.env.XIAOHONGSHU_API_URL || 'http://localhost:4000/api';
```

---

## 🔐 安全考虑

### 本地使用

适配器默认绑定到 `localhost:3000`，只能本地访问。

### 远程访问

如果需要远程访问，请：

1. **使用防火墙限制访问**
2. **添加身份验证**
3. **使用 HTTPS**

示例：添加基本认证

```javascript
// adapter-mcp.js
import basicAuth from 'express-basic-auth';

app.use(basicAuth({
  users: { 'admin': 'password' },
  challenge: true
}));
```

---

## 📈 性能优化

### 连接复用

适配器会维护长连接到 MCP 服务器，避免重复初始化。

### 缓存

可以添加缓存层减少重复调用：

```javascript
const cache = new Map();

app.get('/api/check-login', async (req, res) => {
  const cached = cache.get('login-status');
  if (cached && Date.now() - cached.time < 60000) {
    return res.json(cached.data);
  }

  const result = await mcpAdapter.callTool('check_login_status', {});
  cache.set('login-status', { time: Date.now(), data: result });
  res.json({ success: true, data: result });
});
```

---

## 🆚 与直接使用 MCP 客户端的对比

| 特性 | OpenClaw + 适配器 | Cursor/Claude Code |
|------|------------------|-------------------|
| 安装复杂度 | ⭐⭐⭐ 需要额外服务 | ⭐ 开箱即用 |
| 性能 | ⭐⭐⭐ 多一层转发 | ⭐⭐⭐⭐⭐ 直接连接 |
| 稳定性 | ⭐⭐⭐ 取决于适配器 | ⭐⭐⭐⭐⭐ 原生支持 |
| 维护成本 | ⭐⭐ 需要维护适配器 | ⭐⭐⭐⭐⭐ 无需维护 |
| 推荐度 | 适合 OpenClaw 用户 | 最推荐 |

---

## 📚 相关文档

- [OPENCRAW_MCP_ISSUE.md](OPENCRAW_MCP_ISSUE.md) - OpenClaw MCP 问题分析
- [ARCHITECTURE.md](ARCHITECTURE.md) - MCP 客户端架构
- [USAGE_GUIDE.md](USAGE_GUIDE.md) - 完整使用指南
- [xiaohongshu-mcp GitHub](https://github.com/xpzouying/xiaohongshu-mcp) - MCP 服务器

---

## 🎉 总结

通过这个适配器，您现在可以在 OpenClaw 中：

✅ 发布图文和视频内容到小红书
✅ 搜索和浏览小红书内容
✅ 发表评论和互动
✅ 获取用户信息

**开始使用**：
```bash
./install-adapter.sh
# 重启 OpenClaw
# 开始使用小红书自动化功能！
```

如有问题，请查看 [故障排查](#故障排查) 部分或提交 Issue。
