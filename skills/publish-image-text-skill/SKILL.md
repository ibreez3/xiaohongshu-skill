---
name: publish-image-text-skill
description: Publish image/text content to Xiaohongshu (Little Red Book) via HTTP API
allowed-tools: Bash, Read
---

# Publish Image/Text to Xiaohongshu Skill

Publish image/text content to Xiaohongshu using the xiaohongshu-mcp HTTP API.

## Parameters

This skill receives the following parameters:

- **title**: Content title (max 20 characters)
- **content**: Body text
- **images**: Array of image paths or URLs
- **tags**: Optional array of topic tags
- **schedule_at**: Optional scheduled publish time

## Execution

### Run the publish script

Execute the Node.js script to publish content:

```bash
node skills/publish-image-text-skill/scripts/publish.mjs
```

The script will:
1. Read parameters from the environment or stdin
2. Make HTTP POST request to xiaohongshu-mcp server
3. Return the result

### Environment Variables

Pass parameters via environment variables:

```bash
export XIAOHONGSHU_TITLE="标题"
export XIAOHONGSHU_CONTENT="正文内容"
export XIAOHONGSHU_IMAGES='["path1.jpg","path2.jpg"]'
export XIAOHONGSHU_TAGS='["标签1","标签2"]'
node skills/publish-image-text-skill/scripts/publish.mjs
```

### Return the result

After execution, return the result to the caller:
- **Success**: display the published content URL
- **Failure**: show the error details
