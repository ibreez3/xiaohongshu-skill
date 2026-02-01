#!/bin/bash
# OpenClaw 适配器安装脚本

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OpenClaw 小红书适配器安装程序${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 检查 xiaohongshu-mcp 服务器
print_info "检查 xiaohongshu-mcp 服务器状态..."
MCP_URL="http://127.0.0.1:18060/mcp"
if curl -s -o /dev/null -w "%{http_code}" "$MCP_URL" | grep -q "200\|404\|405"; then
    print_success "xiaohongshu-mcp 服务器正在运行"
else
    print_warning "xiaohongshu-mcp 服务器未运行或无法访问"
    print_info "请确保 xiaohongshu-mcp 已启动: cd /path/to/xiaohongshu-mcp && npm start"
fi
echo ""

# 2. 安装依赖
print_info "安装 Node.js 依赖..."
if [ -f "package.json" ]; then
    npm install
    print_success "依赖安装完成"
else
    print_error "package.json 未找到"
    exit 1
fi
echo ""

# 3. 启动适配器服务器
print_info "启动适配器服务器..."
print_warning "适配器服务器将在后台运行"
print_info "日志将输出到: adapter.log"

# 检查是否已经在运行
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "端口 3000 已被占用，尝试停止旧进程..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 启动适配器
nohup node adapter-mcp.js > adapter.log 2>&1 &
ADAPTER_PID=$!
echo $ADAPTER_PID > adapter.pid

print_success "适配器服务器已启动 (PID: $ADAPTER_PID)"
echo ""

# 等待服务器启动
print_info "等待服务器启动..."
sleep 3

# 检查服务器状态
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "适配器服务器运行正常"
    HEALTH=$(curl -s http://localhost:3000/api/health)
    echo "$HEALTH" | head -5
else
    print_error "适配器服务器启动失败"
    print_info "查看日志: cat adapter.log"
    exit 1
fi
echo ""

# 4. 安装 OpenClaw Skill
print_info "安装 OpenClaw Skill..."
OPENCLAW_DIR="$HOME/.openclaw/skills/xiaohongshu-auto-publish"

# 创建目录
mkdir -p "$OPENCLAW_DIR"

# 复制文件
cp openclaw-api.js "$OPENCLAW_DIR/index.js"
cp openclaw.plugin.json "$OPENCLAW_DIR/"
cp package.json "$OPENCLAW_DIR/"

# 复制命令定义
if [ -d "commands" ]; then
    cp -r commands "$OPENCLAW_DIR/"
fi

print_success "OpenClaw Skill 安装完成"
echo ""

# 5. 显示安装信息
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}安装完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}服务状态：${NC}"
echo "  适配器 API:    http://localhost:3000"
echo "  MCP 服务器:     $MCP_URL"
echo "  适配器 PID:     $ADAPTER_PID"
echo ""
echo -e "${BLUE}管理命令：${NC}"
echo "  查看适配器日志: cat adapter.log"
echo "  停止适配器:     kill $ADAPTER_PID"
echo "  重启适配器:     ./restart-adapter.sh"
echo ""
echo -e "${BLUE}下一步：${NC}"
echo "  1. 重启 OpenClaw"
echo "  2. 在 OpenClaw 中使用小红书功能"
echo ""
echo -e "${BLUE}测试连接：${NC}"
echo "  curl http://localhost:3000/api/health"
echo ""
