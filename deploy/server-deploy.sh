#!/bin/bash

# 服务器部署脚本
# 使用方法: ./server-deploy.sh [start|stop|restart|deploy]

set -e

# 配置变量
APP_DIR="/var/www/bookstore"
BACKUP_DIR="/var/backups/bookstore"
LOG_FILE="/var/log/bookstore-deploy.log"

# 函数：记录日志
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# 函数：启动应用
start_app() {
    log "启动应用..."
    cd $APP_DIR
    if command -v pm2 &> /dev/null; then
        if pm2 describe bookstore > /dev/null 2>&1; then
            pm2 start bookstore
        else
            pm2 start npm --name "bookstore" -- start
            pm2 save
        fi
        log "应用已启动"
    else
        log "错误: PM2 未安装，请先安装 PM2"
        exit 1
    fi
}

# 函数：停止应用
stop_app() {
    log "停止应用..."
    if command -v pm2 &> /dev/null; then
        if pm2 describe bookstore > /dev/null 2>&1; then
            pm2 stop bookstore
            log "应用已停止"
        else
            log "应用未运行"
        fi
    fi
}

# 函数：重启应用
restart_app() {
    log "重启应用..."
    if command -v pm2 &> /dev/null; then
        if pm2 describe bookstore > /dev/null 2>&1; then
            pm2 reload bookstore
        else
            start_app
        fi
        log "应用已重启"
    fi
}

# 函数：部署新版本
deploy() {
    log "开始部署新版本..."
    
    # 创建目录
    mkdir -p $APP_DIR
    mkdir -p $BACKUP_DIR
    
    # 备份当前版本
    if [ -d "$APP_DIR/dist" ]; then
        log "备份当前版本..."
        BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf $BACKUP_FILE -C $APP_DIR .
        log "备份完成: $BACKUP_FILE"
        
        # 只保留最近5个备份
        cd $BACKUP_DIR
        ls -t backup-*.tar.gz | tail -n +6 | xargs -r rm
    fi
    
    # 停止应用
    stop_app
    
    # 解压新版本
    if [ -f "/tmp/deploy.tar.gz" ]; then
        log "解压新版本..."
        cd $APP_DIR
        tar -xzf /tmp/deploy.tar.gz
        rm /tmp/deploy.tar.gz
    else
        log "错误: 未找到部署包 /tmp/deploy.tar.gz"
        exit 1
    fi
    
    # 安装依赖（如果 package.json 有变化）
    if [ -f "$APP_DIR/package.json" ] && [ -f "$APP_DIR/package-lock.json" ]; then
        log "安装依赖..."
        cd $APP_DIR
        npm ci --production
    fi
    
    # 生成 Prisma Client
    if [ -d "$APP_DIR/prisma" ]; then
        log "生成 Prisma Client..."
        cd $APP_DIR
        npx prisma generate
    fi
    
    # 运行数据库迁移（如果需要）
    log "运行数据库迁移..."
    cd $APP_DIR
    npx prisma db push
    
    # 设置权限
    chmod +x $APP_DIR/dist/server/entry.js
    
    # 启动应用
    start_app
    
    log "部署完成！"
}

# 主逻辑
case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    deploy)
        deploy
        ;;
    *)
        echo "用法: $0 {start|stop|restart|deploy}"
        echo "  start   - 启动应用"
        echo "  stop    - 停止应用"
        echo "  restart - 重启应用"
        echo "  deploy  - 部署新版本"
        exit 1
        ;;
esac