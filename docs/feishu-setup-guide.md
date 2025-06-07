# 飞书API配置详细指南

## 🎯 第一步：创建飞书应用

### 1.1 访问飞书开放平台
1. 打开浏览器，访问 [飞书开放平台](https://open.feishu.cn/)
2. 使用飞书账号登录（如没有账号需要先注册）
3. 点击右上角"控制台"进入开发者控制台

### 1.2 创建企业自建应用
1. 在控制台页面，点击"创建应用"
2. 选择"企业自建应用"
3. 填写应用信息：
   ```
   应用名称: TaskMaster AI文档解析器
   应用描述: 用于解析飞书文档内容的智能助手
   应用图标: 上传一个合适的图标
   ```
4. 点击"创建"完成应用创建

### 1.3 获取应用凭证
创建完成后，你会看到：
- **App ID**: `cli_xxxxxxxxxxxxxxxxx` (复制保存)
- **App Secret**: `xxxxxxxxxxxxxxxxxxxxxxx` (复制保存)

## 🔐 第二步：配置应用权限

### 2.1 基础权限配置
在应用管理页面，点击"权限管理"，添加以下权限：

#### 📄 文档读取权限
```
docx:document - 获取、搜索文档对象
docx:document:readonly - 获取文档内容
```

#### 📁 云空间权限  
```
drive:drive:readonly - 获取文件夹信息
drive:file:readonly - 获取文件基本信息
```

#### 👤 用户信息权限（可选）
```
contact:user.id:readonly - 获取用户ID
```

### 2.2 权限申请和审核
1. 添加权限后，点击"申请权限"
2. 填写权限申请理由：
   ```
   申请理由: 用于TaskMaster AI知识管理系统，需要读取飞书文档内容进行智能解析和归档
   使用场景: 个人/团队知识管理，文档内容提取和整理
   ```
3. 提交申请等待审核（通常几分钟内通过）

## 🌐 第三步：API版本和接口说明

### 3.1 支持的API版本
我们使用以下API版本：
- **文档API**: `v1` - 最新稳定版本
- **云空间API**: `v1` - 文件下载接口

### 3.2 主要API接口

#### 获取访问Token
```http
POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal
Content-Type: application/json

{
  "app_id": "cli_xxxxxxxxx",
  "app_secret": "xxxxxxxxxxxxxxx"
}
```

#### 获取文档信息
```http
GET https://open.feishu.cn/open-apis/docx/v1/documents/{document_id}
Authorization: Bearer {tenant_access_token}
```

#### 获取文档内容块
```http
GET https://open.feishu.cn/open-apis/docx/v1/documents/{document_id}/blocks
Authorization: Bearer {tenant_access_token}
```

#### 下载文件资源
```http
GET https://open.feishu.cn/open-apis/im/v1/files/{file_token}
Authorization: Bearer {tenant_access_token}
```

## ⚙️ 第四步：本地环境配置

### 4.1 创建环境变量文件
```bash
# 在项目根目录创建 .env.local 文件
cp env.example .env.local
```

### 4.2 配置API密钥
编辑 `.env.local` 文件：
```env
# 飞书开放平台配置
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 可选：其他API配置  
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxx  # AI摘要生成
MICROLINK_API_KEY=xxxxxxxxxxxxxxxxxxxxxxx  # 外链元数据解析
```

### 4.3 验证配置
启动项目并测试：
```bash
pnpm dev
```

访问 http://localhost:3000，测试飞书文档解析功能。

## 🔍 第五步：功能测试

### 5.1 获取测试文档
1. 在飞书中创建一个测试文档
2. 添加各种内容：文本、图片、表格、链接等
3. 复制文档的分享链接

### 5.2 测试解析功能
1. 打开TaskMaster AI应用
2. 点击右上角快速上传按钮
3. 选择"飞书文档"
4. 粘贴测试文档链接
5. 点击"解析文档内容"
6. 查看解析结果

### 5.3 验证解析结果
检查是否正确解析了：
- ✅ 文档标题和基本信息
- ✅ 文本内容和格式
- ✅ 图片是否正确下载
- ✅ 表格结构是否完整
- ✅ 链接是否可访问
- ✅ 统计信息是否准确

## ⚠️ 常见问题和解决方案

### 问题1：权限被拒绝
```
错误: 403 Forbidden - 权限不足
解决方案: 
1. 检查是否添加了正确的权限
2. 确认权限申请已通过
3. 重新生成访问token
```

### 问题2：文档ID提取失败
```
错误: 无法从链接中提取文档ID
解决方案:
1. 确认链接格式正确
2. 使用文档的"分享"链接，不是浏览器地址栏链接
3. 检查链接是否包含必要的权限参数
```

### 问题3：文件下载失败
```
错误: 文件下载超时或失败
解决方案:
1. 检查网络连接
2. 确认文件大小未超过限制
3. 实现重试机制
```

### 问题4：API调用频率限制
```
错误: 429 Too Many Requests
解决方案:
1. 实现请求频率控制
2. 添加请求队列机制
3. 使用缓存避免重复请求
```

## 🚀 高级配置选项

### 启用调试模式
```env
# 开启API调试日志
FEISHU_DEBUG=true
LOG_LEVEL=debug
```

### 配置缓存策略
```env
# 文档缓存时间（分钟）
DOCUMENT_CACHE_TTL=30
# 文件缓存大小限制（MB）
FILE_CACHE_LIMIT=100
```

### 设置代理（如需要）
```env
# HTTP代理配置
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=https://proxy.company.com:8080
```

## 📊 监控和分析

### 添加使用统计
我们的系统会自动记录：
- 📈 解析成功率
- ⏱️ 平均解析时间  
- 📦 文件下载量
- 🔄 API调用次数

### 错误日志
所有API错误都会记录到日志文件中，便于调试和优化。

---

配置完成后，你就可以享受强大的飞书文档解析功能了！🎉 