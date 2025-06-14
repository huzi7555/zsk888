# ⚡ TaskMaster AI - 快速开始指南

## 🎯 5分钟快速配置飞书文档解析

### 📋 准备工作清单
- [ ] 拥有飞书账号
- [ ] Node.js 18+ 环境
- [ ] 项目代码已下载

---

## 🚀 第一步：启动项目 (1分钟)

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器  
pnpm dev

# 3. 访问应用
open http://localhost:3000
```

**✅ 验证**: 看到TaskMaster AI首页，左侧有导航栏，右上角有快速上传按钮

---

## 🔑 第二步：获取飞书API密钥 (2分钟)

### 2.1 创建飞书应用
1. 访问 👉 [飞书开放平台](https://open.feishu.cn/app)
2. 点击 **"创建应用"** → **"企业自建应用"**
3. 填写应用信息:
   ```
   应用名称: TaskMaster AI
   应用描述: 智能文档解析助手
   ```
4. 点击 **"创建"**

### 2.2 配置权限
在应用管理页面 → **"权限管理"**，添加权限:
```
✅ docx:document (获取文档信息)
✅ docx:document:readonly (读取文档内容)  
✅ drive:file:readonly (下载文件)
```

### 2.3 获取密钥
在 **"凭证与基础信息"** 页面复制:
- **App ID**: `cli_xxxxxxxxxxxxxxxxx`
- **App Secret**: `xxxxxxxxxxxxxxxxxxxxxxx`

---

## ⚙️ 第三步：配置环境变量 (1分钟)

```bash
# 1. 复制环境变量模板
cp env.example .env.local

# 2. 编辑配置文件
vim .env.local  # 或使用其他编辑器
```

**配置内容**:
```env
# 飞书API配置 (必需)
FEISHU_APP_ID=cli_你的应用ID
FEISHU_APP_SECRET=你的应用密钥

# 可选配置
OPENAI_API_KEY=sk_你的OpenAI密钥  # AI摘要功能
MICROLINK_API_KEY=你的Microlink密钥  # 外链解析
```

---

## 🧪 第四步：功能测试 (1分钟)

### 4.1 准备测试文档
1. 在飞书中创建一个测试文档
2. 添加内容: 文字、图片、表格、链接等
3. 点击右上角 **"分享"** → 复制链接

### 4.2 测试解析功能
1. 在TaskMaster AI中点击 **⚡ 快速上传**
2. 选择 **"飞书文档"**
3. 粘贴文档链接
4. 点击 **"解析文档内容"**
5. 查看解析结果！

---

## 🎉 成功示例

解析成功后，你将看到:

```
📊 解析统计: 2张图片、1个视频、3个外部链接

🖼️ 媒体资源:
├─ 产品架构图.png ✅ 已下载
└─ 演示视频.mp4 ✅ 已下载

🔗 外部链接:
├─ GitHub仓库 (包含标题和描述)
├─ 设计稿链接 (自动获取预览)
└─ 参考文档 (元数据已解析)

📄 解析内容:
├─ 完整的文本内容 ✅
├─ 格式化的HTML ✅  
├─ 表格结构 ✅
└─ AI生成标签 ✅
```

---

## 🛠️ 故障排除

### ❌ 问题: 权限被拒绝
```
解决方案:
1. 检查环境变量是否正确配置
2. 确认飞书应用权限已添加并审核通过
3. 重启开发服务器: pnpm dev
```

### ❌ 问题: 文档链接无法识别
```
解决方案:
1. 使用文档的"分享"链接，不是浏览器地址栏
2. 确保链接格式为: https://feishu.cn/docs/xxxxx
3. 检查文档是否有访问权限
```

### ❌ 问题: 图片下载失败
```
解决方案:
1. 检查网络连接
2. 确认文档中的图片大小合理 (<50MB)
3. 查看浏览器控制台错误信息
```

---

## 📚 进阶功能

### 🎨 自定义UI主题
点击左侧边栏底部的 🌙/☀️ 按钮切换深色/浅色主题

### 🏷️ 智能标签管理
- 系统自动分析内容生成标签
- 支持手动添加和编辑标签
- 标签云显示和快速筛选

### 📊 解析统计
- 实时显示解析进度
- 多媒体资源统计
- 文档结构分析

### 🔄 批量处理
- 支持同时解析多个文档
- 文档关系图构建
- 批量导出功能

---

## 💡 使用技巧

### 🚀 效率提升
- 使用 `Ctrl/Cmd + K` 快速搜索
- 右上角快速上传避免页面跳转
- 标签筛选快速定位内容

### 🎯 最佳实践
- 定期整理和归档文档
- 使用有意义的标题和标签
- 利用AI摘要快速了解内容

---

## 🤝 获得帮助

- 📖 查看 [完整文档](./README.md)
- 🛠️ 查看 [技术实现指南](./docs/api-implementation-guide.md)
- 🔧 查看 [飞书API配置详解](./docs/feishu-setup-guide.md)
- 💬 提交 [GitHub Issue](https://github.com/your-repo/issues)

---

🎉 **恭喜！你已成功配置TaskMaster AI飞书文档解析功能！**

现在开始享受智能知识管理的便利吧！ 🚀 