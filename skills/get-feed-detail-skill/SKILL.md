---
name: get-feed-detail-skill
description: Get detailed information about a Xiaohongshu feed via HTTP API
allowed-tools: Bash, Read
---

# Get Feed Detail Skill

Get detailed information about a Xiaohongshu feed using the xiaohongshu-mcp HTTP API.

## Parameters

This skill receives the following parameters:

- **feed_id**: The feed ID (required)
- **xsec_token**: Access token for the feed (required)
- **load_all_comments**: Whether to load all comments (optional, default: false)
- **limit**: Limit number of comments when load_all_comments is true (optional, default: 20)

## Execution

### Run the script

```bash
node skills/get-feed-detail-skill/scripts/get-feed-detail.mjs
```

### Environment Variables

Pass parameters via environment variables:

```bash
export XIAOHONGSHU_FEED_ID="feed_id_here"
export XIAOHONGSHU_XSEC_TOKEN="token_here"
export XIAOHONGSHU_LOAD_ALL_COMMENTS="true"
export XIAOHONGSHU_COMMENT_LIMIT="50"
node skills/get-feed-detail-skill/scripts/get-feed-detail.mjs
```

### Return the result

After execution, return the feed details to the caller.
