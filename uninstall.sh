#!/bin/bash
# 小红书 Skill OpenClaw 卸载脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SKILL_NAME="xiaohongshu-auto-publish"
OPENCLAW_SKILLS_DIR="$HOME/.openclaw/skills"
SKILL_INSTALL_DIR="$OPENCLAW_SKILLS_DIR/$SKILL_NAME"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}小红书 Skill OpenClaw 卸载程序${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Skill 是否已安装
if [ ! -d "$SKILL_INSTALL_DIR" ]; then
    echo -e "${YELLOW}Skill 未安装${NC}"
    echo "安装目录不存在: $SKILL_INSTALL_DIR"
    exit 0
fi

echo -e "${YELLOW}警告：即将卸载小红书 Skill${NC}"
echo ""
echo -e "安装位置: $SKILL_INSTALL_DIR"
echo ""

# 询问确认
read -p "确认卸载？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "取消卸载"
    exit 0
fi

# 备份当前安装
BACKUP_DIR="${SKILL_INSTALL_DIR}.backup.$(date +%Y%m%d%H%M%S)"
echo -e "${BLUE}创建备份...${NC}"
cp -r "$SKILL_INSTALL_DIR" "$BACKUP_DIR"
echo -e "${GREEN}备份已创建: $BACKUP_DIR${NC}"
echo ""

# 删除安装目录
echo -e "${BLUE}删除 Skill 文件...${NC}"
rm -rf "$SKILL_INSTALL_DIR"
echo -e "${GREEN}Skill 已卸载${NC}"
echo ""

# 清理空目录
if [ -z "$(ls -A $OPENCLAW_SKILLS_DIR)" ]; then
    echo -e "${BLUE}清理空的 skills 目录...${NC}"
    rmdir "$OPENCLAW_SKILLS_DIR" 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}卸载完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "备份位置: $BACKUP_DIR"
echo ""
echo -e "${YELLOW}提示：${NC}"
echo "1. 重启 OpenClaw 以使更改生效"
echo "2. 如需恢复备份，运行："
echo "   ${GREEN}mv $BACKUP_DIR $SKILL_INSTALL_DIR${NC}"
echo "3. 如需彻底删除备份："
echo "   ${GREEN}rm -rf $BACKUP_DIR${NC}"
echo ""
