# 小红书 Skill 快速参考

## 核心命令速查

### 登录相关
```bash
/check-login              # 检查登录状态
/get-qrcode              # 获取登录二维码
```

### 发布内容
```bash
/publish-image-text "标题" "内容" ["/path/img1.jpg"] ["标签"]
/publish-video "标题" "内容" "/path/video.mp4" ["标签"]
```

### 内容获取
```bash
/list-feeds                                    # 获取首页列表
/search-feeds "关键词" {"sort_by": "最多点赞"} # 搜索内容
/get-feed-detail "feed_id" "xsec_token"       # 获取笔记详情
/user-profile "user_id" "xsec_token"          # 获取用户主页
```

### 互动操作
```bash
/post-comment "feed_id" "token" "评论内容"
/reply-comment "feed_id" "token" "回复" "comment_id" "user_id"
/like-feed "feed_id" "token"                 # 点赞
/favorite-feed "feed_id" "token"             # 收藏
```

## 筛选选项

| 参数 | 可选值 |
|-----|--------|
| sort_by | 综合、最新、最多点赞、最多评论、最多收藏 |
| note_type | 不限、视频、图文 |
| publish_time | 不限、一天内、一周内、半年内 |
| search_scope | 不限、已看过、未看过、已关注 |
| location | 不限、同城、附近 |

## 环境变量

```bash
export XIAOHONGSHU_MCP_URL="http://127.0.0.1:18060/mcp"
```

## 测试连接

```bash
node test-mcp-client.js
```

## 快速工作流

### 发布一篇笔记
```
1. /check-login          # 检查登录
2. /get-qrcode          # 扫码登录（如需要）
3. /publish-image-text  # 发布内容
```

### 搜索和互动
```
1. /search-feeds "关键词"
2. /get-feed-detail "feed_id" "token"
3. /post-comment "feed_id" "token" "评论"
4. /like-feed "feed_id" "token"
```

## 常见错误

| 错误 | 解决方案 |
|-----|---------|
| MCP 服务无响应 | 启动 xiaohongshu-mcp |
| 未登录 | 扫码登录 |
| 图片不存在 | 使用绝对路径 |
| 标题超过20字 | 缩短标题 |

## 文档链接

- 📘 [完整使用指南](USAGE_GUIDE.md)
- 🏗️ [架构文档](ARCHITECTURE.md)
- 📝 [更新日志](CHANGELOG.md)
- 🔗 [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp)
