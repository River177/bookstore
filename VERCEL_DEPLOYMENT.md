# Vercel 部署指南

## 📦 项目准备

### 1. 准备 PostgreSQL 数据库

由于 Vercel 是 serverless 平台，需要使用外部 PostgreSQL 数据库：

#### 推荐选项 A: Neon (推荐)
1. 访问 https://neon.tech
2. 创建免费账号
3. 创建新项目，选择离你用户最近的区域
4. 复制连接字符串（类似：`postgresql://user:password@host.neon.tech:5432/database?sslmode=require`）

#### 推荐选项 B: Supabase
1. 访问 https://supabase.com
2. 创建新项目
3. 在 Settings -> Database 中找到连接字符串
4. 使用 Connection Pooling 的连接字符串（更适合 serverless）

#### 推荐选项 C: Railway
1. 访问 https://railway.app
2. 创建新项目，添加 PostgreSQL 数据库
3. 复制 DATABASE_URL

---

## 🚀 部署步骤

### 方法一：通过 Vercel 网站部署（推荐）

#### 步骤 1: 推送代码到 GitHub
```bash
# 如果还没有推送到 GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 步骤 2: 在 Vercel 导入项目
1. 访问 https://vercel.com
2. 点击 "Add New Project"
3. 从 GitHub 导入你的仓库
4. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `my-app`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install && npx prisma generate`
   - **Output Directory**: `dist/client`

#### 步骤 3: 配置环境变量
在 Vercel 项目设置中添加以下环境变量：

```env
DATABASE_URL=你的PostgreSQL连接字符串
NODE_ENV=production
BASE_URL=https://你的项目.vercel.app
AUTH_SECRET=随机生成的密钥
```

生成 AUTH_SECRET:
```bash
openssl rand -base64 32
```

#### 步骤 4: 部署
点击 "Deploy" 按钮，Vercel 会自动：
1. 安装依赖
2. 生成 Prisma Client
3. 构建项目
4. 部署到全球 CDN

---

### 方法二：通过 Vercel CLI 部署

#### 步骤 1: 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 步骤 2: 登录 Vercel
```bash
vercel login
```

#### 步骤 3: 在项目目录中部署
```bash
cd my-app
vercel
```

按提示操作：
- Setup and deploy? **Yes**
- Which scope? 选择你的账号
- Link to existing project? **No**
- What's your project's name? 输入项目名称
- In which directory is your code located? `./`

#### 步骤 4: 配置环境变量
```bash
vercel env add DATABASE_URL
vercel env add NODE_ENV
vercel env add AUTH_SECRET
```

#### 步骤 5: 重新部署
```bash
vercel --prod
```

---

## 🔧 数据库初始化

### 初始化数据库结构
部署完成后，需要初始化数据库：

#### 方法 1: 本地执行（推荐）
```bash
# 在 my-app 目录下
cd my-app

# 设置数据库连接字符串
export DATABASE_URL="你的PostgreSQL连接字符串"

# 推送数据库结构
npx prisma db push

# 生成 Prisma Client
npx prisma generate

# 运行种子数据（可选）
npm run prisma:seed
```

#### 方法 2: 使用 Prisma Studio 管理
```bash
# 在 my-app 目录下
export DATABASE_URL="你的PostgreSQL连接字符串"
npx prisma studio
```

---

## 📝 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `NODE_ENV` | 运行环境 | `production` |
| `BASE_URL` | 应用基础 URL | `https://your-app.vercel.app` |
| `AUTH_SECRET` | 认证密钥（随机字符串） | 使用 `openssl rand -base64 32` 生成 |

---

## 🔍 常见问题

### 1. 部署失败：Prisma Client 未生成
**解决方案**：确保在 `vercel.json` 中的 `installCommand` 包含 `npx prisma generate`

### 2. 数据库连接失败
**解决方案**：
- 检查 DATABASE_URL 是否正确
- 确保数据库允许外部连接
- 对于 Neon/Supabase，确保连接字符串包含 `?sslmode=require`

### 3. API 路由 404 错误
**解决方案**：确保 `api/index.ts` 文件存在且正确导出 handler

### 4. Prisma 生成缓慢
**解决方案**：这是正常的，首次部署会慢一些。后续部署会使用缓存

### 5. 环境变量不生效
**解决方案**：
- 在 Vercel Dashboard 中确认环境变量已设置
- 重新部署项目使环境变量生效

---

## 🎯 部署检查清单

- [ ] PostgreSQL 数据库已创建并获取连接字符串
- [ ] 代码已推送到 GitHub
- [ ] 在 Vercel 创建项目并连接 GitHub 仓库
- [ ] 设置正确的根目录为 `my-app`
- [ ] 配置所有必需的环境变量
- [ ] 运行 `prisma db push` 初始化数据库结构
- [ ] （可选）运行 `prisma:seed` 添加初始数据
- [ ] 测试应用是否正常运行

---

## 🚀 持续部署

配置完成后，每次推送到 main 分支，Vercel 会自动：
1. 检测代码变化
2. 运行构建
3. 部署到生产环境

你也可以为其他分支配置预览部署。

---

## 📊 监控和日志

### 查看部署日志
1. 访问 Vercel Dashboard
2. 选择你的项目
3. 点击 "Deployments" 查看部署历史
4. 点击具体部署查看详细日志

### 查看运行时日志
1. 在项目页面点击 "Logs"
2. 实时查看应用运行日志
3. 可以按时间、路由筛选

---

## 🔄 更新部署

### 更新代码
```bash
git add .
git commit -m "Update feature"
git push
```

Vercel 会自动检测并部署。

### 更新数据库结构
```bash
# 修改 prisma/schema.prisma 后
export DATABASE_URL="你的PostgreSQL连接字符串"
npx prisma db push
```

### 更新环境变量
```bash
# 通过 CLI
vercel env add VARIABLE_NAME

# 或在 Vercel Dashboard 中更新
```

---

## 💡 性能优化建议

1. **使用连接池**：对于 PostgreSQL，使用 Prisma Data Proxy 或数据库提供的连接池
2. **启用缓存**：合理使用 Vercel 的 Edge Caching
3. **优化图片**：使用 Vercel 的图片优化服务
4. **监控性能**：定期检查 Vercel Analytics

---

## 🆘 获取帮助

- Vercel 文档: https://vercel.com/docs
- Prisma 文档: https://www.prisma.io/docs
- Vike 文档: https://vike.dev

如有问题，可以在 Vercel Dashboard 中联系支持团队。

