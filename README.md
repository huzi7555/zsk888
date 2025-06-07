# TaskMaster AI - 智能知识管理平台

<div align="center">

🚀 **基于Next.js的现代化知识管理和AI写作平台**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-Latest-000000)](https://ui.shadcn.com/)

</div>

## ✨ 功能特性

### 🏠 **核心功能**
- **📥 智能收件箱** - 管理和整理知识片段，支持标签分类和搜索
- **📚 知识库** - 浏览和管理文档，构建个人知识体系  
- **📤 快速上传** - 支持多种内容来源的一键导入
- **🔍 智能搜索** - 基于内容和标签的快速检索

### 🎯 **飞书文档深度解析 (重点功能)**
- **📄 完整内容提取** - 获取文档标题、正文、格式等
- **🖼️ 多媒体资源** - 自动下载图片、视频等媒体文件
- **🔗 外链信息获取** - 解析文档中的外部链接元数据
- **📎 内嵌文档递归** - 自动解析文档中引用的其他飞书文档
- **📊 结构化数据** - 表格、列表等结构化内容保持
- **🏷️ AI智能标签** - 自动分析内容生成相关标签
- **📝 智能摘要** - AI生成文档摘要和关键信息

### 🎨 **用户体验**
- **🌙 深色模式** - 支持深色/浅色主题切换
- **📱 响应式设计** - 完美适配桌面和移动设备
- **⚡ 快速操作** - 右上角快速上传，侧边栏快速导航
- **🎭 现代UI** - 基于Shadcn UI的精美界面

## 🚀 快速开始

### 环境要求
- Node.js 18.0+
- pnpm 8.0+

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd knowledgebasefixed2
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
# 复制环境变量示例文件
cp env.example .env.local

# 编辑环境变量
vim .env.local
```

4. **启动开发服务器**
```bash
pnpm dev
```

5. **访问应用**
- 开发服务器: http://localhost:3000

## ⚙️ 飞书文档解析配置

### 1. 创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 点击"创建企业自建应用"
3. 填写应用信息并创建

### 2. 配置应用权限

在应用管理页面，添加以下权限：
- `docx:document` - 获取文档信息
- `docx:document:readonly` - 读取文档内容
- `drive:drive:readonly` - 访问云文档

### 3. 获取应用凭证

```bash
# .env.local 文件配置
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. 功能测试

1. 打开应用并导航到上传页面
2. 选择"飞书文档"作为内容来源
3. 粘贴飞书文档链接（例如：`https://feishu.cn/docs/doccnxxxxxxxxx`）
4. 点击"解析文档内容"开始解析

## 📋 支持的飞书文档格式

### ✅ 支持的内容类型
- **文本内容** - 段落、标题、列表等
- **图片** - JPEG、PNG、GIF等格式
- **视频** - MP4、MOV等格式
- **表格** - 完整的表格结构和数据
- **链接** - 内部链接和外部链接
- **内嵌文档** - 其他飞书文档的引用

### 🎯 解析示例

输入飞书文档链接后，系统会解析出：

```
📊 解析统计: 3张图片、1个视频、2个外部链接、1个内嵌文档

📎 内嵌文档:
- 产品需求文档 v2.0
- API接口设计文档

🔗 外部链接:
- GitHub仓库地址
- 设计稿原型链接
```

## 🛠️ 技术架构

### 前端技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Shadcn UI
- **状态管理**: Zustand
- **UI组件**: Radix UI
- **图标**: Lucide React

### API集成
- **飞书开放API** - 文档内容获取
- **Microlink API** - 外链元数据解析
- **OpenAI API** - AI摘要和标签生成 (可选)

### 文件结构
```
├── app/                    # Next.js App Router
│   ├── components/         # 应用组件
│   │   ├── UploadFormContent.tsx  # 上传表单
│   │   ├── ParsePreview.tsx       # 解析结果展示
│   │   └── SideBar.tsx            # 侧边栏导航
│   ├── utils/             # 工具函数
│   │   └── docParsers.ts  # 文档解析器
│   └── store.ts           # 状态管理
├── components/            # 通用UI组件
│   └── ui/               # Shadcn UI组件
└── env.example           # 环境变量示例
```

## 🎮 使用指南

### 1. 基础操作
- **侧边栏导航** - 点击左侧图标切换功能模块
- **快速上传** - 点击右上角闪电图标快速上传内容
- **主题切换** - 侧边栏底部的主题切换按钮

### 2. 飞书文档导入
1. 点击快速上传或进入上传页面
2. 选择"飞书文档"作为内容来源
3. 粘贴飞书文档分享链接
4. 点击"解析文档内容"
5. 查看解析结果，编辑标题和标签
6. 确认上传到收件箱

### 3. 内容管理
- **收件箱** - 查看所有导入的内容
- **标签筛选** - 使用标签快速筛选内容
- **搜索功能** - 在搜索框中输入关键词
- **内容预览** - 点击内容卡片查看详情

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发规范
- 使用TypeScript进行类型安全开发
- 遵循React函数组件最佳实践
- 使用Tailwind CSS进行样式开发
- 保持代码简洁和可读性

## 📄 开源协议

本项目采用 MIT 协议开源。

---

<div align="center">

**🚀 开始你的智能知识管理之旅！**

如有问题，请提交 Issue 或联系开发团队。

</div> 