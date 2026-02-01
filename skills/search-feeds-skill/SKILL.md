---
name: search-feeds-skill
description: Search Xiaohongshu content by keyword via HTTP API
allowed-tools: Bash, Read
---

# Search Feeds Skill

Search for content on Xiaohongshu using the xiaohongshu-mcp HTTP API.

## Parameters

This skill receives the following parameters:

- **keyword**: Search keyword (required)
- **filters**: Optional filters object
  - **sort_by**: 综合|最新|最多点赞|最多评论|最多收藏
  - **note_type**: 不限|视频|图文
  - **publish_time**: 不限|一天内|一周内|半年内
  - **search_scope**: 不限|已看过|未看过|已关注
  - **location**: 不限|同城|附近

## Execution

### Run the search script

```bash
node skills/search-feeds-skill/scripts/search-feeds.mjs
```

### Environment Variables

Pass parameters via environment variables:

```bash
export XIAOHONGSHU_KEYWORD="美食"
export XIAOHONGSHU_SORT_BY="最多点赞"
export XIAOHONGSHU_NOTE_TYPE="图文"
node skills/search-feeds-skill/scripts/search-feeds.mjs
```

### Return the result

After execution, return the search results to the caller.
