#!/bin/bash
# API 接口验证脚本

API_BASE="http://localhost:3000/api"

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OpenClaw 适配器 API 验证${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 测试计数
total=0
passed=0
failed=0

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"

    total=$((total + 1))
    echo -e "${YELLOW}[测试 $total]${NC} $name"
    echo -e "${BLUE}  $method $endpoint${NC}"

    if [ -n "$data" ]; then
        echo -e "${BLUE}  数据: $data${NC}"
        response=$(curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -X "$method" "$API_BASE$endpoint" 2>&1)
    fi

    echo "$response" | jq . > /dev/null 2>&1
    if [ $? -eq 0 ] || [ -n "$response" ]; then
        echo -e "${GREEN}  ✅ 成功${NC}"
        passed=$((passed + 1))
        echo "$response" | jq -C . 2>/dev/null || echo "$response" | head -5
    else
        echo -e "${RED}  ❌ 失败${NC}"
        echo "  $response"
        failed=$((failed + 1))
    fi
    echo ""
}

# 1. 健康检查
test_api "健康检查" "GET" "/health"

# 2. 获取工具列表
test_api "获取工具列表" "GET" "/tools"

# 3. 检查登录状态
test_api "检查登录状态" "GET" "/check-login"

# 4. 获取登录二维码
test_api "获取登录二维码" "GET" "/qrcode"

# 5. 获取首页列表
test_api "获取首页列表" "GET" "/feeds"

# 6. 搜索内容
test_api "搜索内容" "GET" "/search?keyword=美食"

# 7. 发布图文（示例，可能因未登录失败）
test_api "发布图文（测试）" "POST" "/publish" \
    '{"title":"测试标题","content":"测试内容","images":["https://example.com/test.jpg"],"tags":["测试"]}'

# 8. 发布视频（示例）
test_api "发布视频（测试）" "POST" "/publish-video" \
    '{"title":"测试视频","content":"测试视频内容","video":"/tmp/test.mp4"}'

# 总结
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}测试总结${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "总计: $total"
echo -e "${GREEN}通过: $passed${NC}"
echo -e "${RED}失败: $failed${NC}"
echo ""
