#!/usr/bin/env node
/**
 * MCP 客户端测试脚本
 * 用于验证 xiaohongshu-skill 的 MCP 客户端实现
 */

const MCP_SERVER = process.env.XIAOHONGSHU_MCP_URL || 'http://127.0.0.1:18060/mcp';
const JSON_RPC_VERSION = '2.0';
let requestId = 0;

// 彩色日志输出
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

  log(colors.blue, `\n[请求] ${method}`);
  log(colors.cyan, '参数:', JSON.stringify(params, null, 2).slice(0, 300));

  try {
    const response = await fetch(MCP_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`MCP Error: ${data.error.message} (code: ${data.error.code})`);
    }

    log(colors.green, `✅ 成功`);
    return data.result;
  } catch (error) {
    log(colors.red, `❌ 失败:`, error.message);
    throw error;
  }
}

async function sendNotification(method, params = {}) {
  const request = {
    jsonrpc: JSON_RPC_VERSION,
    // 通知没有 id
    method,
    params
  };

  log(colors.blue, `\n[通知] ${method}`);

  try {
    const response = await fetch(MCP_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    log(colors.green, `✅ 通知发送成功`);
    return true;
  } catch (error) {
    log(colors.red, `❌ 通知发送失败:`, error.message);
    throw error;
  }
}

async function runTests() {
  log(colors.cyan, '='.repeat(60));
  log(colors.cyan, 'MCP 客户端测试');
  log(colors.cyan, `服务器: ${MCP_SERVER}`);
  log(colors.cyan, '='.repeat(60));

  try {
    // 测试 1: Initialize
    log(colors.yellow, '\n[测试 1/5] 初始化会话 (initialize)');
    const initResult = await sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'mcp-client-test',
        version: '1.0.0'
      }
    });
    log(colors.green, '会话 ID:', initResult?.sessionId || 'N/A');
    log(colors.green, '服务器能力:', JSON.stringify(initResult?.capabilities, null, 2));

    // 测试 2: 发送 initialized 通知
    log(colors.yellow, '\n[测试 2/5] 发送 initialized 通知');
    await sendNotification('initialized', {});

    // 测试 3: Ping
    log(colors.yellow, '\n[测试 3/5] Ping 服务器 (ping)');
    await sendRequest('ping', {});

    // 测试 4: Get Tools List
    log(colors.yellow, '\n[测试 4/5] 获取工具列表 (tools/list)');
    const toolsResult = await sendRequest('tools/list', {});
    const tools = toolsResult?.tools || [];
    log(colors.green, `获取到 ${tools.length} 个工具:`);
    tools.slice(0, 5).forEach((tool, i) => {
      log(colors.cyan, `  ${i + 1}. ${tool.name}`);
      log(colors.reset, `     描述: ${tool.description?.slice(0, 80)}...`);
    });
    if (tools.length > 5) {
      log(colors.cyan, `  ... 还有 ${tools.length - 5} 个工具`);
    }

    // 测试 5: Call Tool (如果工具列表不为空)
    if (tools.length > 0) {
      log(colors.yellow, '\n[测试 5/5] 调用工具 (tools/call)');

      // 尝试调用 check_login_status
      const checkLoginTool = tools.find(t => t.name === 'check_login_status');
      if (checkLoginTool) {
        log(colors.cyan, '调用 check_login_status...');
        const callResult = await sendRequest('tools/call', {
          name: 'check_login_status',
          arguments: {}
        });

        if (callResult?.content?.[0]) {
          const content = callResult.content[0];
          if (content.type === 'text') {
            try {
              const result = JSON.parse(content.text);
              log(colors.green, '登录状态:', JSON.stringify(result, null, 2));
            } catch {
              log(colors.green, '登录状态 (原始):', content.text);
            }
          }
        }
      } else {
        log(colors.yellow, '未找到 check_login_status 工具，跳过测试');
      }
    } else {
      log(colors.yellow, '\n[测试 5/5] 没有可用工具，跳过调用测试');
    }

    // 成功总结
    log(colors.green, '\n' + '='.repeat(60));
    log(colors.green, '✅ 所有测试通过!');
    log(colors.green, '='.repeat(60));
    log(colors.cyan, '\n提示: MCP 协议流程如下：');
    log(colors.reset, '  1. client → server: initialize 请求');
    log(colors.reset, '  2. server → client: initialize 响应（含会话信息）');
    log(colors.reset, '  3. client → server: initialized 通知（必需！）');
    log(colors.reset, '  4. client → server: tools/call 等其他请求');
    log(colors.cyan, '\n✅ 第3步的 initialized 通知是关键，缺少它会导致"invalid during session initialization"错误');

  } catch (error) {
    log(colors.red, '\n' + '='.repeat(60));
    log(colors.red, '❌ 测试失败');
    log(colors.red, '='.repeat(60));
    log(colors.red, error.message);
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  log(colors.red, '未捕获的错误:', error);
  process.exit(1);
});
