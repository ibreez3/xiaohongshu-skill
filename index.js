// 小红书自动发稿 OpenClaw Skill
// 通过 HTTP JSON-RPC 2.0 调用本地运行的 xiaohongshu-mcp 服务

const MCP_SERVER = process.env.XIAOHONGSHU_MCP_URL || 'http://127.0.0.1:18060/mcp';
const JSON_RPC_VERSION = '2.0';

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

// HTTP JSON-RPC 调用
async function callMcpServer(toolName, params = {}) {
  const request = {
    jsonrpc: JSON_RPC_VERSION,
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: params
    }
  };

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

    // 解析返回的内容
    if (data.result && data.result.content && data.result.content[0]) {
      const text = data.result.content[0].text;
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    }

    return data.result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`MCP 服务无响应，请确认服务是否运行在 ${MCP_SERVER}`);
    }
    throw new Error(`MCP 服务调用失败: ${error.message}`);
  }
}

// OpenClaw Skill 入口
export default {
  async tools() {
    return Object.entries(TOOL_DEFINITIONS).map(([toolName, definition]) => ({
      name: toolName,
      ...definition
    }));
  },

  async call(toolName, params = {}) {
    try {
      const result = await callMcpServer(toolName, params);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
