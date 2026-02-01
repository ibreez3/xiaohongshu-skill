#!/usr/bin/env node

/**
 * Xiaohongshu Get Feed Detail Script
 * Get detailed information about a feed via HTTP API
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

async function getFeedDetail(feedId, xsecToken, loadAllComments = false, limit = 20) {
  const params = {
    feed_id: feedId,
    xsec_token: xsecToken,
    load_all_comments: loadAllComments,
  };

  if (loadAllComments) {
    params.limit = limit;
  }

  const result = await callMCPMethod('tools/call', {
    name: 'get_feed_detail',
    arguments: params,
  });

  return JSON.parse(result.content[0].text);
}

async function main() {
  try {
    const feedId = process.env.XIAOHONGSHU_FEED_ID;
    const xsecToken = process.env.XIAOHONGSHU_XSEC_TOKEN;
    const loadAllComments = process.env.XIAOHONGSHU_LOAD_ALL_COMMENTS === 'true';
    const limit = parseInt(process.env.XIAOHONGSHU_COMMENT_LIMIT || '20', 10);

    if (!feedId || !xsecToken) {
      console.error('Error: XIAOHONGSHU_FEED_ID and XIAOHONGSHU_XSEC_TOKEN are required');
      process.exit(1);
    }

    console.log('Getting feed detail for:', feedId);
    const detail = await getFeedDetail(feedId, xsecToken, loadAllComments, limit);

    console.log('Feed detail:');
    console.log(JSON.stringify(detail, null, 2));

  } catch (error) {
    console.error('Get feed detail failed:', error.message);
    process.exit(1);
  }
}

main();
