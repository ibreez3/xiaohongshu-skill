---
allowed-tools: all
description: Publish video content to Xiaohongshu (Little Red Book)
---

# Publish Video to Xiaohongshu

Publish video content to Xiaohongshu via @xiaohongshu-skill:publish-video-skill.

## Usage

Provide the following parameters:

1. **title** - Content title (max 20 Chinese characters or English words)
2. **content** - Body text (do not include #hashtags in content, use tags parameter instead)
3. **video** - Local video file absolute path (single video file only)
4. **tags** - Optional array of topic tags (e.g., ["美食", "旅行", "生活"])
5. **schedule_at** - Optional scheduled publish time in ISO8601 format (e.g., 2024-01-20T10:30:00+08:00)

## Example

```
/publish-video "标题" "正文内容" "/path/to/video.mp4" ["美食", "生活"]
```
