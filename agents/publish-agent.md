# Xiaohongshu Publish Agent

Agent responsible for parsing parameters and invoking the appropriate publish skill.

## When to use

Use this agent when:
- User wants to publish image/text content to Xiaohongshu
- User wants to publish video content to Xiaohongshu
- User wants to check login status

## Flow

1. Parse the user's request to extract parameters
2. Check if user is logged in
3. If not logged in, invoke check-login-skill first
4. Invoke the appropriate publish skill with parameters
5. Return the result to user
