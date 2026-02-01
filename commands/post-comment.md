---
allowed-tools: all
description: Post a comment to a Xiaohongshu feed
---

# Post Comment

Post a comment to a Xiaohongshu feed via @xiaohongshu-skill:post-comment-skill.

## Usage

Provide the following parameters:

1. **feed_id** - The feed ID to comment on (required)
2. **xsec_token** - Access token for the feed (required)
3. **content** - Comment content (required)

## Example

```
/post-comment "64b5f8a10000000026018f8c" "xsec_token_here" "太棒了！"
```
