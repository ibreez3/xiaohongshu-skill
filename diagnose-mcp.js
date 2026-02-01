#!/usr/bin/env node
/**
 * OpenClaw MCP 诊断工具
 * 帮助诊断为什么 OpenClaw 无法调用登录接口
 */

const MCP_SERVER = process.env.XIAOHONGSHU_MCP_URL || 'http://127.0.0.1:18060/mcp';
const JSON_RPC_VERSION = '2.0';
let requestId = 0;

// 彩色日志
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, ...args) {
  console.log(`${color}`, ...args, colors.reset);
}

async function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: JSON_RPC_VERSION,
    id: ++requestId,
    method,
    params
  };

  log(colors.blue, `\n[${method}]`);
  log(colors.cyan, '请求:', JSON.stringify(params, null, 2).slice(0, 300));

  try {
    const response = await fetch(MCP_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const text = await response.text();

    if (!response.ok) {
      log(colors.red, `HTTP ${response.status}: ${response.statusText}`);
      log(colors.yellow, '响应:', text);
      return null;
    }

    const data = JSON.parse(text);

    if (data.error) {
      log(colors.red, `MCP Error:`, data.error.message);
      log(colors.yellow, '完整错误:', JSON.stringify(data.error));
      return null;
    }

    log(colors.green, '✅ 成功');
    log(colors.cyan, '响应:', JSON.stringify(data.result).slice(0, 200));
    return data.result;
  } catch (error) {
    log(colors.red, `错误:`, error.message);
    return null;
  }
}

async function diagnose() {
  log(colors.cyan, '='.repeat(60));
  log(colors.cyan, 'OpenClaw MCP 诊断工具');
  log(colors.cyan, `服务器: ${MCP_SERVER}`);
  log(colors.cyan, '='.repeat(60));

  // 测试 1: 检查服务器连接
  log(colors.yellow, '\n[测试 1] 检查 MCP 服务器连接');
  try {
    const response = await fetch(MCP_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'ping',
        params: {}
      })
    });

    if (response.ok) {
      log(colors.green, '✅ MCP 服务器正常运行');
    } else {
      log(colors.red, `❌ MCP 服务器返回: ${response.status}`);
      return;
    }
  } catch (error) {
    log(colors.red, `❌ 无法连接到 MCP 服务器: ${error.message}`);
    return;
  }

  // 测试 2: 初始化（不带 initialized 通知）
  log(colors.yellow, '\n[测试 2] MCP 初始化');
  const initResult = await sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'openclaw-diagnostic',
      version: '1.0.0'
    }
  });

  if (!initResult) {
    log(colors.red, '❌ 初始化失败，停止测试');
    return;
  }

  log(colors.green, '会话信息:', JSON.stringify(initResult, null, 2));

  // 测试 3: 获取工具列表（不发送 initialized 通知）
  log(colors.yellow, '\n[测试 3] 获取工具列表 (不发送 initialized)');
  const toolsResult = await sendRequest('tools/list', {});

  if (toolsResult && toolsResult.tools) {
    log(colors.green, `✅ 成功获取 ${toolsResult.tools.length} 个工具`);

    // 检查是否有登录相关工具
    const loginTools = toolsResult.tools.filter(t =>
      t.name.includes('login') ||
      t.name.includes('check')
    );

    if (loginTools.length > 0) {
      log(colors.cyan, '\n登录相关工具:');
      loginTools.forEach(tool => {
        log(colors.reset, `  - ${tool.name}`);
        log(colors.reset, `    ${tool.description?.slice(0, 80)}...`);
      });
    }

    // 测试 4: 调用 check_login_status
    log(colors.yellow, '\n[测试 4] 调用 check_login_status');
    const checkLoginTool = toolsResult.tools.find(t => t.name === 'check_login_status');

    if (checkLoginTool) {
      log(colors.cyan, '找到 check_login_status 工具');
      log(colors.cyan, '工具定义:', JSON.stringify(checkLoginTool, null, 2));

      const callResult = await sendRequest('tools/call', {
        name: 'check_login_status',
        arguments: {}
      });

      if (callResult) {
        log(colors.green, '\n✅✅✅ check_login_status 调用成功！');

        if (callResult.content && callResult.content[0]) {
          const content = callResult.content[0];
          if (content.type === 'text') {
            try {
              const result = JSON.parse(content.text);
              log(colors.green, '登录状态:', JSON.stringify(result, null, 2));

              if (!result.isLoggedIn) {
                log(colors.yellow, '\n⚠️  未登录，需要获取二维码');

                // 测试 5: 获取登录二维码
                log(colors.yellow, '\n[测试 5] 获取登录二维码');
                const qrcodeResult = await sendRequest('tools/call', {
                  name: 'get_login_qrcode',
                  arguments: {}
                });

                if (qrcodeResult) {
                  log(colors.green, '✅ 二维码获取成功');

                  if (qrcodeResult.content && qrcodeResult.content[0]) {
                    const content = qrcodeResult.content[0];
                    if (content.type === 'text') {
                      try {
                        const result = JSON.parse(content.text);
                        log(colors.green, '二维码信息:', JSON.stringify(result, null, 2));

                        if (result.qrcode) {
                          // 保存二维码到文件
                          const fs = await import('fs');
                          const buffer = Buffer.from(result.qrcode, 'base64');
                          fs.writeFileSync('/tmp/xiaohongshu_qrcode.png', buffer);
                          log(colors.green, '✅ 二维码已保存到: /tmp/xiaohongshu_qrcode.png');
                          log(colors.yellow, '请使用小红书 App 扫描二维码登录');
                        }
                      } catch (e) {
                        log(colors.red, '解析二维码失败:', e.message);
                      }
                    }
                  }
                }
              }
            } catch (e) {
              log(colors.yellow, '无法解析登录状态:', content.text);
            }
          }
        }
      }
    } else {
      log(colors.red, '❌ 未找到 check_login_status 工具');
    }

  } else {
    log(colors.red, '❌ tools/list 失败');
    log(colors.yellow, '可能的原因:');
    log(colors.reset, '  1. xiaohongshu-mcp 使用 SSE 传输，需要持久连接');
    log(colors.reset, '  2. OpenClaw 的 MCP 实现与服务器不兼容');
    log(colors.reset, '  3. 需要特殊的初始化流程');
  }

  log(colors.green, '\n' + '='.repeat(60));
  log(colors.green, '诊断完成');
  log(colors.green, '='.repeat(60));
}

diagnose().catch(error => {
  log(colors.red, '未捕获的错误:', error);
  process.exit(1);
});
