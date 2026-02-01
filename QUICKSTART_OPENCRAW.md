# OpenClaw 快速开始指南

## 三步在 OpenClaw 中使用小红书功能

### 步骤 1：启动 xiaohongshu-mcp 服务器

```bash
cd /path/to/xiaohongshu-mcp
npm start
```

### 步骤 2：安装适配器

```bash
cd xiaohongshu-skill
./install-adapter.sh
```

这将：
- 安装依赖（@modelcontextprotocol/sdk, express, cors）
- 启动适配器服务器（http://localhost:3000）
- 安装 OpenClaw Skill

### 步骤 3：重启 OpenClaw 并使用

重启 OpenClaw，然后可以使用以下命令：

```
/check-login           # 检查登录状态
/get-qrcode            # 获取登录二维码
/publish "标题" "内容" ["/path/img.jpg"] ["标签"]
/search "关键词"
```

---

## 验证安装

```bash
# 检查适配器状态
curl http://localhost:3000/api/health

# 检查登录状态
curl http://localhost:3000/api/check-login
```

---

## 管理命令

```bash
./restart-adapter.sh      # 重启适配器
./uninstall-adapter.sh    # 卸载
tail -f adapter.log       # 查看日志
```

---

## 需要帮助？

- 📖 [完整指南](OPENCRAW_GUIDE.md)
- 🔍 [故障排查](OPENCRAW_GUIDE.md#故障排查)
