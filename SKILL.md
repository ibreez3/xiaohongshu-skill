# 小红书自动发稿 Skill

## 概述

本 Skill 提供通过 OpenClaw 直接调用小红书 MCP 服务的功能，支持发布图文/视频、搜索内容、获取详情、发表评论、点赞收藏等完整功能。

---

## 功能列表

### 发布相关

#### 1. 发布图文 📝
发布图文内容到小红书，包括标题、正文、图片和话题标签。

**工具名称**: `publish_content`

**参数**:
- `title` (string, 必填) - 笔记标题，不超过 20 个字
- `content` (string, 必填) - 笔记正文
- `images` (array, 必填) - 图片列表，支持本地绝对路径或 HTTP/HTTPS 链接
- `tags` (array, 可选) - 话题标签列表，如 ["美食", "生活"]
- `schedule_at` (string, 可选) - 定时发布时间（ISO8601格式）

**示例**:
```
请帮我发布一篇小红书图文：
- 标题：春日花语
- 正文：春风拂面，万物复苏...
- 图片：/Users/username/Pictures/spring.jpg
- 标签：["生活", "春天"]
```

---

#### 2. 发布视频 🎬
发布视频内容到小红书。

**工具名称**: `publish_with_video`

**参数**:
- `title` (string, 必填) - 内容标题，不超过 20 个字
- `content` (string, 必填) - 正文内容
- `video` (string, 必填) - 本地视频文件绝对路径
- `tags` (array, 可选) - 话题标签列表
- `schedule_at` (string, 可选) - 定时发布时间

**示例**:
```
发布小红书视频：
- 标题：旅行 vlog
- 正文：分享今天的旅行经历
- 视频：/Users/username/Videos/travel.mp4
- 标签：["旅行", "生活"]
```

---

### 登录相关

#### 3. 检查登录状态 ✅
检查当前小红书登录状态。

**工具名称**: `check_login_status`

**参数**: 无

**返回信息**:
- 是否已登录
- 登录用户名（如果已登录）

---

#### 4. 获取登录二维码 🔲
获取登录二维码用于扫码登录。

**工具名称**: `get_login_qrcode`

**参数**: 无

---

### 内容获取

#### 5. 获取首页列表 🏠
获取小红书首页的 Feeds 列表。

**工具名称**: `list_feeds`

**参数**: 无

---

#### 6. 搜索内容 🔍
根据关键词搜索小红书内容。

**工具名称**: `search_feeds`

**参数**:
- `keyword` (string, 必填) - 搜索关键词
- `sort_by` (string, 可选) - 综合|最新|最多点赞|最多评论|最多收藏
- `note_type` (string, 可选) - 不限|视频|图文
- `publish_time` (string, 可选) - 不限|一天内|一周内|半年内

**示例**:
```
搜索小红书上关于"咖啡"的内容，按最多点赞排序
```

---

#### 7. 获取笔记详情 📄
获取指定笔记的详细信息，包括评论列表。

**工具名称**: `get_feed_detail`

**参数**:
- `feed_id` (string, 必填) - 笔记ID
- `xsec_token` (string, 必填) - 访问令牌
- `load_all_comments` (boolean, 可选) - 是否加载全部评论
- `limit` (number, 可选) - 评论数量限制

**示例**:
```
获取小红书笔记详情，笔记ID是 xxx，令牌是 yyy
```

---

### 互动相关

#### 8. 发表评论 💬
向指定笔记发表评论。

**工具名称**: `post_comment_to_feed`

**参数**:
- `feed_id` (string, 必填) - 笔记ID
- `xsec_token` (string, 必填) - 访问令牌
- `content` (string, 必填) - 评论内容

---

#### 9. 回复评论 💭
回复笔记下的指定评论。

**工具名称**: `reply_comment_in_feed`

**参数**:
- `feed_id` (string, 必填) - 笔记ID
- `xsec_token` (string, 必填) - 访问令牌
- `comment_id` (string, 可选) - 目标评论ID
- `user_id` (string, 可选) - 目标评论用户ID
- `content` (string, 必填) - 回复内容

---

#### 10. 点赞/取消点赞 👍
为笔记点赞或取消点赞。

**工具名称**: `like_feed`

**参数**:
- `feed_id` (string, 必填) - 笔记ID
- `xsec_token` (string, 必填) - 访问令牌
- `unlike` (boolean, 可选) - true为取消点赞，false为点赞

---

#### 11. 收藏/取消收藏 ⭐
收藏或取消收藏笔记。

**工具名称**: `favorite_feed`

**参数**:
- `feed_id` (string, 必填) - 笔记ID
- `xsec_token` (string, 必填) - 访问令牌
- `unfavorite` (boolean, 可选) - true为取消收藏，false为收藏

---

#### 12. 获取用户主页 👤
获取用户的主页信息。

**工具名称**: `user_profile`

**参数**:
- `user_id` (string, 必填) - 用户ID
- `xsec_token` (string, 必填) - 访问令牌

---

## 使用说明

### 前置要求

1. **小红书 MCP 服务必须运行**
   - 确保 `http://127.0.0.1:18060/mcp` 可访问
   - 可通过 MCP Inspector 确认服务状态

2. **首次使用需要登录**
   - 使用"获取登录二维码"功能获取二维码
   - 用小红书 APP 扫码登录
   - 登录后 Cookie 会被保存

### 在 OpenClaw 中使用

直接在对话中描述需求即可，例如：

```
发布一篇关于春天的图文到小红书
- 标题：春日赏樱
- 正文：樱花绽放，春意盎然...
- 图片：/Users/username/Pictures/sakura.jpg
- 标签：春天、生活
```

或：

```
搜索小红书上关于"咖啡"的图文内容
```

或：

```
给这个小红书笔记点赞，笔记ID是 xxx
```

---

## 技术实现

### MCP 连接
使用 HTTP JSON-RPC 2.0 协议连接到小红书 MCP 服务：

```
服务器地址: http://127.0.0.1:18060/mcp
协议: HTTP JSON-RPC 2.0
```

### 工具调用流程
1. 接收 OpenClaw 的工具调用请求
2. 构造 JSON-RPC 请求
3. 通过 HTTP POST 发送到 MCP 服务
4. 解析返回结果
5. 返回格式化的响应

---

## 注意事项

1. **字数限制**
   - 标题不超过 20 个字
   - 正文建议不超过 1000 个字

2. **文件路径**
   - 本地路径必须是绝对路径
   - HTTP/HTTPS 链接需要确保可访问

3. **登录状态**
   - 发布和某些互动功能需要先登录
   - 未登录时会返回相应错误提示

4. **错误处理**
   - 如果 MCP 服务未运行，会提示检查服务状态
   - 参数验证失败会明确提示具体错误

---

## 安装到 OpenClaw

### 方法一：复制到扩展目录

```bash
cp -r /Users/sunyang/wordspace/ai/skills/xiaohongshu-skill ~/.openclaw/extensions/xiaohongshu-auto-publish
```

### 方法二：通过 npm 安装（如果已发布）

```bash
cd ~/.openclaw/extensions
npm install xiaohongshu-auto-publish
```

### 配置

在 `~/.openclaw/openclaw.json` 中添加：

```json
{
  "plugins": {
    "entries": {
      "xiaohongshu-auto-publish": {
        "enabled": true
      }
    },
    "installs": {
      "xiaohongshu-auto-publish": {
        "source": "local",
        "installPath": "/Users/sunyang/.openclaw/extensions/xiaohongshu-auto-publish",
        "version": "1.0.0"
      }
    }
  }
}
```

---

## 开发信息

- **技能类型**: Skill
- **版本**: 1.0.0
- **作者**: xiaohongshu-skill
- **许可证**: MIT

---

## 更新日志

### v1.0.0 (2026-02-01)
- ✅ 初始版本发布
  - 支持发布图文/视频
  - 支持搜索内容
  - 支持获取笔记详情
  - 支持发表评论和回复
  - 支持点赞和收藏
  - 支持获取用户主页
  - 支持登录状态检查
