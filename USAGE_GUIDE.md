# 小红书 Skill 使用指南

## 快速开始

### 1. 启动 xiaohongshu-mcp 服务器

```bash
# 克隆仓库
git clone https://github.com/xpzouying/xiaohongshu-mcp.git
cd xiaohongshu-mcp

# 安装依赖
npm install

# 启动服务器
npm start
```

服务器将在 `http://127.0.0.1:18060/mcp` 启动。

### 2. 验证 MCP 连接

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
...
✅ 所有测试通过!
============================================================
```

### 3. 在 OpenClaw 中使用

将 Skill 安装到 OpenClaw 插件目录，重启后即可使用。

## 使用场景

### 场景 1: 检查登录状态

**命令：**
```
/check-login
```

**返回：**
```json
{
  "success": true,
  "data": {
    "isLoggedIn": false,
    "userInfo": null
  }
}
```

**如果未登录，获取二维码：**

```
/get-qrcode
```

二维码将保存到 `/tmp/xiaohongshu_qrcode.png`，使用小红书 App 扫码登录。

---

### 场景 2: 发布图文内容

**基本用法：**
```
/publish-image-text "今天吃了好吃的" "推荐一家超好吃的餐厅!" ["/path/to/image1.jpg", "/path/to/image2.jpg"] ["美食", "生活"]
```

**参数说明：**
- `title`: 标题（不超过 20 字）
- `content`: 正文内容
- `images`: 图片路径列表（本地绝对路径或 HTTP 链接）
- `tags`: 话题标签（可选）
- `schedule_at`: 定时发布时间（可选，ISO8601 格式）

**定时发布示例：**
```
/publish-image-text "标题" "内容" ["/path/to/image.jpg"] ["标签"] "2024-01-20T10:30:00+08:00"
```

**返回：**
```json
{
  "success": true,
  "data": {
    "success": true,
    "noteId": "64e1f2c30000000001038b9b",
    "message": "发布成功"
  }
}
```

---

### 场景 3: 发布视频内容

**基本用法：**
```
/publish-video "旅行vlog" "分享今天的旅行经历" "/path/to/video.mp4" ["旅行", "生活"]
```

**参数说明：**
- `title`: 标题（不超过 20 字）
- `content`: 正文内容
- `video`: 视频文件路径（本地绝对路径，仅支持单个文件）
- `tags`: 话题标签（可选）
- `schedule_at`: 定时发布时间（可选）

---

### 场景 4: 搜索内容

**基本搜索：**
```
/search-feeds "美食"
```

**带筛选条件：**
```
/search-feeds "美食" {"sort_by": "最多点赞", "note_type": "图文", "publish_time": "一周内"}
```

**可用筛选：**
- `sort_by`: 综合 | 最新 | 最多点赞 | 最多评论 | 最多收藏
- `note_type`: 不限 | 视频 | 图文
- `publish_time`: 不限 | 一天内 | 一周内 | 半年内
- `search_scope`: 不限 | 已看过 | 未看过 | 已关注
- `location`: 不限 | 同城 | 附近

**返回：**
```json
{
  "success": true,
  "data": {
    "feeds": [
      {
        "id": "64e1f2c30000000001038b9b",
        "title": "超好吃的餐厅推荐！",
        "user": {
          "nickname": "美食达人",
          "avatar": "..."
        },
        "liked": true,
        "collected": false,
        "likeCount": 1234,
        "collectCount": 567,
        "xsecToken": "..."
      }
    ]
  }
}
```

---

### 场景 5: 获取笔记详情

**基本用法：**
```
/get-feed-detail "64e1f2c30000000001038b9b" "xsec_token_here"
```

**加载所有评论：**
```
/get-feed-detail "64e1f2c30000000001038b9b" "xsec_token_here" true 50
```

**参数说明：**
- `feed_id`: 笔记 ID
- `xsec_token`: 访问令牌
- `load_all_comments`: 是否加载全部评论（默认 false）
- `limit`: 限制评论数量（默认 20）

---

### 场景 6: 发表评论

**基本用法：**
```
/post-comment "64e1f2c30000000001038b9b" "xsec_token_here" "很好吃！"
```

**回复评论：**
```
/reply-comment "64e1f2c30000000001038b9b" "xsec_token_here" "谢谢推荐！" "comment_id" "user_id"
```

---

### 场景 7: 互动操作

**点赞：**
```
/like-feed "64e1f2c30000000001038b9b" "xsec_token_here"
```

**取消点赞：**
```
/unlike-feed "64e1f2c30000000001038b9b" "xsec_token_here"
```

**收藏：**
```
/favorite-feed "64e1f2c30000000001038b9b" "xsec_token_here"
```

**取消收藏：**
```
/unfavorite-feed "64e1f2c30000000001038b9b" "xsec_token_here"
```

---

### 场景 8: 获取用户主页

```
/user-profile "user_id_here" "xsec_token_here"
```

**返回：**
```json
{
  "success": true,
  "data": {
    "userId": "user_id_here",
    "nickname": "用户昵称",
    "avatar": "头像URL",
    "description": "个人简介",
    "followersCount": 1234,
    "followingCount": 56,
    "likesCount": 7890,
    "notes": [...]
  }
}
```

---

### 场景 9: 获取首页列表

```
/list-feeds
```

返回您的小红书首页的 Feeds 列表。

---

## 完整工作流程示例

### 自动化内容发布流程

```javascript
// 1. 检查登录状态
const loginStatus = await checkLogin();
if (!loginStatus.isLoggedIn) {
  // 2. 获取二维码
  const qrcode = await getQrcode();
  console.log(`请扫描二维码: ${qrcode.path}`);

  // 等待用户扫码...
  await sleep(30000);

  // 3. 再次检查登录状态
  const newStatus = await checkLogin();
  if (!newStatus.isLoggedIn) {
    throw new Error('登录失败');
  }
}

// 4. 发布内容
const result = await publishImageText(
  "美食探店 | 超好吃的火锅",
  "今天发现一家超好吃的火锅店，强烈推荐给大家！",
  ["/path/to/image1.jpg", "/path/to/image2.jpg"],
  ["美食", "火锅", "探店"]
);

console.log(`发布成功！笔记 ID: ${result.noteId}`);
```

### 内容研究和互动流程

```javascript
// 1. 搜索相关内容
const searchResult = await searchFeeds("成都美食", {
  sort_by: "最多点赞",
  note_type: "图文"
});

// 2. 获取热门笔记详情
const topFeed = searchResult.feeds[0];
const feedDetail = await getFeedDetail(
  topFeed.id,
  topFeed.xsecToken,
  true,  // 加载所有评论
  20     // 最多 20 条评论
);

// 3. 发表评论
await postComment(
  topFeed.id,
  topFeed.xsecToken,
  "看起来很棒！下次去试试"
);

// 4. 点赞收藏
await likeFeed(topFeed.id, topFeed.xsecToken);
await favoriteFeed(topFeed.id, topFeed.xsecToken);
```

---

## 错误处理

所有操作都会返回统一格式：

```json
{
  "success": true/false,
  "data": {...},     // 成功时的数据
  "error": "..."     // 失败时的错误信息
}
```

**常见错误：**

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `MCP 服务无响应` | xiaohongshu-mcp 未运行 | 启动 MCP 服务器 |
| `未登录` | 未扫码登录 | 运行 `/get-qrcode` 扫码 |
| `图片不存在` | 路径错误 | 使用绝对路径 |
| `标题超过20字` | 标题过长 | 缩短标题 |
| `MCP 会话初始化失败` | 连接问题 | 检查网络和服务器状态 |

---

## 配置选项

### 修改 MCP 服务器地址

```bash
export XIAOHONGSHU_MCP_URL="http://your-server:port/mcp"
```

### 在代码中配置

```javascript
process.env.XIAOHONGSHU_MCP_URL = "http://custom-server:port/mcp";
```

---

## 高级用法

### 批量发布

```javascript
const contents = [
  { title: "...", content: "...", images: [...], tags: [...] },
  { title: "...", content: "...", images: [...], tags: [...] },
  { title: "...", content: "...", images: [...], tags: [...] }
];

for (const item of contents) {
  const result = await publishImageText(
    item.title,
    item.content,
    item.images,
    item.tags
  );

  console.log(`已发布: ${result.noteId}`);

  // 避免频率限制，等待几秒
  await sleep(5000);
}
```

### 定时发布

```javascript
// 发布时间：明天上午 10 点
const scheduleTime = new Date();
scheduleTime.setDate(scheduleTime.getDate() + 1);
scheduleTime.setHours(10, 0, 0, 0);

const result = await publishImageText(
  "标题",
  "内容",
  ["/path/to/image.jpg"],
  ["标签"],
  scheduleTime.toISOString()
);
```

---

## 最佳实践

1. **发布前预览**：先在本地准备好内容，确认无误后再发布
2. **图片处理**：建议使用高质量图片，尺寸推荐 1080x1440
3. **话题标签**：使用 3-5 个相关标签，提高曝光率
4. **发布时间**：选择用户活跃时间发布（如工作日晚上、周末）
5. **互动频率**：避免频繁操作，以免被限制
6. **错误重试**：网络错误时自动重试，但不要无限重试

---

## 故障排查

### 运行测试脚本诊断问题

```bash
node test-mcp-client.js
```

### 检查日志

MCP 客户端会输出详细日志：
```
[MCP Client] 正在初始化 MCP 会话...
[MCP Client] ✅ MCP 会话初始化成功
[OpenClaw Skill] 调用工具: check_login_status
```

### 重置登录状态

如果遇到登录问题，可以删除 MCP 服务器的 cookies 文件：

```bash
rm -f /path/to/xiaohongshu-mcp/cookies.json
```

---

## 相关链接

- [xiaohongshu-mcp 仓库](https://github.com/xpzouying/xiaohongshu-mcp)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [OpenClaw 文档](https://openclaw.dev)
