#!/usr/bin/env node

/**
 * Xiaohongshu List Feeds Script
 * Get the list of feeds from homepage via HTTP API
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

async function listFeeds() {
  const result = await callMCPMethod('tools/call', {
    name: 'list_feeds',
    arguments: {},
  });

  return JSON.parse(result.content[0].text);
}

async function main() {
  try {
    console.log('Getting feeds from homepage...');
    const feeds = await listFeeds();

    console.log('Feeds:');
    console.log(JSON.stringify(feeds, null, 2));

  } catch (error) {
    console.error('List feeds failed:', error.message);
    process.exit(1);
  }
}

main();
