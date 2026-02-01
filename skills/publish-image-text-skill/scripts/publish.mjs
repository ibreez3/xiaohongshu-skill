#!/usr/bin/env node

/**
 * Xiaohongshu Image/Text Publish Script
 * Publishes image/text content to Xiaohongshu via HTTP API
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

async function publishImageText(title, content, images, tags = [], scheduleAt = null) {
  const params = {
    title,
    content,
    images,
    tags,
  };

  if (scheduleAt) {
    params.schedule_at = scheduleAt;
  }

  const result = await callMCPMethod('tools/call', {
    name: 'publish_content',
    arguments: params,
  });

  return JSON.parse(result.content[0].text);
}

async function main() {
  try {
    // Read parameters from environment
    const title = process.env.XIAOHONGSHU_TITLE;
    const content = process.env.XIAOHONGSHU_CONTENT;
    const imagesStr = process.env.XIAOHONGSHU_IMAGES || '[]';
    const tagsStr = process.env.XIAOHONGSHU_TAGS || '[]';
    const scheduleAt = process.env.XIAOHONGSHU_SCHEDULE_AT || null;

    if (!title || !content) {
      console.error('Error: XIAOHONGSHU_TITLE and XIAOHONGSHU_CONTENT are required');
      process.exit(1);
    }

    const images = JSON.parse(imagesStr);
    const tags = JSON.parse(tagsStr);

    if (!Array.isArray(images) || images.length === 0) {
      console.error('Error: At least one image is required');
      process.exit(1);
    }

    // Check login status first
    console.log('Checking login status...');
    const loginStatus = await checkLoginStatus();
    if (!loginStatus) {
      console.error('Error: Not logged in. Please run /check-login first to login.');
      process.exit(1);
    }

    console.log('Login status: OK');

    // Publish content
    console.log('Publishing content...');
    const result = await publishImageText(title, content, images, tags, scheduleAt);

    console.log('Publish successful!');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Publish failed:', error.message);
    process.exit(1);
  }
}

main();
