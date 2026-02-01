# OpenClaw 小红书 Skill - 快速参考

## ✅ 当前状态

### 服务状态
- ✅ **适配器**: 运行中 (PID: 7665, 端口: 3000)
- ✅ **MCP 连接**: 已连接 (13个工具)
- ✅ **登录状态**: 已登录
- ✅ **Skill 安装**: ~/.openclaw/workspace/skills/xiaohongshu-auto-publish/

### 待验证
- ⏳ OpenClaw 是否识别 Skill
- ⏳ 命令是否可用

---

## 🚀 快速开始

### 在 OpenClaw 中使用

**方式 1: 直接命令**
```
/check-login
```

**方式 2: 自然语言**
```
"帮我检查小红书登录状态"
```

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

## 🔍 故障排查

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
