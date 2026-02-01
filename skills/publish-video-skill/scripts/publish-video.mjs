#!/usr/bin/env node

/**
 * Xiaohongshu Video Publish Script
 * Publishes video content to Xiaohongshu via HTTP API
 */

const MCP_SERVER_URL = process.env.XIAOHONGSHU_MCP_URL || 'http://127.0.0.1:18060/mcp';

async function callMCPMethod(method, params = {}) {
  const response = await fetch(MCP_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  const result = await response.json();
  if (result.error) {
    throw new Error(result.error.message || 'MCP call failed');
  }
  return result.result;
}

async function checkLoginStatus() {
  try {
    const result = await callMCPMethod('tools/call', {
      name: 'check_login_status',
      arguments: {},
    });
    return JSON.parse(result.content[0].text);
  } catch (error) {
    // If not logged in, this is expected
    return null;
  }
}

async function publishVideo(title, content, video, tags = [], scheduleAt = null) {
  const params = {
    title,
    content,
    video,
    tags,
  };

  if (scheduleAt) {
    params.schedule_at = scheduleAt;
  }

  const result = await callMCPMethod('tools/call', {
    name: 'publish_with_video',
    arguments: params,
  });

  return JSON.parse(result.content[0].text);
}

async function main() {
  try {
    // Read parameters from environment
    const title = process.env.XIAOHONGSHU_TITLE;
    const content = process.env.XIAOHONGSHU_CONTENT;
    const video = process.env.XIAOHONGSHU_VIDEO;
    const tagsStr = process.env.XIAOHONGSHU_TAGS || '[]';
    const scheduleAt = process.env.XIAOHONGSHU_SCHEDULE_AT || null;

    if (!title || !content || !video) {
      console.error('Error: XIAOHONGSHU_TITLE, XIAOHONGSHU_CONTENT, and XIAOHONGSHU_VIDEO are required');
      process.exit(1);
    }

    const tags = JSON.parse(tagsStr);

    // Check login status first
    console.log('Checking login status...');
    const loginStatus = await checkLoginStatus();
    if (!loginStatus) {
      console.error('Error: Not logged in. Please run /check-login first to login.');
      process.exit(1);
    }

    console.log('Login status: OK');

    // Publish content
    console.log('Publishing video...');
    const result = await publishVideo(title, content, video, tags, scheduleAt);

    console.log('Publish successful!');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Publish failed:', error.message);
    process.exit(1);
  }
}

main();
