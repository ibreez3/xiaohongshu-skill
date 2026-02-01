---
allowed-tools: all
description: Search Xiaohongshu content by keyword
---

# Search Xiaohongshu Feeds

Search for content on Xiaohongshu via @xiaohongshu-skill:search-feeds-skill.

## Usage

Provide the following parameters:

1. **keyword** - Search keyword (required)
2. **filters** - Optional filters:
   - **sort_by**: 综合|最新|最多点赞|最多评论|最多收藏
   - **note_type**: 不限|视频|图文
   - **publish_time**: 不限|一天内|一周内|半年内
   - **search_scope**: 不限|已看过|未看过|已关注
   - **location**: 不限|同城|附近

## Example

```
/search-feeds "美食" {"sort_by": "最多点赞", "note_type": "图文"}
```
