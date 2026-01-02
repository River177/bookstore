# 📦 Vercel 部署配置总结

## ✅ 已完成的配置

我已经为你的项目配置好了所有 Vercel 部署所需的文件：

### 1. 核心配置文件

#### ✨ `vercel.json`
Vercel 部署配置文件，包含：
- 构建命令：`npm run build`
- 安装命令：`npm install && npx prisma generate`
- 输出目录：`dist/client`
- API 函数超时设置：30 秒
- API 路由重写规则

#### ✨ `api/index.ts` (新建)
Vercel Serverless 函数入口，使用 `@photonjs/vercel` 适配器：
- 集成了 Auth.js 认证
- 集成了所有 API 处理器
- 替代原来的 Express 服务器

### 2. 文档文件

#### 📘 `VERCEL_QUICKSTART.md`
3 分钟快速部署指南，包含：
- 数据库准备（Neon）
- 一键部署按钮
- 数据库初始化命令
- 常见问题快速解决

#### 📕 `VERCEL_DEPLOYMENT.md`
完整部署文档，包含：
- 详细的部署步骤
- 两种部署方法（Web 界面 / CLI）
- 环境变量说明
- 数据库初始化
- 故障排除
- 性能优化建议
- 监控和日志

#### 📗 `scripts/vercel-build.sh`
构建脚本（备用）

---

## 🚀 下一步操作

### 必须完成的步骤：

#### 1. 准备 PostgreSQL 数据库

**推荐：使用 Neon**
```bash
# 访问 https://neon.tech
# 注册并创建项目
# 复制连接字符串
```

连接字符串示例：
```
postgresql://user:password@ep-xxx.neon.tech:5432/neondb?sslmode=require
```

#### 2. 推送代码到 GitHub

```bash
# 在项目根目录
cd d:/homework/数据库/final_project

# 如果还没有 Git 仓库
git init
git add .
git commit -m "Add Vercel deployment configuration"

# 推送到 GitHub
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

#### 3. 在 Vercel 部署

**方法 A：通过网页界面（推荐）**
1. 访问 https://vercel.com/new
2. 用 GitHub 账号登录
3. 点击 "Import Project"
4. 选择你的仓库
5. 配置项目：
   - **Root Directory**: `my-app` ⚠️ 重要！
   - **Framework Preset**: Other
   - 其他保持默认
6. 添加环境变量：
   ```
   DATABASE_URL = postgresql://...（你的Neon连接字符串）
   NODE_ENV = production
   ```
7. 点击 **Deploy**

**方法 B：使用 Vercel CLI**
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 在 my-app 目录部署
cd my-app
vercel

# 添加环境变量
vercel env add DATABASE_URL
vercel env add NODE_ENV

# 生产部署
vercel --prod
```

#### 4. 初始化数据库

部署完成后，在本地运行：

```bash
cd my-app

# Windows PowerShell
$env:DATABASE_URL="postgresql://user:password@..."

# Windows CMD
set DATABASE_URL=postgresql://user:password@...

# 推送数据库结构
npx prisma db push

# 生成 Prisma Client
npx prisma generate

# 添加初始数据（可选）
npm run prisma:seed
```

---

## 📋 环境变量清单

在 Vercel Dashboard 中需要设置的环境变量：

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `NODE_ENV` | ✅ | 运行环境 | `production` |
| `BASE_URL` | ⚠️ | 应用基础 URL | `https://your-app.vercel.app` (可选，Vercel会自动设置) |
| `AUTH_SECRET` | ⚠️ | 认证密钥 | 使用 `openssl rand -base64 32` 生成 |

---

## 🔍 验证部署

部署成功后，检查以下内容：

### ✅ 基础检查
- [ ] 网站可以访问（`https://your-app.vercel.app`）
- [ ] 首页正常显示
- [ ] 可以浏览图书列表

### ✅ 功能检查
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 添加到购物车功能正常
- [ ] 下单功能正常
- [ ] 管理后台可以访问

### ✅ 数据库检查
```bash
# 在本地连接到生产数据库
npx prisma studio
```

---

## 🐛 常见问题

### 1. 部署成功但访问 500 错误
**原因**：数据库未初始化  
**解决**：运行 `npx prisma db push`

### 2. API 请求失败
**原因**：API 路由配置问题  
**检查**：确保 `api/index.ts` 文件存在

### 3. Prisma Client 错误
**原因**：Prisma Client 未生成  
**解决**：确保 `vercel.json` 的 `installCommand` 包含 `npx prisma generate`

### 4. 数据库连接超时
**原因**：
- DATABASE_URL 未设置
- 连接字符串错误
- 缺少 SSL 参数

**解决**：
- 检查 Vercel 环境变量
- 确保连接字符串正确
- 添加 `?sslmode=require` 到连接字符串末尾

### 5. 构建失败
**原因**：依赖安装失败或 TypeScript 错误  
**解决**：
1. 查看 Vercel 构建日志
2. 在本地运行 `npm run build` 测试
3. 修复错误后重新推送

---

## 📊 监控和维护

### 查看日志
1. Vercel Dashboard -> 你的项目 -> Logs
2. 实时查看应用运行日志

### 查看性能
1. Vercel Dashboard -> 你的项目 -> Analytics
2. 查看页面加载速度、访问量等

### 更新部署
```bash
# 修改代码后
git add .
git commit -m "Update feature"
git push

# Vercel 会自动重新部署
```

### 数据库迁移
```bash
# 修改 prisma/schema.prisma 后
export DATABASE_URL="你的连接字符串"
npx prisma db push
```

---

## 🎯 性能优化建议

1. **使用数据库连接池**
   - Neon 自动提供连接池
   - 或使用 Prisma Data Proxy

2. **启用 Vercel Edge Caching**
   - 为静态资源配置缓存头
   - 使用 Vercel 的 Edge Network

3. **优化图片**
   - 使用 Vercel Image Optimization
   - 压缩图片资源

4. **监控数据库查询**
   - 使用 Prisma Studio 查看慢查询
   - 添加必要的数据库索引

---

## 🔗 有用的链接

- **快速开始**: [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)
- **详细文档**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Vercel 文档**: https://vercel.com/docs
- **Neon 文档**: https://neon.tech/docs
- **Prisma 文档**: https://www.prisma.io/docs
- **Vike 文档**: https://vike.dev

---

## 💬 需要帮助？

如果遇到问题：
1. 查看 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) 的故障排除部分
2. 检查 Vercel 构建和运行时日志
3. 在 Vercel Dashboard 联系支持

---

祝部署顺利！🎉

如有任何问题，随时查阅文档或寻求帮助。

