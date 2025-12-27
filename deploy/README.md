# 部署说明

## GitHub Actions CI/CD 配置

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

- `SERVER_HOST`: 服务器 IP 地址或域名
- `SERVER_USER`: 服务器用户名（推荐使用非 root 用户）
- `SERVER_SSH_KEY`: SSH 私钥内容
- `SERVER_PORT`: SSH 端口（默认 22）

### 2. 服务器端准备

#### 2.1 安装 Node.js 和 PM2

```bash
# 安装 Node.js (推荐使用 nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# 全局安装 PM2
npm install -g pm2

# 启动 PM2 在系统启动时运行
pm2 startup
```

#### 2.2 安装 Caddy

```bash
# Ubuntu/Debian
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# 或者使用官方安装方法
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/xcaddy/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-xcaddy-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/xcaddy/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-xcaddy.list
sudo apt update
sudo apt install caddy
```

#### 2.3 设置服务器目录和权限

```bash
# 创建应用目录
sudo mkdir -p /var/www/bookstore
sudo mkdir -p /var/backups/bookstore
sudo chown -R $USER:$USER /var/www/bookstore
sudo chown -R $USER:$USER /var/backups/bookstore

# 创建日志目录
sudo mkdir -p /var/log/bookstore
sudo chown -R $USER:$USER /var/log/bookstore
```

#### 2.4 配置 Caddy

将 `deploy/Caddyfile` 复制到服务器：

```bash
# 复制 Caddyfile 到服务器
sudo cp Caddyfile /etc/caddy/Caddyfile

# 重载 Caddy 配置
sudo systemctl reload caddy
```

### 3. 配置环境变量

在服务器上创建 `.env` 文件：

```bash
# 在 /var/www/bookstore 目录下
cd /var/www/bookstore
cp .env.example .env
nano .env  # 编辑环境变量
```

必要的环境变量：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/bookstore"
PORT=3000
BASE_URL="https://your-domain.com"
```

### 4. 部署脚本使用

服务器端部署脚本 `server-deploy.sh` 提供以下功能：

```bash
# 部署新版本（通常由 GitHub Actions 调用）
./server-deploy.sh deploy

# 手动启动/停止/重启应用
./server-deploy.sh start
./server-deploy.sh stop
./server-deploy.sh restart
```

### 5. PM2 配置

如果需要自定义 PM2 配置，可以创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'bookstore',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/bookstore/error.log',
    out_file: '/var/log/bookstore/out.log',
    log_file: '/var/log/bookstore/combined.log',
    time: true
  }]
};
```

### 6. 数据库迁移

部署过程中会自动运行数据库迁移，但你也可以手动运行：

```bash
cd /var/www/bookstore
npx prisma db push
npx prisma generate
```

### 7. 常用命令

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs bookstore

# 查看 Caddy 状态
sudo systemctl status caddy

# 查看 Caddy 日志
sudo journalctl -u caddy -f

# 手动触发部署（调试用）
./server-deploy.sh deploy
```

### 8. 故障排除

如果部署失败：

1. 检查 GitHub Actions 日志
2. 检查服务器 SSH 连接
3. 检查 PM2 日志: `pm2 logs bookstore`
4. 检查 Caddy 日志: `sudo journalctl -u caddy -f`
5. 检查防火墙设置
6. 检查环境变量配置