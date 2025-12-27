# 项目部署指南

## 项目结构

```
my-app/                   # 应用根目录
├── components/         # Vue 组件
├── lib/                # 工具库
│   ├── stores/         # 状态管理
│   ├── types/          # 类型定义
│   ├── utils/          # 工具函数
│   └── prisma.ts       # Prisma 客户端
├── pages/              # 页面组件 (Vike 路由)
├── prisma/             # Prisma 配置
│   ├── schema.prisma   # 数据库 schema
│   └── seed.ts         # 初始数据
├── server/             # 服务端代码
│   ├── handlers/       # API 处理器
│   └── services/       # 业务服务
├── .env               # 环境变量
├── .env.example       # 环境变量示例
├── package.json       # 依赖配置
├── vite.config.ts     # Vite 配置
├── ecosystem.config.js # PM2 配置
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 部署配置
└── deploy/
    ├── server-deploy.sh    # 服务器部署脚本
    ├── Caddyfile          # Caddy 配置
    └── README.md          # 部署说明
```
