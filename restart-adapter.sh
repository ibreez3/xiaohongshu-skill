#!/bin/bash
# 重启适配器服务器

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}重启适配器服务器...${NC}"

# 停止旧进程
if [ -f "adapter.pid" ]; then
    OLD_PID=$(cat adapter.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "停止旧进程 (PID: $OLD_PID)..."
        kill $OLD_PID
        sleep 2
    fi
fi

# 清理可能残留的进程
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# 启动新进程
echo "启动新进程..."
nohup node adapter-mcp.js > adapter.log 2>&1 &
NEW_PID=$!
echo $NEW_PID > adapter.pid

sleep 3

# 检查状态
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 适配器服务器已重启 (PID: $NEW_PID)${NC}"
    curl -s http://localhost:3000/api/health | head -3
else
    echo -e "${RED}✗ 启动失败，查看日志:${NC}"
    tail -20 adapter.log
    exit 1
fi
