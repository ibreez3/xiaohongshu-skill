// 小红书自动发稿 OpenClaw Skill
// 通过完整的 MCP 客户端协议调用本地运行的 xiaohongshu-mcp 服务

const MCP_SERVER = process.env.XIAOHONGSHU_MCP_URL || 'http://127.0.0.1:18060/mcp';
const JSON_RPC_VERSION = '2.0';

// MCP 客户端状态
let mcpSession = {
  initialized: false,
  sessionId: null,
  capabilities: null,
  tools: [],
  lastPing: 0
};

// 请求 ID 计数器
let requestId = 0;

// MCP 工具名称映射
const TOOLS = {
  // 发布相关
  publishContent: 'publish_content',
  publishVideo: 'publish_with_video',

  // 登录相关
  checkLogin: 'check_login_status',
  getLoginQrcode: 'get_login_qrcode',

  // 内容获取
  listFeeds: 'list_feeds',
  searchFeeds: 'search_feeds',
  getFeedDetail: 'get_feed_detail',

  // 互动相关
  postComment: 'post_comment_to_feed',
  replyComment: 'reply_comment_in_feed',
  likeFeed: 'like_feed',
  favoriteFeed: 'favorite_feed',

  // 用户相关
  userProfile: 'user_profile'
};

// 工具定义
const TOOL_DEFINITIONS = {
  [TOOLS.publishContent]: {
    name: '发布小红书图文',
    description: '发布图文内容到小红书，包括标题、正文、图片列表和话题标签。标题不超过20字，正文不超过1000字。',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          title: '标题',
          description: '笔记标题，不超过20个字'
        },
        content: {
          type: 'string',
          title: '正文',
          description: '笔记正文内容'
        },
        images: {
          type: 'array',
          title: '图片列表',
          description: '图片路径列表（本地绝对路径或HTTP链接），至少1张',
          items: { type: 'string' }
        },
        tags: {
          type: 'array',
          title: '话题标签',
          description: '话题标签列表，如：["美食", "生活"]',
          items: { type: 'string' }
        },
        schedule_at: {
          type: 'string',
          title: '定时发布',
          description: '定时发布时间（ISO8601格式），如：2024-01-20T10:30:00+08:00'
        }
      },
      required: ['title', 'content', 'images']
    }
  },

  [TOOLS.publishVideo]: {
    name: '发布小红书视频',
    description: '发布视频内容到小红书，包括标题、正文、视频文件路径和话题标签。标题不超过20字。',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          title: '标题',
          description: '内容标题，不超过20个字'
        },
        content: {
          type: 'string',
          title: '正文',
          description: '正文内容'
        },
        video: {
          type: 'string',
          title: '视频路径',
          description: '本地视频文件绝对路径'
        },
        tags: {
          type: 'array',
          title: '话题标签',
          description: '话题标签列表',
          items: { type: 'string' }
        },
        schedule_at: {
          type: 'string',
          title: '定时发布',
          description: '定时发布时间（ISO8601格式）'
        }
      },
      required: ['title', 'content', 'video']
    }
  },

  [TOOLS.checkLogin]: {
    name: '检查小红书登录状态',
    description: '检查当前小红书登录状态，返回是否已登录和用户信息。',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },

  [TOOLS.getLoginQrcode]: {
    name: '获取小红书登录二维码',
    description: '获取小红书登录二维码（Base64格式），用于扫码登录。',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },

  [TOOLS.listFeeds]: {
    name: '获取小红书首页列表',
    description: '获取小红书首页的 Feeds 列表。',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },

  [TOOLS.searchFeeds]: {
    name: '搜索小红书内容',
    description: '根据关键词搜索小红书内容，支持多种筛选条件。',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          title: '关键词',
          description: '搜索关键词'
        },
        sort_by: {
          type: 'string',
          title: '排序方式',
          description: '综合|最新|最多点赞|最多评论|最多收藏',
          enum: ['综合', '最新', '最多点赞', '最多评论', '最多收藏']
        },
        note_type: {
          type: 'string',
          title: '笔记类型',
          description: '不限|视频|图文',
          enum: ['不限', '视频', '图文']
        },
        publish_time: {
          type: 'string',
          title: '发布时间',
          description: '不限|一天内|一周内|半年内',
          enum: ['不限', '一天内', '一周内', '半年内']
        }
      },
      required: ['keyword']
    }
  },

  [TOOLS.getFeedDetail]: {
    name: '获取小红书笔记详情',
    description: '获取指定小红书笔记的详细信息，包括内容、图片、作者、互动数据和评论列表。',
    inputSchema: {
      type: 'object',
      properties: {
        feed_id: {
          type: 'string',
          title: '笔记ID',
          description: '小红书笔记ID'
        },
        xsec_token: {
          type: 'string',
          title: '访问令牌',
          description: '访问令牌'
        },
        load_all_comments: {
          type: 'boolean',
          title: '加载全部评论',
          description: '是否加载全部评论，默认只返回前10条'
        },
        limit: {
          type: 'number',
          title: '评论数量限制',
          description: '限制加载的评论数量，默认20'
        }
      },
      required: ['feed_id', 'xsec_token']
    }
  },

  [TOOLS.postComment]: {
    name: '发表评论到小红书',
    description: '向指定的小红书笔记发表评论。',
    inputSchema: {
      type: 'object',
      properties: {
        feed_id: {
          type: 'string',
          title: '笔记ID',
          description: '小红书笔记ID'
        },
        xsec_token: {
          type: 'string',
          title: '访问令牌',
          description: '访问令牌'
        },
        content: {
          type: 'string',
          title: '评论内容',
          description: '要发表的评论内容'
        }
      },
      required: ['feed_id', 'xsec_token', 'content']
    }
  },

  [TOOLS.replyComment]: {
    name: '回复小红书评论',
    description: '回复小红书笔记下的指定评论。',
    inputSchema: {
      type: 'object',
      properties: {
        feed_id: {
          type: 'string',
          title: '笔记ID',
          description: '小红书笔记ID'
        },
        xsec_token: {
          type: 'string',
          title: '访问令牌',
          description: '访问令牌'
        },
        comment_id: {
          type: 'string',
          title: '评论ID',
          description: '目标评论ID'
        },
        user_id: {
          type: 'string',
          title: '用户ID',
          description: '目标评论用户ID'
        },
        content: {
          type: 'string',
          title: '回复内容',
          description: '回复内容'
        }
      },
      required: ['feed_id', 'xsec_token', 'content']
    }
  },

  [TOOLS.likeFeed]: {
    name: '点赞/取消点赞小红书笔记',
    description: '为指定的小红书笔记点赞或取消点赞。',
    inputSchema: {
      type: 'object',
      properties: {
        feed_id: {
          type: 'string',
          title: '笔记ID',
          description: '小红书笔记ID'
        },
        xsec_token: {
          type: 'string',
          title: '访问令牌',
          description: '访问令牌'
        },
        unlike: {
          type: 'boolean',
          title: '取消点赞',
          description: 'true为取消点赞，false或未设置为点赞'
        }
      },
      required: ['feed_id', 'xsec_token']
    }
  },

  [TOOLS.favoriteFeed]: {
    name: '收藏/取消收藏小红书笔记',
    description: '收藏或取消收藏指定的小红书笔记。',
    inputSchema: {
      type: 'object',
      properties: {
        feed_id: {
          type: 'string',
          title: '笔记ID',
          description: '小红书笔记ID'
        },
        xsec_token: {
          type: 'string',
          title: '访问令牌',
          description: '访问令牌'
        },
        unfavorite: {
          type: 'boolean',
          title: '取消收藏',
          description: 'true为取消收藏，false或未设置为收藏'
        }
      },
      required: ['feed_id', 'xsec_token']
    }
  },

  [TOOLS.userProfile]: {
    name: '获取小红书用户主页',
    description: '获取指定小红书用户的主页信息，包括基本信息、关注数、粉丝数、获赞数及其笔记内容。',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          title: '用户ID',
          description: '小红书用户ID'
        },
        xsec_token: {
          type: 'string',
          title: '访问令牌',
          description: '访问令牌'
        }
      },
      required: ['user_id', 'xsec_token']
    }
  }
};

// ========== MCP 客户端实现 ==========

/**
 * 发送 JSON-RPC 请求到 MCP 服务器
 */
async function sendMcpRequest(method, params = {}) {
  const request = {
    jsonrpc: JSON_RPC_VERSION,
    id: ++requestId,
    method,
    params
  };

  console.log(`[MCP Client] 发送请求: ${method}`, JSON.stringify(params).slice(0, 200));

  try {
    const response = await fetch(MCP_SERVER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`MCP Error: ${data.error.message} (code: ${data.error.code})`);
    }

    console.log(`[MCP Client] 响应成功: ${method}`);
    return data.result;
  } catch (error) {
    console.error(`[MCP Client] 请求失败: ${method}`, error.message);
    throw error;
  }
}

/**
 * 发送 MCP 通知（无响应的请求）
 */
async function sendMcpNotification(method, params = {}) {
  const request = {
    jsonrpc: JSON_RPC_VERSION,
    // 注意：通知没有 id 字段
    method,
    params
  };

  console.log(`[MCP Client] 发送通知: ${method}`);

  try {
    const response = await fetch(MCP_SERVER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 通知不期待响应
    console.log(`[MCP Client] 通知发送成功: ${method}`);
    return true;
  } catch (error) {
    console.error(`[MCP Client] 通知发送失败: ${method}`, error.message);
    throw error;
  }
}

/**
 * 初始化 MCP 会话
 */
async function initializeMcpSession() {
  if (mcpSession.initialized) {
    console.log('[MCP Client] 会话已初始化，跳过');
    return true;
  }

  console.log('[MCP Client] 正在初始化 MCP 会话...');

  try {
    // 步骤 1: initialize 请求
    const initResult = await sendMcpRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'xiaohongshu-openclaw-skill',
        version: '1.0.0'
      }
    });

    mcpSession.sessionId = initResult?.sessionId || `session_${Date.now()}`;
    mcpSession.capabilities = initResult?.capabilities || {};

    console.log('[MCP Client] initialize 响应成功');
    console.log('[MCP Client] 会话 ID:', mcpSession.sessionId);

    // 步骤 2: 发送 initialized 通知（必需！）
    await sendMcpNotification('initialized', {});

    // 现在会话才完全初始化
    mcpSession.initialized = true;

    console.log('[MCP Client] ✅ MCP 会话初始化成功');
    console.log('[MCP Client] 服务器能力:', JSON.stringify(mcpSession.capabilities));

    return true;
  } catch (error) {
    console.error('[MCP Client] ❌ MCP 会话初始化失败:', error.message);
    mcpSession.initialized = false;
    throw new Error(`MCP 会话初始化失败: ${error.message}`);
  }
}

/**
 * 获取 MCP 服务器提供的工具列表
 */
async function getMcpTools() {
  console.log('[MCP Client] 正在获取工具列表...');

  try {
    const result = await sendMcpRequest('tools/list', {});
    mcpSession.tools = result?.tools || [];

    console.log(`[MCP Client] ✅ 成功获取 ${mcpSession.tools.length} 个工具:`);
    mcpSession.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description?.slice(0, 60)}...`);
    });

    return mcpSession.tools;
  } catch (error) {
    console.error('[MCP Client] ❌ 获取工具列表失败:', error.message);
    throw error;
  }
}

/**
 * 调用 MCP 工具
 */
async function callMcpTool(toolName, args = {}) {
  console.log(`[MCP Client] 正在调用工具: ${toolName}`);

  // 确保会话已初始化
  if (!mcpSession.initialized) {
    console.log('[MCP Client] 会话未初始化，正在初始化...');
    await initializeMcpSession();
    await getMcpTools();
  }

  try {
    const result = await sendMcpRequest('tools/call', {
      name: toolName,
      arguments: args
    });

    // 解析返回的内容
    if (result?.content && result.content[0]) {
      const content = result.content[0];
      if (content.type === 'text') {
        try {
          const parsed = JSON.parse(content.text);
          console.log(`[MCP Client] ✅ 工具调用成功: ${toolName}`);
          return parsed;
        } catch {
          // 无法解析为 JSON，返回原始文本
          console.log(`[MCP Client] ✅ 工具调用成功 (返回文本): ${toolName}`);
          return { raw: content.text };
        }
      } else if (content.type === 'image') {
        console.log(`[MCP Client] ✅ 工具调用成功 (返回图像): ${toolName}`);
        return { image: content.data };
      }
    }

    console.log(`[MCP Client] ✅ 工具调用成功: ${toolName}`);
    return result;
  } catch (error) {
    console.error(`[MCP Client] ❌ 工具调用失败: ${toolName}`, error.message);
    throw error;
  }
}

/**
 * Ping MCP 服务器，保持连接活跃
 */
async function pingMcpServer() {
  try {
    await sendMcpRequest('ping', {});
    mcpSession.lastPing = Date.now();
    console.log('[MCP Client] ✅ Ping 成功');
    return true;
  } catch (error) {
    console.error('[MCP Client] ❌ Ping 失败:', error.message);
    // Ping 失败时标记会话为未初始化，下次会重新初始化
    mcpSession.initialized = false;
    throw error;
  }
}

// ========== OpenClaw Skill 接口 ==========

/**
 * HTTP JSON-RPC 调用 (兼容旧接口，内部使用新的 MCP 客户端)
 */
async function callMcpServer(toolName, params = {}) {
  return await callMcpTool(toolName, params);
}

// OpenClaw Skill 入口
export default {
  /**
   * Skill 加载时的初始化
   */
  async onLoad() {
    console.log('[OpenClaw Skill] 小红书 Skill 正在加载...');
    console.log(`[OpenClaw Skill] MCP 服务器地址: ${MCP_SERVER}`);

    try {
      // 尝试初始化 MCP 会话
      await initializeMcpSession();
      await getMcpTools();
      console.log('[OpenClaw Skill] ✅ 小红书 Skill 加载成功');
    } catch (error) {
      console.error('[OpenClaw Skill] ⚠️ 初始化失败，将在首次调用时重试:', error.message);
      // 不抛出错误，允许 Skill 加载，在首次调用时重试
    }
  },

  /**
   * 返回工具定义
   */
  async tools() {
    // 如果已连接到 MCP 服务器，优先使用服务器的工具定义
    if (mcpSession.initialized && mcpSession.tools.length > 0) {
      console.log(`[OpenClaw Skill] 返回 MCP 服务器的 ${mcpSession.tools.length} 个工具`);
      return mcpSession.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }));
    }

    // 否则返回本地定义的工具
    console.log('[OpenClaw Skill] 返回本地定义的工具');
    return Object.entries(TOOL_DEFINITIONS).map(([toolName, definition]) => ({
      name: toolName,
      ...definition
    }));
  },

  /**
   * 调用工具
   */
  async call(toolName, params = {}) {
    console.log(`[OpenClaw Skill] 调用工具: ${toolName}`);
    console.log(`[OpenClaw Skill] 参数:`, JSON.stringify(params).slice(0, 200));

    try {
      const result = await callMcpServer(toolName, params);
      console.log(`[OpenClaw Skill] ✅ 工具调用成功: ${toolName}`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`[OpenClaw Skill] ❌ 工具调用失败: ${toolName}`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Skill 卸载时的清理
   */
  async onUnload() {
    console.log('[OpenClaw Skill] 小红书 Skill 正在卸载...');
    mcpSession.initialized = false;
    mcpSession.tools = [];
    console.log('[OpenClaw Skill] ✅ 清理完成');
  }
};
