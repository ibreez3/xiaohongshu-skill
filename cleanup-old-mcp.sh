#!/bin/bash
# 清理旧的 xiaohongshu-mcp 配置和进程

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== 清理旧的 xiaohongshu-mcp 配置 ===${NC}\n"

# 1. 查找并停止旧的 MCP 进程
echo -e "${YELLOW}[1/5] 检查旧进程...${NC}"
OLD_PID=$(ps aux | grep xiaohongshu-mcp | grep -v grep | awk '{print $2}')

if [ -n "$OLD_PID" ]; then
    echo -e "${GREEN}发现旧进程: PID $OLD_PID${NC}"
    echo -e "${YELLOW}停止旧进程...${NC}"
    kill $OLD_PID
    sleep 2

    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo -e "${RED}进程仍在运行，强制停止...${NC}"
        kill -9 $OLD_PID
    fi
    echo -e "${GREEN}✅ 旧进程已停止${NC}"
else
    echo -e "${GREEN}✅ 没有旧进程在运行${NC}"
fi
echo ""

# 2. 检查 OpenClaw extensions
echo -e "${YELLOW}[2/5] 检查 OpenClaw extensions...${NC}"
if [ -d ~/.openclaw/extensions/xiaohongshu-mcp ]; then
    echo -e "${YELLOW}发现旧 extension 目录: ~/.openclaw/extensions/xiaohongshu-mcp${NC}"

    # 备份配置
    if [ -f ~/.openclaw/extensions/xiaohongshu-mcp/openclaw.plugin.json ]; then
        mkdir -p ~/xiaohongshu-backup
        cp ~/.openclaw/extensions/xiaohongshu-mcp/openclaw.plugin.json ~/xiaohongshu-backup/
        echo -e "${GREEN}✅ 配置已备份到: ~/xiaohongshu-backup/${NC}"
    fi

    # 移除 extension
    echo -e "${YELLOW}移除旧 extension...${NC}"
    rm -rf ~/.openclaw/extensions/xiaohongshu-mcp
    echo -e "${GREEN}✅ 旧 extension 已移除${NC}"
else
    echo -e "${GREEN}✅ 没有旧的 extension 目录${NC}"
fi
echo ""

# 3. 检查 MCP 配置
echo -e "${YELLOW}[3/5] 检查 MCP 配置...${NC}"
if [ -f ~/.openclaw/openclaw.json ]; then
    # 检查是否有 xiaohongshu-mcp 相关配置
    if grep -q "xiaohongshu-mcp" ~/.openclaw/openclaw.json; then
        echo -e "${YELLOW}发现 MCP 配置引用，已保留${NC}"
        echo -e "${YELLOW}（OpenClaw 可能仍在配置中引用旧的 MCP）${NC}"
    else
        echo -e "${GREEN}✅ 没有发现 MCP 配置引用${NC}"
    fi
else
    echo -e "${GREEN}✅ openclaw.json 不存在${NC}"
fi
echo ""

# 4. 确认新适配器运行
echo -e "${YELLOW}[4/5] 确认新适配器状态...${NC}"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 新适配器正在运行 (http://localhost:3000)${NC}"

    # 测试 API
    if curl -s http://localhost:3000/api/check-login > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API 连接正常${NC}"
    else
        echo -e "${RED}❌ API 连接失败${NC}"
    fi
else
    echo -e "${RED}❌ 新适配器未运行${NC}"
    echo -e "${YELLOW}请启动: ./restart-adapter.sh${NC}"
fi
echo ""

# 5. 验证 Skill 安装
echo -e "${YELLOW}[5/5] 验证 Skill 安装...${NC}"
if [ -f ~/.openclaw/workspace/skills/xiaohongshu-auto-publish/index.js ]; then
    echo -e "${GREEN}✅ Skill 已安装到正确位置${NC}"

    # 测试导出
    if node -e "import('/Users/sunyang/.openclaw/workspace/skills/xiaohongshu-auto-publish/index.js').then(m => console.log('方法:', Object.keys(m.default)))" 2>/dev/null; then
        echo -e "${GREEN}✅ Skill 导出正确${NC}"
    else
        echo -e "${RED}❌ Skill 导出失败${NC}"
    fi
else
    echo -e "${RED}❌ Skill 未安装${NC}"
fi
echo ""

echo -e "${GREEN}=== 清理完成 ===${NC}"
echo ""
echo -e "${YELLOW}下一步操作：${NC}"
echo -e "1. ${GREEN}完全退出并重启 OpenClaw 应用${NC}"
echo -e "2. ${GREEN}在对话中使用新的方式：${NC}"
echo -e "   \"请调用 check_login_status 工具检查登录状态\""
echo ""
echo -e "${YELLOW}重要提示：${NC}"
echo -e "- OpenClaw 的 AI 会记住使用模式"
echo -e "- 需要通过新的对话重新学习"
echo -e "- 在对话中明确说明：\"使用 Skill 而不是 MCP\""
echo ""
