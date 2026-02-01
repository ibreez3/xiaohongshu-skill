# OpenClaw 安装指南

本指南将帮助您将小红书 Skill 安装到 OpenClaw。

## 方法一：使用安装脚本（推荐）

### 1. 运行安装脚本

在项目根目录运行：

```bash
./install.sh
```

脚本将自动完成以下操作：
- ✅ 检查 OpenClaw 是否安装
- ✅ 检查 xiaohongshu-mcp 服务器状态
- ✅ 复制文件到 OpenClaw skills 目录
- ✅ 设置正确的权限
- ✅ 验证安装

### 2. 启动 MCP 服务器

如果 xiaohongshu-mcp 服务器未运行，启动它：

```bash
# 进入 xiaohongshu-mcp 目录
cd /path/to/xiaohongshu-mcp

# 安装依赖（首次运行）
npm install

# 启动服务器
npm start
```

服务器将在 `http://127.0.0.1:18060/mcp` 启动。

### 3. 重启 OpenClaw

```bash
# 如果 OpenClaw 正在运行，重启它
openclaw restart

# 或者完全退出并重新打开 OpenClaw
```

### 4. 测试安装

#### 测试 MCP 连接

```bash
cd /path/to/xiaohongshu-skill
node test-mcp-client.js
```

预期输出：
```
============================================================
MCP 客户端测试
服务器: http://127.0.0.1:18060/mcp
============================================================

[测试 1/4] 初始化会话 (initialize)
✅ 成功
...
✅ 所有测试通过!
============================================================
```

#### 在 OpenClaw 中测试

在 OpenClaw 中运行：

```
/check-login
```

应该返回登录状态或提示扫码登录。

---

## 方法二：手动安装

### 1. 创建安装目录

```bash
mkdir -p ~/.openclaw/skills/xiaohongshu-auto-publish
```

### 2. 复制文件

```bash
# 复制核心文件
cp index.js ~/.openclaw/skills/xiaohongshu-auto-publish/
cp openclaw.plugin.json ~/.openclaw/skills/xiaohongshu-auto-publish/
cp package.json ~/.openclaw/skills/xiaohongshu-auto-publish/

# 复制 commands 目录（可选）
cp -r commands ~/.openclaw/skills/xiaohongshu-auto-publish/

# 复制 skills 目录（可选）
cp -r skills ~/.openclaw/skills/xiaohongshu-auto-publish/
```

### 3. 设置权限

```bash
chmod +x ~/.openclaw/skills/xiaohongshu-auto-publish/index.js
```

### 4. 重启 OpenClaw

完全退出并重新打开 OpenClaw。

---

## 验证安装

### 检查文件结构

```bash
ls -la ~/.openclaw/skills/xiaohongshu-auto-publish/
```

应该包含以下文件：
```
index.js                    # Skill 入口文件
openclaw.plugin.json        # OpenClaw 配置
package.json                # 包配置
commands/                   # 命令定义（可选）
skills/                     # 子技能（可选）
```

### 查看安装日志

OpenClaw 启动时会加载 Skill，查看日志确认：

```bash
# 查看最新的 OpenClaw 日志
tail -f ~/.openclaw/logs/*.log
```

寻找以下日志：
```
[MCP Client] 正在初始化 MCP 会话...
[MCP Client] ✅ MCP 会话初始化成功
[OpenClaw Skill] ✅ 小红书 Skill 加载成功
```

---

## 配置选项

### 修改 MCP 服务器地址

如果 xiaohongshu-mcp 运行在其他地址，设置环境变量：

```bash
# 临时设置（当前终端会话）
export XIAOHONGSHU_MCP_URL="http://192.168.1.100:18060/mcp"

# 永久设置（添加到 ~/.zshrc 或 ~/.bashrc）
echo 'export XIAOHONGSHU_MCP_URL="http://192.168.1.100:18060/mcp"' >> ~/.zshrc
source ~/.zshrc
```

### 检查当前配置

```bash
# 在 OpenClaw 中运行
echo $XIAOHONGSHU_MCP_URL
```

---

## 故障排查

### 问题 1: Skill 未加载

**症状**: OpenClaw 中无法使用 Skill 命令

**解决方案**:

1. 检查安装目录：
```bash
ls -la ~/.openclaw/skills/xiaohongshu-auto-publish/
```

2. 检查文件权限：
```bash
ls -l ~/.openclaw/skills/xiaohongshu-auto-publish/index.js
```
应该是可执行的 (`-rwxr-xr-x`)

3. 查看日志：
```bash
tail -50 ~/.openclaw/logs/*.log
```

### 问题 2: MCP 连接失败

**症状**: `MCP 服务无响应` 或 `连接超时`

**解决方案**:

1. 确认 MCP 服务器正在运行：
```bash
curl http://127.0.0.1:18060/mcp
```

2. 检查端口是否被占用：
```bash
lsof -i :18060
```

3. 运行测试脚本：
```bash
node test-mcp-client.js
```

4. 检查防火墙设置

### 问题 3: 未登录错误

**症状**: `未登录` 或 `请先登录`

**解决方案**:

1. 运行登录检查：
```
/check-login
```

2. 获取二维码并扫码：
```
/get-qrcode
```

3. 使用小红书 App 扫描二维码登录

### 问题 4: 文件路径错误

**症状**: `图片不存在` 或 `找不到文件`

**解决方案**:

使用绝对路径而不是相对路径：

```bash
# ❌ 错误
/publish-image-text "标题" "内容" ["image.jpg"] ["标签"]

# ✅ 正确
/publish-image-text "标题" "内容" ["/Users/username/images/image.jpg"] ["标签"]
```

---

## 卸载

### 使用卸载脚本

```bash
./uninstall.sh
```

### 手动卸载

```bash
# 删除安装目录
rm -rf ~/.openclaw/skills/xiaohongshu-auto-publish

# 重启 OpenClaw
```

---

## 更新

### 更新 Skill

```bash
# 拉取最新代码
git pull origin main

# 重新运行安装脚本
./install.sh
```

### 更新 xiaohongshu-mcp

```bash
cd /path/to/xiaohongshu-mcp
git pull origin main
npm install
npm start
```

---

## 高级配置

### 使用自定义 MCP 服务器

创建配置文件 `~/.openclaw/skills/xiaohongshu-auto-publish/config.json`：

```json
{
  "mcpUrl": "http://custom-server:port/mcp"
}
```

### 调试模式

启用详细日志：

```bash
# 在启动 OpenClaw 前设置
export DEBUG=mcp:*
openclaw
```

---

## 目录结构

安装后的完整目录结构：

```
~/.openclaw/skills/xiaohongshu-auto-publish/
├── index.js                      # Skill 主文件
├── openclaw.plugin.json          # OpenClaw 配置
├── package.json                  # 包配置
├── commands/                     # 命令定义
│   ├── check-login.md
│   ├── publish-image-text.md
│   ├── publish-video.md
│   └── ...
└── skills/                       # 子技能
    └── ...
```

---

## 相关文档

- 📘 [完整使用指南](USAGE_GUIDE.md)
- 🏗️ [架构文档](ARCHITECTURE.md)
- 📋 [快速参考](QUICK_REFERENCE.md)
- 📝 [更新日志](CHANGELOG.md)

---

## 获取帮助

如果遇到问题：

1. 查看 [故障排查](#故障排查) 部分
2. 运行测试脚本诊断问题
3. 查看 OpenClaw 日志
4. 提交 Issue: [GitHub Issues](https://github.com/yourusername/xiaohongshu-skill/issues)
