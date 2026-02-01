---
allowed-tools: all
description: Get detailed information about a Xiaohongshu feed (post)
---

# Get Feed Detail

Get detailed information about a Xiaohongshu feed via @xiaohongshu-skill:get-feed-detail-skill.

## Usage

Provide the following parameters:

1. **feed_id** - The feed ID to get details for (required)
2. **xsec_token** - Access token for the feed (required)
3. **load_all_comments** - Whether to load all comments (default: false)
4. **limit** - Limit the number of comments loaded when load_all_comments is true (default: 20)

## Example

```
/get-feed-detail "64b5f8a10000000026018f8c" "xsec_token_here"
```

Get feed with all comments:
```
/get-feed-detail "64b5f8a10000000026018f8c" "xsec_token_here" true 50
```
