#!/usr/bin/env node

/**
 * Xiaohongshu Search Feeds Script
 * Search for content on Xiaohongshu via HTTP API
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

async function searchFeeds(keyword, filters = {}) {
  const params = { keyword };

  if (filters.sort_by) params.sort_by = filters.sort_by;
  if (filters.note_type) params.note_type = filters.note_type;
  if (filters.publish_time) params.publish_time = filters.publish_time;
  if (filters.search_scope) params.search_scope = filters.search_scope;
  if (filters.location) params.location = filters.location;

  const result = await callMCPMethod('tools/call', {
    name: 'search_feeds',
    arguments: params,
  });

  return JSON.parse(result.content[0].text);
}

async function main() {
  try {
    const keyword = process.env.XIAOHONGSHU_KEYWORD;
    const sortBy = process.env.XIAOHONGSHU_SORT_BY;
    const noteType = process.env.XIAOHONGSHU_NOTE_TYPE;
    const publishTime = process.env.XIAOHONGSHU_PUBLISH_TIME;
    const searchScope = process.env.XIAOHONGSHU_SEARCH_SCOPE;
    const location = process.env.XIAOHONGSHU_LOCATION;

    if (!keyword) {
      console.error('Error: XIAOHONGSHU_KEYWORD is required');
      process.exit(1);
    }

    const filters = {};
    if (sortBy) filters.sort_by = sortBy;
    if (noteType) filters.note_type = noteType;
    if (publishTime) filters.publish_time = publishTime;
    if (searchScope) filters.search_scope = searchScope;
    if (location) filters.location = location;

    console.log('Searching for:', keyword);
    const results = await searchFeeds(keyword, filters);

    console.log('Search results:');
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('Search failed:', error.message);
    process.exit(1);
  }
}

main();
