#!/usr/bin/env node
/**
 * OpenClaw HTTP API 适配器
 * 将 SSE MCP 转换为简单的 REST API
 *
 * 运行: node adapter-server.js
 * API: http://localhost:3000/api/...
 */

const MCP_SERVER = process.env.XIAOHONGSHU_MCP_URL || 'http://127.0.0.1:18060/mcp';
const API_PORT = process.env.API_PORT || 3000;
const JSON_RPC_VERSION = '2.0';

let requestId = 0;
let mcpSession = {
  initialized: false,
  tools: []
};

// HTTP API 服务器
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// 日志函数
function log(level, ...args) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}]`, ...args);
}

/**
 * 发送 MCP 请求
 */
async function sendMcpRequest(method, params = {}) {
  const request = {
    jsonrpc: JSON_RPC_VERSION,
    id: ++requestId,
    method,
    params
  };

  log('INFO', `[MCP] ${method}`, JSON.stringify(params).slice(0, 100));

  try {
    const response = await fetch(MCP_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`MCP Error: ${data.error.message}`);
    }

    return data.result;
  } catch (error) {
    log('ERROR', `[MCP] ${method} 失败:`, error.message);
    throw error;
  }
}

/**
 * 初始化 MCP 会话
 */
async function initializeMcp() {
  if (mcpSession.initialized) {
    return true;
  }

  try {
    log('INFO', '正在初始化 MCP 会话...');

    const initResult = await sendMcpRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'openclaw-adapter',
        version: '1.0.0'
      }
    });

    log('INFO', 'MCP 初始化成功');
    log('INFO', '服务器信息:', initResult.serverInfo);

    // 获取工具列表
    const toolsResult = await sendMcpRequest('tools/list', {});
    mcpSession.tools = toolsResult.tools || [];
    log('INFO', `获取到 ${mcpSession.tools.length} 个工具`);

    mcpSession.initialized = true;
    return true;
  } catch (error) {
    log('ERROR', 'MCP 初始化失败:', error.message);
    throw error;
  }
}

/**
 * 调用 MCP 工具
 */
async function callMcpTool(toolName, args = {}) {
  if (!mcpSession.initialized) {
    await initializeMcp();
  }

  const result = await sendMcpRequest('tools/call', {
    name: toolName,
    arguments: args
  });

  // 解析返回的内容
  if (result?.content && result.content[0]) {
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
}

// ========== API 路由 ==========

/**
 * 健康检查
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mcp: mcpSession.initialized ? 'connected' : 'disconnected',
    mcpServer: MCP_SERVER,
    tools: mcpSession.tools.length
  });
});

/**
 * 获取可用工具列表
 */
app.get('/api/tools', (req, res) => {
  try {
    res.json({
      success: true,
      tools: mcpSession.tools.map(t => ({
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

/**
 * 检查登录状态
 */
app.get('/api/check-login', async (req, res) => {
  try {
    const result = await callMcpTool('check_login_status', {});
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取登录二维码
 */
app.get('/api/qrcode', async (req, res) => {
  try {
    const result = await callMcpTool('get_login_qrcode', {});
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 发布图文内容
 */
app.post('/api/publish', async (req, res) => {
  try {
    const { title, content, images, tags } = req.body;

    if (!title || !content || !images) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: title, content, images'
      });
    }

    const result = await callMcpTool('publish_content', {
      title,
      content,
      images,
      tags: tags || []
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 发布视频内容
 */
app.post('/api/publish-video', async (req, res) => {
  try {
    const { title, content, video, tags } = req.body;

    if (!title || !content || !video) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: title, content, video'
      });
    }

    const result = await callMcpTool('publish_with_video', {
      title,
      content,
      video,
      tags: tags || []
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 搜索内容
 */
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

    const result = await callMcpTool('search_feeds', {
      keyword,
      filters
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取首页列表
 */
app.get('/api/feeds', async (req, res) => {
  try {
    const result = await callMcpTool('list_feeds', {});
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取笔记详情
 */
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

    const result = await callMcpTool('get_feed_detail', {
      feed_id: feedId,
      xsec_token: xsecToken
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 发表评论
 */
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

    const result = await callMcpTool('post_comment_to_feed', {
      feed_id: feedId,
      xsec_token: xsecToken,
      content
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 点赞
 */
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

    const result = await callMcpTool('like_feed', {
      feed_id: feedId,
      xsec_token: xsecToken
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 收藏
 */
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

    const result = await callMcpTool('favorite_feed', {
      feed_id: feedId,
      xsec_token: xsecToken
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取用户主页
 */
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

    const result = await callMcpTool('user_profile', {
      user_id: userId,
      xsec_token: xsecToken
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========== 错误处理 ==========

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
    // 初始化 MCP 连接
    await initializeMcp();

    // 启动 API 服务器
    app.listen(API_PORT, () => {
      log('INFO', '='.repeat(60));
      log('INFO', 'OpenClaw HTTP API 适配器已启动');
      log('INFO', '='.repeat(60));
      log('INFO', `API 地址: http://localhost:${API_PORT}`);
      log('INFO', `MCP 服务器: ${MCP_SERVER}`);
      log('INFO', `可用工具: ${mcpSession.tools.length}`);
      log('INFO', '');
      log('INFO', 'API 端点:');
      log('INFO', `  GET  /api/health           - 健康检查`);
      log('INFO', `  GET  /api/tools            - 获取工具列表`);
      log('INFO', `  GET  /api/check-login      - 检查登录状态`);
      log('INFO', `  GET  /api/qrcode           - 获取登录二维码`);
      log('INFO', `  POST /api/publish          - 发布图文`);
      log('INFO', `  POST /api/publish-video    - 发布视频`);
      log('INFO', `  GET  /api/search           - 搜索内容`);
      log('INFO', `  GET  /api/feeds            - 获取首页列表`);
      log('INFO', `  GET  /api/feed/:feedId     - 获取笔记详情`);
      log('INFO', `  POST /api/feed/:feedId/comment - 发表评论`);
      log('INFO', `  POST /api/feed/:feedId/like     - 点赞`);
      log('INFO', `  POST /api/feed/:feedId/favorite - 收藏`);
      log('INFO', `  GET  /api/user/:userId     - 获取用户主页`);
      log('INFO', '');
      log('INFO', '按 Ctrl+C 停止服务器');
      log('INFO', '='.repeat(60));
    });
  } catch (error) {
    log('ERROR', '启动失败:', error);
    process.exit(1);
  }
}

start();

// 优雅关闭
process.on('SIGINT', () => {
  log('INFO', '\n正在关闭服务器...');
  process.exit(0);
});
