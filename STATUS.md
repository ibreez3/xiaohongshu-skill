# OpenClaw 小红书 Skill - 快速参考

## ⚠️ 重要说明

**OpenClaw Skills 不是通过 `/命令` 调用的！**

Skills 是通过 **AI 对话自动识别并调用**的工具函数。

---

## ✅ 当前状态

### 服务状态
- ✅ **适配器**: 运行中 (PID: 7665, 端口: 3000)
- ✅ **MCP 连接**: 已连接 (13个工具)
- ✅ **登录状态**: 已登录
- ✅ **Skill 安装**: ~/.openclaw/workspace/skills/xiaohongshu-auto-publish/
- ✅ **配置已添加**: skills.entries.xiaohongshu

---

## 🚀 正确使用方法

### 在 OpenClaw 对话中使用

**检查登录状态**：
```
请帮我检查小红书的登录状态
```

**获取首页内容**：
```
获取小红书首页推荐列表
```

**搜索内容**：
```
帮我搜索小红书上关于"咖啡店"的内容
```

**发布内容**：
```
请帮我发布一篇小红书，标题是"春天的美食"，内容是"推荐几家好吃的餐厅"，使用图片 /path/to/food.jpg
```

---

## 🔧 可用工具

AI 可以调用以下工具：

- `check_login_status` - 检查登录状态
- `get_login_qrcode` - 获取登录二维码
- `list_feeds` - 获取首页列表
- `search_feeds` - 搜索内容
- `publish_content` - 发布图文
- `publish_with_video` - 发布视频
- `get_feed_detail` - 获取笔记详情
- `post_comment_to_feed` - 发表评论
- `like_feed` - 点赞
- `favorite_feed` - 收藏

---

## 🔧 常用命令

| 命令 | 说明 |
|------|------|
| `/check-login` | 检查登录状态 |
| `/get-qrcode` | 获取登录二维码 |
| `/list-feeds` | 获取首页列表 |
| `/search-feeds "关键词"` | 搜索内容 |
| `/publish-image-text "标题" "内容" ["/path/img.jpg"]` | 发布图文 |
| `/publish-video "标题" "内容" "/path/video.mp4"` | 发布视频 |
| `/get-feed-detail "feed_id" "token"` | 获取笔记详情 |
| `/post-comment "feed_id" "token" "评论"` | 发表评论 |

---

## 📊 系统架构

```
OpenClaw → HTTP API (localhost:3000) → 适配器 → SSE MCP → xiaohongshu-mcp
```

---

## 🔧 故障排查

### 问题: Skill 加载卡住

**症状**: OpenClaw 加载 Skill 时一直转圈或卡住

**原因**: 已修复 ✅ - 移除了 `onLoad()` 中的网络请求

**解决**:
1. 代码已更新并同步到安装目录
2. 完全重启 OpenClaw 应用
3. Skill 应该能快速加载

---

## 其他故障排查

### 如果命令不工作

1. **完全重启 OpenClaw**
   - 退出 OpenClaw 应用（不是 gateway）
   - 重新打开 OpenClaw

2. **检查适配器**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **查看日志**
   ```bash
   tail -f logs/adapter.log
   ```

---

## 📝 管理命令

```bash
./restart-adapter.sh      # 重启适配器
tail -f logs/adapter.log   # 查看日志
```

---

## 📚 文档

- **使用指南**: [OPENCRAW_USAGE.md](OPENCRAW_USAGE.md)
- **完整指南**: [OPENCRAW_GUIDE.md](OPENCRAW_GUIDE.md)
- **测试报告**: [API_TEST_REPORT.md](API_TEST_REPORT.md)

---

**下一步**: 在 OpenClaw 中输入 `/check-login` 测试
