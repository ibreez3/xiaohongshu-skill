#!/bin/bash
# 小红书 Skill OpenClaw 安装脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
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

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SKILL_NAME="xiaohongshu-auto-publish"
OPENCLAW_SKILLS_DIR="$HOME/.openclaw/skills"
SKILL_INSTALL_DIR="$OPENCLAW_SKILLS_DIR/$SKILL_NAME"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}小红书 Skill OpenClaw 安装程序${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 检查 OpenClaw 是否安装
print_info "检查 OpenClaw 是否安装..."
if ! command -v openclaw &> /dev/null; then
    print_error "未找到 OpenClaw 命令"
    print_info "请先安装 OpenClaw: https://openclaw.dev"
    exit 1
fi
print_success "OpenClaw 已安装: $(which openclaw)"
echo ""

# 2. 检查 xiaohongshu-mcp 服务器
print_info "检查 xiaohongshu-mcp 服务器状态..."
MCP_URL="http://127.0.0.1:18060/mcp"
if curl -s -o /dev/null -w "%{http_code}" "$MCP_URL" | grep -q "200\|404"; then
    print_success "xiaohongshu-mcp 服务器正在运行"
else
    print_warning "xiaohongshu-mcp 服务器未运行或无法访问"
    print_info "请确保 xiaohongshu-mcp 已启动: cd /path/to/xiaohongshu-mcp && npm start"
    print_info "安装后需要启动 MCP 服务器才能使用 Skill"
fi
echo ""

# 3. 创建安装目录
print_info "准备安装目录..."
mkdir -p "$OPENCLAW_SKILLS_DIR"
print_success "Skills 目录: $OPENCLAW_SKILLS_DIR"
echo ""

# 4. 复制文件到 OpenClaw skills 目录
print_info "安装 Skill 文件..."

# 如果已存在，先备份
if [ -d "$SKILL_INSTALL_DIR" ]; then
    print_warning "Skill 已存在，正在备份..."
    BACKUP_DIR="${SKILL_INSTALL_DIR}.backup.$(date +%Y%m%d%H%M%S)"
    mv "$SKILL_INSTALL_DIR" "$BACKUP_DIR"
    print_success "已备份到: $BACKUP_DIR"
fi

# 创建新的 Skill 目录
mkdir -p "$SKILL_INSTALL_DIR"

# 复制必要文件
print_info "复制文件..."
cp "$SCRIPT_DIR/index.js" "$SKILL_INSTALL_DIR/"
cp "$SCRIPT_DIR/openclaw.plugin.json" "$SKILL_INSTALL_DIR/"
cp "$SCRIPT_DIR/package.json" "$SKILL_INSTALL_DIR/"

# 复制 commands 目录（如果存在）
if [ -d "$SCRIPT_DIR/commands" ]; then
    cp -r "$SCRIPT_DIR/commands" "$SKILL_INSTALL_DIR/"
    print_success "已复制 commands 目录"
fi

# 复制 skills 目录（如果存在）
if [ -d "$SCRIPT_DIR/skills" ]; then
    cp -r "$SCRIPT_DIR/skills" "$SKILL_INSTALL_DIR/"
    print_success "已复制 skills 目录"
fi

print_success "Skill 文件安装完成"
echo ""

# 5. 验证安装
print_info "验证安装..."
if [ -f "$SKILL_INSTALL_DIR/index.js" ] && [ -f "$SKILL_INSTALL_DIR/openclaw.plugin.json" ]; then
    print_success "所有必要文件已安装"
else
    print_error "安装验证失败"
    exit 1
fi
echo ""

# 6. 设置权限
print_info "设置文件权限..."
chmod +x "$SKILL_INSTALL_DIR/index.js"
print_success "权限设置完成"
echo ""

# 7. 显示安装摘要
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}安装完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "安装位置: $SKILL_INSTALL_DIR"
echo ""
echo -e "${BLUE}下一步操作：${NC}"
echo ""
echo -e "1. ${YELLOW}启动 xiaohongshu-mcp 服务器${NC}（如果未启动）："
echo -e "   ${GREEN}cd /path/to/xiaohongshu-mcp && npm start${NC}"
echo ""
echo -e "2. ${YELLOW}重启 OpenClaw${NC}（如果正在运行）："
echo -e "   ${GREEN}openclaw restart${NC}"
echo "   或者"
echo -e "   ${GREEN}# 完全退出 OpenClaw 并重新打开${NC}"
echo ""
echo -e "3. ${YELLOW}测试 MCP 连接${NC}："
echo -e "   ${GREEN}cd $SCRIPT_DIR && node test-mcp-client.js${NC}"
echo ""
echo -e "4. ${YELLOW}在 OpenClaw 中使用 Skill${NC}："
echo -e "   ${GREEN}/check-login${NC}        # 检查登录状态"
echo -e "   ${GREEN}/get-qrcode${NC}         # 获取登录二维码"
echo -e "   ${GREEN}/publish-image-text${NC} # 发布图文内容"
echo ""
echo -e "${BLUE}配置选项：${NC}"
echo ""
echo -e "修改 MCP 服务器地址："
echo -e "   ${GREEN}export XIAOHONGSHU_MCP_URL=\"http://your-server:port/mcp\"${NC}"
echo ""
echo -e "${BLUE}文档链接：${NC}"
echo -e "   📘 使用指南: ${GREEN}file://$SCRIPT_DIR/USAGE_GUIDE.md${NC}"
echo -e "   🏗️  架构文档: ${GREEN}file://$SCRIPT_DIR/ARCHITECTURE.md${NC}"
echo -e "   📋  快速参考: ${GREEN}file://$SCRIPT_DIR/QUICK_REFERENCE.md${NC}"
echo ""
echo -e "${BLUE}故障排查：${NC}"
echo -e "   如果遇到问题，请查看："
echo -e "   - MCP 服务器是否运行: ${GREEN}curl http://127.0.0.1:18060/mcp${NC}"
echo -e "   - OpenClaw 日志: ${GREEN}~/.openclaw/logs/${NC}"
echo -e "   - 运行测试: ${GREEN}node test-mcp-client.js${NC}"
echo ""
