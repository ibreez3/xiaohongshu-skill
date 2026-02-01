---
name: post-comment-skill
description: Post a comment to a Xiaohongshu feed via HTTP API
allowed-tools: Bash, Read
---

# Post Comment Skill

Post a comment to a Xiaohongshu feed using the xiaohongshu-mcp HTTP API.

## Parameters

This skill receives the following parameters:

- **feed_id**: The feed ID to comment on (required)
- **xsec_token**: Access token for the feed (required)
- **content**: Comment content (required)

## Execution

### Run the script

```bash
node skills/post-comment-skill/scripts/post-comment.mjs
```

### Environment Variables

Pass parameters via environment variables:

```bash
export XIAOHONGSHU_FEED_ID="feed_id_here"
export XIAOHONGSHU_XSEC_TOKEN="token_here"
export XIAOHONGSHU_COMMENT_CONTENT="评论内容"
node skills/post-comment-skill/scripts/post-comment.mjs
```

### Return the result

After execution, return the result to the caller.
