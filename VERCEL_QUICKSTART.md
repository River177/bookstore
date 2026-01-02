# 🚀 Vercel 快速部署指南

## ⚡ 3 分钟快速部署

### 1️⃣ 准备数据库（2 分钟）

**使用 Neon（推荐，最简单）：**
1. 访问 https://neon.tech 并注册
2. 点击 "Create a project"
3. 选择区域（建议选择离用户最近的）
4. 复制显示的连接字符串
   ```
   postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
   ```

### 2️⃣ 部署到 Vercel（1 分钟）

**方法 A：一键导入（最简单）**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/your-repo&project-name=online-bookstore&repository-name=online-bookstore&root-directory=my-app)

**方法 B：手动导入**

1. 访问 https://vercel.com/new
2. 导入你的 GitHub 仓库
3. 设置：
   - **Root Directory**: `my-app`
   - 其他保持默认

4. 添加环境变量：
   ```
   DATABASE_URL=你从Neon复制的连接字符串
   NODE_ENV=production
   ```

5. 点击 **Deploy** 🎉

### 3️⃣ 初始化数据库（1 分钟）

部署完成后，在本地运行：

```bash
cd my-app

# 设置数据库URL（使用你从Neon复制的）
export DATABASE_URL="postgresql://user:pass@..."

# 初始化数据库结构
npx prisma db push

# （可选）添加示例数据
npm run prisma:seed
```

### ✅ 完成！

访问 Vercel 给你的 URL（如 `https://your-app.vercel.app`）即可看到你的在线书店！

---

## 🔧 故障排除

### 问题：部署后看到 500 错误
**原因**：数据库未初始化  
**解决**：运行上面的"初始化数据库"步骤

### 问题：Cannot find module '@prisma/client'
**原因**：Prisma Client 未生成  
**解决**：检查 `vercel.json` 中的 `installCommand` 是否包含 `npx prisma generate`

### 问题：数据库连接超时
**原因**：连接字符串错误或未包含 SSL  
**解决**：确保连接字符串末尾有 `?sslmode=require`

---

## 📚 详细文档

查看 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) 了解：
- 详细配置说明
- 环境变量完整列表
- 性能优化建议
- 监控和日志
- 更多故障排除

---

## 💡 提示

- **自动部署**：推送到 GitHub 后，Vercel 会自动重新部署
- **预览部署**：每个 Pull Request 都会获得独立的预览 URL
- **域名绑定**：在 Vercel Dashboard 中可以绑定自定义域名
- **免费额度**：Hobby 计划完全免费，足够个人项目使用

---

祝部署顺利！🎊

