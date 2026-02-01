// 小红书自动发稿 OpenClaw Skill
// 通过 HTTP API 适配器调用 xiaohongshu-mcp

const API_BASE = process.env.XIAOHONGSHU_API_URL || 'http://localhost:3000/api';

/**
 * 调用 API
 */
async function callApi(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`[API] ${method} ${url}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'API 调用失败');
    }

    return data.data;
  } catch (error) {
    console.error(`[API] 错误:`, error.message);
    throw error;
  }
}

// ========== OpenClaw Skill 入口 ==========

export default {
  /**
   * Skill 加载时的初始化
   */
  async onLoad() {
    console.log('[OpenClaw Skill] 小红书 Skill 正在加载...');
    console.log(`[OpenClaw Skill] API 地址: ${API_BASE}`);

    // 注意：不要在 onLoad 中进行同步的网络请求，会阻塞 Skill 加载
    // 健康检查将在第一次调用工具时自动进行

    console.log('[OpenClaw Skill] ✅ Skill 加载完成');
    console.log('[OpenClaw Skill] 首次调用工具时会自动检查 API 连接');
  },

  /**
   * 返回工具定义
   */
  async tools() {
    return [
      {
        name: 'check_login',
        description: '检查小红书登录状态',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_qrcode',
        description: '获取小红书登录二维码',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'publish',
        description: '发布图文内容到小红书',
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
              description: '图片路径列表（本地绝对路径），至少1张',
              items: { type: 'string' }
            },
            tags: {
              type: 'array',
              title: '话题标签',
              description: '话题标签列表',
              items: { type: 'string' }
            }
          },
          required: ['title', 'content', 'images']
        }
      },
      {
        name: 'publish_video',
        description: '发布视频内容到小红书',
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
            }
          },
          required: ['title', 'content', 'video']
        }
      },
      {
        name: 'search',
        description: '搜索小红书内容',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              title: '关键词',
              description: '搜索关键词'
            },
            sortBy: {
              type: 'string',
              title: '排序方式',
              description: '综合|最新|最多点赞|最多评论|最多收藏'
            },
            noteType: {
              type: 'string',
              title: '笔记类型',
              description: '不限|视频|图文'
            }
          },
          required: ['keyword']
        }
      },
      {
        name: 'list_feeds',
        description: '获取小红书首页推荐列表',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_feed_detail',
        description: '获取小红书笔记详情',
        inputSchema: {
          type: 'object',
          properties: {
            feedId: {
              type: 'string',
              title: '笔记ID',
              description: '小红书笔记ID'
            },
            xsecToken: {
              type: 'string',
              title: '访问令牌',
              description: '访问令牌'
            }
          },
          required: ['feedId', 'xsecToken']
        }
      },
      {
        name: 'post_comment',
        description: '发表评论到小红书笔记',
        inputSchema: {
          type: 'object',
          properties: {
            feedId: {
              type: 'string',
              title: '笔记ID',
              description: '小红书笔记ID'
            },
            xsecToken: {
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
          required: ['feedId', 'xsecToken', 'content']
        }
      },
      {
        name: 'like_feed',
        description: '点赞小红书笔记',
        inputSchema: {
          type: 'object',
          properties: {
            feedId: {
              type: 'string',
              title: '笔记ID',
              description: '小红书笔记ID'
            },
            xsecToken: {
              type: 'string',
              title: '访问令牌',
              description: '访问令牌'
            }
          },
          required: ['feedId', 'xsecToken']
        }
      },
      {
        name: 'favorite_feed',
        description: '收藏小红书笔记',
        inputSchema: {
          type: 'object',
          properties: {
            feedId: {
              type: 'string',
              title: '笔记ID',
              description: '小红书笔记ID'
            },
            xsecToken: {
              type: 'string',
              title: '访问令牌',
              description: '访问令牌'
            }
          },
          required: ['feedId', 'xsecToken']
        }
      },
      {
        name: 'get_user_profile',
        description: '获取小红书用户主页',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              title: '用户ID',
              description: '小红书用户ID'
            },
            xsecToken: {
              type: 'string',
              title: '访问令牌',
              description: '访问令牌'
            }
          },
          required: ['userId', 'xsecToken']
        }
      }
    ];
  },

  /**
   * 调用工具
   */
  async call(toolName, params = {}) {
    console.log(`[OpenClaw Skill] 调用工具: ${toolName}`);

    try {
      let result;

      switch (toolName) {
        case 'check_login':
          result = await callApi('/check-login');
          break;

        case 'get_qrcode':
          result = await callApi('/qrcode');
          break;

        case 'publish':
          result = await callApi('/publish', 'POST', params);
          break;

        case 'publish_video':
          result = await callApi('/publish-video', 'POST', params);
          break;

        case 'search':
          result = await callApi(`/search?keyword=${encodeURIComponent(params.keyword)}${params.sortBy ? `&sortBy=${params.sortBy}` : ''}${params.noteType ? `&noteType=${params.noteType}` : ''}`);
          break;

        case 'list_feeds':
          result = await callApi('/feeds');
          break;

        case 'get_feed_detail':
          result = await callApi(`/feed/${params.feedId}?xsecToken=${params.xsecToken}`);
          break;

        case 'post_comment':
          result = await callApi(`/feed/${params.feedId}/comment`, 'POST', {
            xsecToken: params.xsecToken,
            content: params.content
          });
          break;

        case 'like_feed':
          result = await callApi(`/feed/${params.feedId}/like`, 'POST', {
            xsecToken: params.xsecToken
          });
          break;

        case 'favorite_feed':
          result = await callApi(`/feed/${params.feedId}/favorite`, 'POST', {
            xsecToken: params.xsecToken
          });
          break;

        case 'get_user_profile':
          result = await callApi(`/user/${params.userId}?xsecToken=${params.xsecToken}`);
          break;

        default:
          throw new Error(`未知工具: ${toolName}`);
      }

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
  }
};
