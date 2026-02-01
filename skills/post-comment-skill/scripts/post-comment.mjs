#!/usr/bin/env node

/**
 * Xiaohongshu Post Comment Script
 * Post a comment to a feed via HTTP API
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

async function postComment(feedId, xsecToken, content) {
  const result = await callMCPMethod('tools/call', {
    name: 'post_comment_to_feed',
    arguments: {
      feed_id: feedId,
      xsec_token: xsecToken,
      content,
    },
  });

  return JSON.parse(result.content[0].text);
}

async function main() {
  try {
    const feedId = process.env.XIAOHONGSHU_FEED_ID;
    const xsecToken = process.env.XIAOHONGSHU_XSEC_TOKEN;
    const content = process.env.XIAOHONGSHU_COMMENT_CONTENT;

    if (!feedId || !xsecToken || !content) {
      console.error('Error: XIAOHONGSHU_FEED_ID, XIAOHONGSHU_XSEC_TOKEN, and XIAOHONGSHU_COMMENT_CONTENT are required');
      process.exit(1);
    }

    console.log('Posting comment to feed:', feedId);
    const result = await postComment(feedId, xsecToken, content);

    console.log('Comment posted successfully!');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Post comment failed:', error.message);
    process.exit(1);
  }
}

main();
