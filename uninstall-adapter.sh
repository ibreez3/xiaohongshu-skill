#!/bin/bash
# 卸载 OpenClaw 适配器

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}卸载 OpenClaw 小红书适配器${NC}"
echo ""

# 停止适配器服务器
if [ -f "adapter.pid" ]; then
    PID=$(cat adapter.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "停止适配器服务器 (PID: $PID)..."
        kill $PID
    fi
    rm adapter.pid
fi

# 清理端口 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 卸载 OpenClaw Skill
OPENCLAW_DIR="$HOME/.openclaw/skills/xiaohongshu-auto-publish"
if [ -d "$OPENCLAW_DIR" ]; then
    echo "删除 OpenClaw Skill..."
    rm -rf "$OPENCLAW_DIR"
fi

# 清理日志
if [ -f "adapter.log" ]; then
    rm adapter.log
fi

echo -e "${GREEN}✓ 卸载完成${NC}"
echo ""
echo "如需重新安装，运行: ./install-adapter.sh"
