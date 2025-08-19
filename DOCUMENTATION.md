# Hacker News Clone - 项目文档

## 项目概述

这是一个基于 Next.js 和 Hono.js 构建的 Hacker News 克隆应用，包含完整的前后端功能。

## 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **构建工具**: Next.js

### 后端
- **框架**: Hono.js
- **运行时**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **认证**: JWT (JSON Web Tokens)
- **ORM**: Drizzle ORM

## 项目结构

```
hn-clone/
├── backend/                 # 后端代码 (Hono.js + Cloudflare Workers)
│   ├── src/
│   │   ├── auth/           # 认证相关
│   │   │   ├── jwt.ts      # JWT 处理
│   │   │   └── middleware.ts # 认证中间件
│   │   ├── db/             # 数据库相关
│   │   │   ├── client.ts   # 数据库客户端
│   │   │   └── schema.ts   # 数据库表结构
│   │   ├── routes/         # API 路由
│   │   │   ├── auth.ts     # 认证路由
│   │   │   ├── posts.ts    # 帖子路由
│   │   │   ├── comments.ts # 评论路由
│   │   │   └── votes.ts    # 投票路由
│   │   └── types.ts        # TypeScript 类型定义
│   ├── wrangler.toml      # Cloudflare Workers 配置
│   └── package.json
├── frontend/               # 前端代码 (Next.js)
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   │   ├── page.tsx   # 首页
│   │   │   ├── login/     # 登录页面
│   │   │   ├── register/  # 注册页面
│   │   │   ├── submit/    # 提交页面
│   │   │   └── post/[id]/ # 帖子详情页
│   │   ├── components/    # React 组件
│   │   │   ├── PostList.tsx
│   │   │   └── Header.tsx
│   │   ├── services/      # API 服务
│   │   │   └── api.ts     # API 调用封装
│   │   └── types.ts       # TypeScript 类型定义
│   ├── next.config.ts     # Next.js 配置
│   └── package.json
├── shared/                # 共享代码包 (当前未使用)
│   └── src/
└── README.md
```

## 功能特性

### ✅ 已实现功能
1. **用户认证**
   - 用户注册
   - 用户登录
   - JWT 令牌管理

2. **帖子管理**
   - 查看热门帖子
   - 查看最新帖子
   - 提交新帖子（链接或文本）
   - 帖子详情页

3. **互动功能**
   - 帖子投票（点赞/点踩）
   - 评论系统
   - 评论回复

4. **数据持久化**
   - 用户数据存储
   - 帖子数据存储
   - 评论数据存储
   - 投票数据存储

## API 接口

### 认证接口
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录

### 帖子接口
- `GET /posts/hot` - 获取热门帖子
- `GET /posts/new` - 获取最新帖子
- `GET /posts/:id` - 获取单个帖子
- `POST /posts/submit` - 提交新帖子

### 评论接口
- `GET /comments/post/:id` - 获取帖子评论
- `POST /comments/post/:id` - 添加评论

### 投票接口
- `POST /votes/post/:id` - 投票

## 环境配置

### 本地开发
1. **后端**
   ```bash
   cd backend
   npm install
   npm run dev  # 启动在 localhost:8787
   ```

2. **前端**
   ```bash
   cd frontend
   npm install
   npm run dev  # 启动在 localhost:3000
   ```

### 环境变量
创建 `.env` 文件：
```
JWT_SECRET=your_jwt_secret_here
```

## 部署状态

### ✅ 前端部署
- **平台**: Cloudflare Pages
- **URL**: https://7cff9efd.hn-clone-frontend.pages.dev
- **状态**: ✅ 部署成功，可正常访问

### ⚠️ 后端部署
- **平台**: Cloudflare Workers
- **Worker名称**: hn-clone-api
- **状态**: ⚠️ 部署成功，但需要配置环境变量

### 需要解决的问题
1. **后端环境变量配置**
   - 在 Cloudflare Dashboard 中配置 JWT_SECRET
   - 确保 D1 数据库绑定正确

## 开发指南

### 添加新功能
1. 在 `backend/src/routes/` 中添加新的路由文件
2. 在 `frontend/src/components/` 中添加对应的 React 组件
3. 更新 API 服务调用

### 数据库迁移
使用 Drizzle Kit 进行数据库迁移：
```bash
cd backend
npx drizzle-kit generate:sqlite
npx drizzle-kit migrate:sqlite
```

### 测试
```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test
```

## 故障排除

### 常见问题
1. **TypeScript 编译错误**
   - 检查类型定义是否正确
   - 确保所有依赖已安装

2. **数据库连接错误**
   - 检查 D1 数据库配置
   - 确认数据库绑定正确

3. **部署失败**
   - 检查环境变量配置
   - 确认 Cloudflare 账户权限

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。

