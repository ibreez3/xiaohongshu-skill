# Xiaohongshu Auto-Publish Skill

A Claude Code Skill plugin for publishing content to Xiaohongshu (Little Red Book) via the xiaohongshu-mcp server.

## Features

- Publish image/text content to Xiaohongshu
- Publish video content to Xiaohongshu
- Check login status
- Get login QR code
- Search for content on Xiaohongshu
- Get detailed information about a feed
- Post comments to feeds
- List feeds from homepage

## Requirements

- xiaohongshu-mcp server running on `http://127.0.0.1:18060/mcp`
- Node.js (for running the publish scripts)

## Installation

1. Clone or copy this plugin to your Claude plugins directory
2. Ensure xiaohongshu-mcp server is running
3. Restart Claude Code

## Usage

### Check Login Status

```
/check-login
```

This will:
- Check if you're logged in
- Display QR code if not logged in
- Save QR code to `/tmp/xiaohongshu_qrcode.png`

### Publish Image/Text Content

```
/publish-image-text "标题" "正文内容" ["图片路径1", "图片路径2"] ["标签1", "标签2"]
```

Example:
```
/publish-image-text "今天吃了好吃的" "推荐一家超好吃的餐厅!" ["/path/to/image1.jpg", "/path/to/image2.jpg"] ["美食", "生活"]
```

### Publish Video Content

```
/publish-video "标题" "正文内容" "/path/to/video.mp4" ["标签1", "标签2"]
```

Example:
```
/publish-video "旅行vlog" "分享今天的旅行经历" "/path/to/video.mp4" ["旅行", "生活"]
```

### Scheduled Publishing

To schedule a post for later (1 hour to 14 days in the future), add the schedule time:

```
/publish-image-text "标题" "内容" ["/path/to/image.jpg"] ["标签"] "2024-01-20T10:30:00+08:00"
```

### List Homepage Feeds

```
/list-feeds
```

This will return the list of feeds from your Xiaohongshu homepage.

### Search Feeds

```
/search-feeds "关键词" {"sort_by": "最多点赞", "note_type": "图文"}
```

Available filters:
- **sort_by**: 综合|最新|最多点赞|最多评论|最多收藏
- **note_type**: 不限|视频|图文
- **publish_time**: 不限|一天内|一周内|半年内
- **search_scope**: 不限|已看过|未看过|已关注
- **location**: 不限|同城|附近

### Get Feed Detail

```
/get-feed-detail "feed_id" "xsec_token"
```

To get feed details with all comments:

```
/get-feed-detail "feed_id" "xsec_token" true 50
```

### Post Comment

```
/post-comment "feed_id" "xsec_token" "评论内容"
```

## Configuration

The MCP server URL defaults to `http://127.0.0.1:18060/mcp`. To change it, set the environment variable:

```bash
export XIAOHONGSHU_MCP_URL="http://your-server:port/mcp"
```

## API Endpoints Used

- `check_login_status` - Check if logged in
- `get_login_qrcode` - Get login QR code
- `publish_content` - Publish image/text content
- `publish_with_video` - Publish video content
- `list_feeds` - List feeds from homepage
- `search_feeds` - Search for content
- `get_feed_detail` - Get feed details
- `post_comment_to_feed` - Post a comment
- `reply_comment_in_feed` - Reply to a comment
- `like_feed` - Like/unlike a feed
- `favorite_feed` - Favorite/unfavorite a feed
- `user_profile` - Get user profile

## Troubleshooting

### Not logged in error

Run `/check-login` first to scan the QR code and login.

### MCP server connection error

Ensure xiaohongshu-mcp server is running:

```bash
# Check if server is running
curl http://127.0.0.1:18060/mcp
```

### Image/Video not found

Ensure all image and video paths are absolute paths (start with `/`).

## License

MIT
