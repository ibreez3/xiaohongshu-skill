#!/usr/bin/env node
/**
 * OpenClaw HTTP API 适配器 (使用官方 MCP SDK)
 * 将 SSE MCP 转换为简单的 REST API
 *
 * 运行: node adapter-mcp.js
 * API: http://localhost:3000/api/...
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { HttpClient } from '@modelcontextprotocol/sdk/client/http.js';
import express from 'express';
import cors from 'cors';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const MCP_SERVER = process.env.XIAOHONGSHU_MCP_URL || 'http://127.0.0.1:18060/mcp';
const API_PORT = process.env.API_PORT || 3000;

// 日志函数
function log(level, ...args) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}]`, ...args);
}

// ========== MCP 客户端 ==========

class McpAdapter {
  constructor() {
    this.client = null;
    this.tools = [];
  }

  async connect() {
    try {
      log('INFO', '正在连接到 MCP 服务器:', MCP_SERVER);

      // 使用 HttpClient 连接到 MCP 服务器
      this.client = new Client({
        name: 'openclaw-adapter',
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      const transport = new HttpClient(MCP_SERVER);

      await this.client.connect(transport);

      log('INFO', '✅ MCP 连接成功');

      // 获取可用工具
      const toolsResult = await this.client.listTools();
      this.tools = toolsResult.tools || [];
      log('INFO', `获取到 ${this.tools.length} 个工具`);

      return true;
    } catch (error) {
      log('ERROR', 'MCP 连接失败:', error.message);
      throw error;
    }
  }

  async callTool(toolName, args) {
    try {
      log('INFO', `[MCP] 调用工具: ${toolName}`);

      const result = await this.client.callTool({
        name: toolName,
        arguments: args
      });

      // 解析返回的内容
      if (result.content && result.content[0]) {
        const content = result.content[0];
        if (content.type === 'text') {
          try {
            return JSON.parse(content.text);
          } catch {
            return { raw: content.text };
          }
        } else if (content.type === 'image') {
          return { image: content.data };
        }
      }

      return result;
    } catch (error) {
      log('ERROR', `[MCP] 工具调用失败: ${toolName}`, error.message);
      throw error;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      log('INFO', 'MCP 连接已关闭');
    }
  }
}

// ========== HTTP API 服务器 ==========

const app = express();
app.use(cors());
app.use(express.json());

const mcpAdapter = new McpAdapter();

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mcp: mcpAdapter.client ? 'connected' : 'disconnected',
    mcpServer: MCP_SERVER,
    tools: mcpAdapter.tools.length
  });
});

// 获取可用工具列表
app.get('/api/tools', (req, res) => {
  try {
    res.json({
      success: true,
      tools: mcpAdapter.tools.map(t => ({
        name: t.name,
        description: t.description
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 检查登录状态
app.get('/api/check-login', async (req, res) => {
  try {
    const result = await mcpAdapter.callTool('check_login_status', {});
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取登录二维码
app.get('/api/qrcode', async (req, res) => {
  try {
    const result = await mcpAdapter.callTool('get_login_qrcode', {});
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 发布图文内容
app.post('/api/publish', async (req, res) => {
  try {
    const { title, content, images, tags } = req.body;

    if (!title || !content || !images) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: title, content, images'
      });
    }

    const result = await mcpAdapter.callTool('publish_content', {
      title,
      content,
      images,
      tags: tags || []
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 发布视频内容
app.post('/api/publish-video', async (req, res) => {
  try {
    const { title, content, video, tags } = req.body;

    if (!title || !content || !video) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: title, content, video'
      });
    }

    const result = await mcpAdapter.callTool('publish_with_video', {
      title,
      content,
      video,
      tags: tags || []
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 搜索内容
app.get('/api/search', async (req, res) => {
  try {
    const { keyword, sortBy, noteType, publishTime } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: keyword'
      });
    }

    const filters = {};
    if (sortBy) filters.sort_by = sortBy;
    if (noteType) filters.note_type = noteType;
    if (publishTime) filters.publish_time = publishTime;

    const result = await mcpAdapter.callTool('search_feeds', {
      keyword,
      filters
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取首页列表
app.get('/api/feeds', async (req, res) => {
  try {
    const result = await mcpAdapter.callTool('list_feeds', {});
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取笔记详情
app.get('/api/feed/:feedId', async (req, res) => {
  try {
    const { feedId } = req.params;
    const { xsecToken } = req.query;

    if (!xsecToken) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: xsecToken'
      });
    }

    const result = await mcpAdapter.callTool('get_feed_detail', {
      feed_id: feedId,
      xsec_token: xsecToken
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 发表评论
app.post('/api/feed/:feedId/comment', async (req, res) => {
  try {
    const { feedId } = req.params;
    const { xsecToken, content } = req.body;

    if (!xsecToken || !content) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: xsecToken, content'
      });
    }

    const result = await mcpAdapter.callTool('post_comment_to_feed', {
      feed_id: feedId,
      xsec_token: xsecToken,
      content
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 点赞
app.post('/api/feed/:feedId/like', async (req, res) => {
  try {
    const { feedId } = req.params;
    const { xsecToken } = req.body;

    if (!xsecToken) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: xsecToken'
      });
    }

    const result = await mcpAdapter.callTool('like_feed', {
      feed_id: feedId,
      xsec_token: xsecToken
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 收藏
app.post('/api/feed/:feedId/favorite', async (req, res) => {
  try {
    const { feedId } = req.params;
    const { xsecToken } = req.body;

    if (!xsecToken) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: xsecToken'
      });
    }

    const result = await mcpAdapter.callTool('favorite_feed', {
      feed_id: feedId,
      xsec_token: xsecToken
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取用户主页
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { xsecToken } = req.query;

    if (!xsecToken) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: xsecToken'
      });
    }

    const result = await mcpAdapter.callTool('user_profile', {
      user_id: userId,
      xsec_token: xsecToken
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  log('ERROR', '服务器错误:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// ========== 启动服务器 ==========

async function start() {
  try {
    // 连接到 MCP 服务器
    await mcpAdapter.connect();

    // 启动 API 服务器
    app.listen(API_PORT, () => {
      log('INFO', '='.repeat(60));
      log('INFO', 'OpenClaw HTTP API 适配器已启动 (使用官方 MCP SDK)');
      log('INFO', '='.repeat(60));
      log('INFO', `API 地址: http://localhost:${API_PORT}`);
      log('INFO', `MCP 服务器: ${MCP_SERVER}`);
      log('INFO', `可用工具: ${mcpAdapter.tools.length}`);
      log('INFO', '');
      log('INFO', '主要 API 端点:');
      log('INFO', `  GET  /api/health        - 健康检查`);
      log('INFO', `  GET  /api/check-login   - 检查登录状态`);
      log('INFO', `  GET  /api/qrcode        - 获取登录二维码`);
      log('INFO', `  POST /api/publish       - 发布图文内容`);
      log('INFO', `  POST /api/publish-video - 发布视频内容`);
      log('INFO', `  GET  /api/search        - 搜索内容`);
      log('INFO', `  GET  /api/feeds         - 获取首页列表`);
      log('INFO', '');
      log('INFO', 'OpenClaw 配置:');
      log('INFO', `  将 API_BASE 设置为: http://localhost:${API_PORT}/api`);
      log('INFO', '');
      log('INFO', '按 Ctrl+C 停止服务器');
      log('INFO', '='.repeat(60));
    });
  } catch (error) {
    log('ERROR', '启动失败:', error);
    log('ERROR', '');
    log('ERROR', '请确保:');
    log('ERROR', '  1. xiaohongshu-mcp 服务器正在运行');
    log('ERROR', `  2. MCP 服务器地址正确: ${MCP_SERVER}`);
    log('ERROR', '  3. 已安装依赖: npm install');
    process.exit(1);
  }
}

start();

// 优雅关闭
process.on('SIGINT', async () => {
  log('INFO', '\n正在关闭服务器...');
  await mcpAdapter.close();
  process.exit(0);
});
