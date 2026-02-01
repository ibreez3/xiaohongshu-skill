# Xiaohongshu Auto-Publish Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/)

> **🎯 现在支持 OpenClaw！** 使用 HTTP API 适配器在 OpenClaw 中实现小红书自动化。详见 [OpenClaw 快速开始](QUICKSTART_OPENCRAW.md)。

A powerful plugin for automating content publishing to Xiaohongshu (Little Red Book) via the [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp) server.

## Features

- Publish image/text content to Xiaohongshu
- Publish video content to Xiaohongshu
- Check login status and get QR code
- Search for content on Xiaohongshu
- Get detailed information about feeds
- Post comments to feeds
- List feeds from homepage
- Like and favorite feeds
- Get user profile information

## Requirements

### MCP Server
- [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp) server running locally or remotely
- Node.js 18+ (for running the publish scripts)

### MCP Client (Choose One)

#### ✅ Compatible Clients
- **[Cursor](https://cursor.sh/)** (Recommended) - Full MCP support with SSE transport
- **[Claude Code](https://claude.ai/code)** - Official CLI with MCP support
- **[Cline](https://cline.dev/)** - AI assistant with MCP integration
- **[VSCode](https://code.visualstudio.com/)** - With MCP extension

#### ❌ Incompatible
- **OpenClaw** - Does not support SSE MCP transport (see [OPENCRAW_MCP_ISSUE.md](OPENCRAW_MCP_ISSUE.md) for details)

### Why OpenClaw Doesn't Work

xiaohongshu-mcp uses **SSE (Server-Sent Events)** for MCP transport, which requires:
1. Persistent HTTP connections
2. Server-to-client event streaming
3. Session state management

OpenClaw's Skill system uses simple function calls and cannot maintain SSE connections.

**Solution**: Use Cursor, Claude Code, or other MCP-compatible clients instead.

## Quick Start

### For OpenClaw Users (NEW!)

> **✨ 现在支持 OpenClaw！** 通过 HTTP API 适配器实现小红书自动化

**三步快速开始：**

1. **启动 xiaohongshu-mcp**:
   ```bash
   cd /path/to/xiaohongshu-mcp && npm start
   ```

2. **安装适配器**:
   ```bash
   ./install-adapter.sh
   ```

3. **重启 OpenClaw 并开始使用**:
   ```
   /check-login      # 检查登录状态
   /publish "标题" "内容" ["/path/img.jpg"] ["标签"]
   ```

📖 **完整指南**: [OpenClaw 使用指南](OPENCRAW_GUIDE.md) | [快速开始](QUICKSTART_OPENCRAW.md)

---

### For Standard MCP Clients

### Using Cursor (Recommended)

1. **Install Cursor**: https://cursor.sh/

2. **Create MCP config** (`.cursor/mcp.json`):
   ```json
   {
     "mcpServers": {
       "xiaohongshu-mcp": {
         "url": "http://localhost:18060/mcp",
         "description": "小红书 MCP 服务"
       }
     }
   }
   ```

3. **Start xiaohongshu-mcp**:
   ```bash
   cd /path/to/xiaohongshu-mcp
   npm start
   ```

4. **Restart Cursor** and start publishing!

### Using Claude Code CLI

```bash
# Add MCP server
claude mcp add --transport http xiaohongshu-mcp http://localhost:18060/mcp

# Verify connection
claude mcp list
```

### Using MCP Inspector (for testing)

```bash
npx @modelcontextprotocol/inspector
# Open browser and connect to: http://localhost:18060/mcp
```

---

## Prerequisites

Before using this skill, you need to deploy and run the [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp) server:

1. Clone the xiaohongshu-mcp repository:
   ```bash
   git clone https://github.com/xpzouying/xiaohongshu-mcp.git
   cd xiaohongshu-mcp
   ```

2. Install dependencies and start the server:
   ```bash
   npm install
   npm start
   ```

3. By default, the MCP server will run on `http://127.0.0.1:18060/mcp`

This Skill depends on the xiaohongshu-mcp server for all operations. Special thanks to [xpzouying](https://github.com/xpzouying) for developing the xiaohongshu-mcp project, which made this Skill possible.

## Installation

### For OpenClaw

#### Quick Install (Recommended)

Run the installation script:

```bash
./install.sh
```

The script will:
- Check if OpenClaw is installed
- Verify xiaohongshu-mcp server status
- Copy files to OpenClaw skills directory
- Set proper permissions
- Verify the installation

Then:

1. Start xiaohongshu-mcp server (if not running):
   ```bash
   cd /path/to/xiaohongshu-mcp
   npm start
   ```

2. Restart OpenClaw:
   ```bash
   openclaw restart
   # or completely quit and reopen OpenClaw
   ```

3. Test the installation:
   ```bash
   node test-mcp-client.js
   ```

#### Manual Install

```bash
# Create installation directory
mkdir -p ~/.openclaw/skills/xiaohongshu-auto-publish

# Copy files
cp index.js ~/.openclaw/skills/xiaohongshu-auto-publish/
cp openclaw.plugin.json ~/.openclaw/skills/xiaohongshu-auto-publish/
cp -r commands ~/.openclaw/skills/xiaohongshu-auto-publish/
cp -r skills ~/.openclaw/skills/xiaohongshu-auto-publish/

# Set permissions
chmod +x ~/.openclaw/skills/xiaohongshu-auto-publish/index.js
```

For detailed installation instructions, see [INSTALL.md](INSTALL.md).

### Uninstall

```bash
./uninstall.sh
```

### For Claude Code

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/xiaohongshu-skill.git
   cd xiaohongshu-skill
   ```

2. Ensure xiaohongshu-mcp server is running (see Prerequisites)

3. Install this plugin in your Claude Code plugins directory

4. Restart Claude Code

## Usage

### Check Login Status

```
/check-login
```

This will:
- Check if you're logged in to Xiaohongshu
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

## Architecture

This Skill implements a **complete MCP (Model Context Protocol) client** that:

1. **Session Management**: Initializes and maintains MCP session with the server
2. **Tool Discovery**: Automatically fetches available tools from the MCP server
3. **Protocol Compliance**: Follows the MCP 2024-11-05 specification
4. **Error Handling**: Gracefully handles connection failures and retries

### MCP Protocol Flow

```
OpenClaw Skill          MCP Client              xiaohongshu-mcp
     │                      │                        │
     │  tools()             │                        │
     ├─────────────────────>│                        │
     │                      │  initialize            │
     │                      ├───────────────────────>│
     │                      │  ← session info        │
     │                      │<───────────────────────┤
     │                      │                        │
     │                      │  tools/list            │
     │                      ├───────────────────────>│
     │                      │  ← tool definitions    │
     │                      │<───────────────────────┤
     │  ← tool definitions  │                        │
     │<─────────────────────┤                        │
     │                      │                        │
     │  call(tool, params)  │                        │
     ├─────────────────────>│                        │
     │                      │  tools/call            │
     │                      ├───────────────────────>│
     │                      │  ← result              │
     │  ← result            │<───────────────────────┤
     │<─────────────────────┤                        │
```

### Testing the MCP Client

Run the test script to verify the MCP connection:

```bash
node test-mcp-client.js
```

This will:
1. Initialize an MCP session
2. Ping the server
3. Fetch available tools
4. Call a test tool (check_login_status)

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

This project would not have been possible without the excellent work of [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp) by [xpzouying](https://github.com/xpzouying). Thank you for providing the MCP server that powers this Skill!

Special thanks to the entire open source community for their contributions and support.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This project is for educational purposes only. Please comply with Xiaohongshu's terms of service and use this tool responsibly.

## Star History

If you find this project helpful, please consider giving it a star! ⭐

---

Made with ❤️ for the Claude Code community
