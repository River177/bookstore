# ⚡ Vercel 部署命令速查表

## 📦 首次部署

### 1. 准备数据库
```bash
# 访问 https://neon.tech 注册并创建数据库
# 复制连接字符串
```

### 2. 推送到 GitHub
```bash
# 在项目根目录 (d:/homework/数据库/final_project)
git init
git add .
git commit -m "Add Vercel deployment configuration"
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

### 3. 通过 Vercel 网站部署
```
1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库
3. Root Directory: my-app
4. 添加环境变量：DATABASE_URL, NODE_ENV
5. 点击 Deploy
```

### 4. 初始化数据库
```bash
cd my-app

# Windows PowerShell
$env:DATABASE_URL="postgresql://..."
npx prisma db push
npx prisma generate
npm run prisma:seed

# Windows CMD
set DATABASE_URL=postgresql://...
npx prisma db push
npx prisma generate
npm run prisma:seed
```

---

## 🔄 使用 Vercel CLI 部署

### 安装和登录
```bash
# 安装 CLI
npm install -g vercel

# 登录
vercel login
```

### 首次部署
```bash
cd my-app

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 配置环境变量
```bash
# 添加环境变量
vercel env add DATABASE_URL
vercel env add NODE_ENV
vercel env add AUTH_SECRET

# 查看环境变量
vercel env ls

# 拉取环境变量到本地
vercel env pull
```

### 查看部署
```bash
# 查看最近的部署
vercel ls

# 查看部署详情
vercel inspect <deployment-url>

# 查看日志
vercel logs <deployment-url>
```

---

## 🗄️ 数据库管理

### Prisma 命令
```bash
cd my-app

# 设置数据库连接（每次需要先设置）
# PowerShell:
$env:DATABASE_URL="postgresql://..."
# CMD:
set DATABASE_URL=postgresql://...

# 推送 schema 到数据库
npx prisma db push

# 生成 Prisma Client
npx prisma generate

# 运行种子数据
npm run prisma:seed

# 打开 Prisma Studio（可视化管理）
npx prisma studio
```

### 查看数据库
```bash
# 打开 Prisma Studio
npx prisma studio

# 访问 http://localhost:5555
```

---

## 🚀 日常更新流程

### 更新代码
```bash
# 1. 修改代码
# 2. 提交并推送
git add .
git commit -m "更新功能"
git push

# Vercel 会自动检测并重新部署
```

### 更新数据库结构
```bash
# 1. 修改 prisma/schema.prisma
# 2. 推送到数据库
$env:DATABASE_URL="postgresql://..."
npx prisma db push

# 3. 提交代码
git add .
git commit -m "更新数据库 schema"
git push
```

---

## 🔍 调试命令

### 本地开发
```bash
cd my-app

# 启动开发服务器
npm run dev

# 在 http://localhost:3000 查看
```

### 本地构建测试
```bash
cd my-app

# 构建
npm run build

# 预览构建结果
npm run preview

# 或直接启动生产服务器
npm start
```

### 查看 Vercel 日志
```bash
# 实时查看日志
vercel logs --follow

# 查看最近的日志
vercel logs

# 查看特定部署的日志
vercel logs <deployment-url>
```

---

## 🎯 项目管理

### 查看项目信息
```bash
# 查看当前项目
vercel project ls

# 查看域名
vercel domains ls

# 查看环境变量
vercel env ls
```

### 域名管理
```bash
# 添加自定义域名
vercel domains add <domain>

# 删除域名
vercel domains rm <domain>
```

### 项目设置
```bash
# 链接本地项目到 Vercel 项目
vercel link

# 切换项目
vercel switch
```

---

## 🔧 故障排除

### 清除构建缓存
```bash
vercel --force
```

### 重新生成 Prisma Client
```bash
cd my-app
rm -rf node_modules/.prisma
npx prisma generate
```

### 检查环境变量
```bash
# 拉取环境变量到本地 .env
vercel env pull .env.local
cat .env.local
```

### 本地测试数据库连接
```bash
cd my-app
$env:DATABASE_URL="postgresql://..."
npx prisma db push --accept-data-loss
```

---

## 📊 常用 npm 脚本

```bash
cd my-app

# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览构建结果
npm start                # 启动生产服务器

# Prisma
npm run prisma:studio    # 打开 Prisma Studio
npm run prisma:generate  # 生成 Prisma Client
npm run prisma:push      # 推送 schema
npm run prisma:seed      # 运行种子数据
npm run db:setup         # 一键设置数据库（generate + push + seed）

# 其他
npm run lint             # 运行 ESLint
```

---

## 🎨 有用的环境变量

### 必需的环境变量
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NODE_ENV=production
```

### 可选的环境变量
```env
# 应用 URL
BASE_URL=https://your-app.vercel.app

# 认证密钥（使用 openssl rand -base64 32 生成）
AUTH_SECRET=your-random-secret-here

# 端口（本地开发）
PORT=3000
```

### 生成随机密钥
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32|ForEach-Object{Get-Random -Max 256}))
```

---

## 🔗 快速链接

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Console**: https://console.neon.tech
- **GitHub Repository**: https://github.com/你的用户名/你的仓库

---

## 💡 提示

- 所有 Vercel CLI 命令都支持 `--help` 查看详细说明
- 使用 `vercel --debug` 可以看到详细的调试信息
- 推送到 main 分支会自动部署到生产环境
- 推送到其他分支会创建预览部署

---

保存此文件以便快速查找命令！📌

