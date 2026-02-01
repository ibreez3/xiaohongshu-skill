---
allowed-tools: all
description: Publish image/text content to Xiaohongshu (Little Red Book)
---

# Publish Image/Text to Xiaohongshu

Publish image/text content to Xiaohongshu via @xiaohongshu-skill:publish-image-text-skill.

## Usage

Provide the following parameters:

1. **title** - Content title (max 20 Chinese characters or English words)
2. **content** - Body text (do not include #hashtags in content, use tags parameter instead)
3. **images** - Array of image paths or URLs (at least 1 image required)
4. **tags** - Optional array of topic tags (e.g., ["美食", "旅行", "生活"])
5. **schedule_at** - Optional scheduled publish time in ISO8601 format (e.g., 2024-01-20T10:30:00+08:00)

## Example

```
/publish-image-text "标题" "正文内容" ["path/to/image1.jpg", "path/to/image2.jpg"] ["美食", "生活"]
```
