---
name: check-login-skill
description: Check Xiaohongshu login status and display QR code if needed
allowed-tools: Bash, Read
---

# Check Login Status Skill

Check if user is logged in to Xiaohongshu, display QR code if not.

## Execution

### Run the check login script

```bash
node skills/check-login-skill/scripts/check-login.mjs
```

The script will:
1. Check current login status via xiaohongshu-mcp API
2. If not logged in, get and display the login QR code
3. Wait for user to scan and complete login
4. Return the login status

### Return the result

- **Logged in**: Display user info
- **Not logged in**: Display QR code as base64 image and instructions
- **Error**: Show error details
