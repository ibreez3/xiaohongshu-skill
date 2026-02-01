# 在 OpenClaw 中使用小红书 Skill - 完整指南

## ✅ 当前状态

### 已完成
1. ✅ 适配器服务器正在运行（PID: 7665，端口: 3000）
2. ✅ MCP 连接成功（13个工具可用）
3. ✅ Skill 已安装到 `~/.openclaw/workspace/skills/xiaohongshu-auto-publish/`
4. ✅ API 测试全部通过

### 需要验证
- ⚠️ OpenClaw 是否识别这个 skill
- ⚠️ 命令是否可用

---

## 🔍 如何在 OpenClaw 中使用 Skill

### 方法 1: 通过命令调用（推荐）

OpenClaw 的 Skill 通过 `commands` 目录中的命令定义来调用。命令文件位于：
```
~/.openclaw/workspace/skills/xiaohongshu-auto-publish/commands/
```

**可用命令**：
- `/check-login` - 检查登录状态
- `/get-qrcode` - 获取登录二维码
- `/publish-image-text` - 发布图文内容
- `/publish-video` - 发布视频内容
- `/list-feeds` - 获取首页列表
- `/search-feeds` - 搜索内容
- `/get-feed-detail` - 获取笔记详情
- `/post-comment` - 发表评论

**使用方式**：
```
/check-login
```

---

### 方法 2: 通过 AI 对话调用

在 OpenClaw 的对话界面，你可以用自然语言描述你想要做的事情，AI 会自动调用相应的 skill。

**示例**：

1. **检查登录状态**
```
"帮我检查小红书的登录状态"
```

2. **发布内容**
```
"帮我发布一篇小红书，标题是'春天的美食'，内容是'推荐几家好吃的餐厅'，使用图片 /path/to/food.jpg"
```

3. **搜索内容**
```
"搜索小红书上关于'猫'的内容"
```

4. **获取首页列表**
```
"获取小红书首页推荐列表"
```

---

## 🔧 验证 Skill 是否加载

### 步骤 1: 检查 Skill 文件

```bash
ls -la ~/.openclaw/workspace/skills/xiaohongshu-auto-publish/
```

应该看到：
- `index.js` - Skill 主文件
- `openclaw.plugin.json` - 配置文件
- `commands/` - 命令定义目录

### 步骤 2: 检查适配器状态

```bash
curl http://localhost:3000/api/health
```

应该返回：
```json
{
  "status": "ok",
  "mcp": "connected",
  "tools": 13
}
```

### 步骤 3: 测试命令

在 OpenClaw 中尝试：
```
/check-login
```

如果命令不被识别，可能需要：
1. 完全退出并重启 OpenClaw 应用（不只是 gateway）
2. 或者手动在对话中调用 skill 功能

---

## 🚨 故障排查

### 问题 1: 命令不被识别

**症状**: 输入 `/check-login` 没有响应

**解决方案**:

1. **完全重启 OpenClaw**
   ```bash
   # 完全退出 OpenClaw 应用（不只是 gateway）
   # 然后重新打开 OpenClaw
   ```

2. **检查 Skill 是否在正确位置**
   ```bash
   ls -la ~/.openclaw/workspace/skills/xiaohongshu-auto-publish/
   ```

3. **检查适配器是否运行**
   ```bash
   curl http://localhost:3000/api/health
   ```

---

### 问题 2: Skill 无法连接到适配器

**症状**: 调用 skill 时报错 "API 调用失败"

**解决方案**:

1. **检查适配器状态**
   ```bash
   # 查看适配器日志
   tail -f logs/adapter.log

   # 检查进程
   ps aux | grep adapter-mcp
   ```

2. **重启适配器**
   ```bash
   ./restart-adapter.sh
   ```

3. **检查端口是否被占用**
   ```bash
   lsof -i :3000
   ```

---

### 问题 3: MCP 连接失败

**症状**: API 返回 "mcp: disconnected"

**解决方案**:

1. **检查 xiaohongshu-mcp 是否运行**
   ```bash
   curl http://127.0.0.1:18060/mcp
   ```

2. **重启 xiaohongshu-mcp**
   ```bash
   cd /path/to/xiaohongshu-mcp
   npm start
   ```

3. **重启适配器**
   ```bash
   ./restart-adapter.sh
   ```

---

## 📝 完整使用流程

### 第一次使用

1. **启动所有服务**
   ```bash
   # Terminal 1: 启动 xiaohongshu-mcp
   cd /path/to/xiaohongshu-mcp
   npm start

   # Terminal 2: 启动适配器
   cd xiaohongshu-skill
   ./restart-adapter.sh

   # Terminal 3: 验证状态
   curl http://localhost:3000/api/health
   ```

2. **重启 OpenClaw**
   - 完全退出 OpenClaw 应用
   - 重新打开 OpenClaw

3. **检查登录状态**
   ```
   /check-login
   ```

4. **如未登录，获取二维码**
   ```
   /get-qrcode
   ```
   - 二维码保存到 `/tmp/xiaohongshu_qrcode.png`
   - 使用小红书 App 扫码登录

5. **开始使用**
   ```
   /list-feeds
   /search-feeds "关键词"
   ```

---

## 💡 使用技巧

### 1. 批量发布

在 OpenClaw 中，你可以这样描述：
```
"帮我批量发布以下内容到小红书：
1. 标题：春天的美食，内容：推荐几家好吃的餐厅，图片：/path/to/food1.jpg
2. 标题：春游攻略，内容：分享几个好玩的地方，图片：/path/to/travel.jpg
"
```

### 2. 内容研究
```
"搜索小红书上关于'咖啡店'的内容，帮我分析一下热门话题"
```

### 3. 自动化运营
```
"每天早上9点，帮我搜索'早安'相关的内容，点赞前10条"
```

---

## 🔍 调试技巧

### 启用详细日志

Skill 会输出详细日志到 OpenClaw 的日志文件：

```bash
# 实时查看日志
tail -f ~/.openclaw/logs/gateway.log | grep xiaohongshu

# 查看适配器日志
tail -f logs/adapter.log
```

### 手动测试 API

```bash
# 测试登录状态
curl http://localhost:3000/api/check-login | jq .

# 测试获取首页
curl http://localhost:3000/api/feeds | jq '.data.count'

# 测试搜索
curl "http://localhost:3000/api/search?keyword=美食"
```

---

## 📚 相关命令

### 管理适配器

```bash
./restart-adapter.sh      # 重启适配器
./uninstall-adapter.sh    # 卸载
npm install               # 安装依赖
```

### 管理 Skill

```bash
# 查看已安装的 skill
ls -la ~/.openclaw/workspace/skills/

# 重新安装 skill
cp -r openclaw-api.js ~/.openclaw/workspace/skills/xiaohongshu-auto-publish/index.js

# 查看 skill 定义
cat ~/.openclaw/workspace/skills/xiaohongshu-auto-publish/openclaw.plugin.json
```

---

## 🎯 下一步

1. **验证命令可用性**
   - 尝试在 OpenClaw 中输入 `/check-login`
   - 如果不工作，完全重启 OpenClaw 应用

2. **测试核心功能**
   - 检查登录状态
   - 获取首页列表
   - 搜索内容

3. **开始使用**
   - 发布内容
   - 自动化运营

---

## ❓ 需要帮助？

如果遇到问题：

1. 检查 [API_TEST_REPORT.md](API_TEST_REPORT.md) - API 测试结果
2. 检查 [OPENCRAW_GUIDE.md](OPENCRAW_GUIDE.md) - 完整使用指南
3. 查看日志：`tail -f logs/adapter.log`
4. 提交 Issue：https://github.com/ibreez3/xiaohongshu-skill/issues

---

**状态**: 适配器运行正常 ✅ | Skill 已安装 ✅ | 等待 OpenClaw 识别 ⏳
