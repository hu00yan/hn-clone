# Cloudflare 原生部署指南

本项目使用 Cloudflare 的原生 Git 集成实现自动部署，无需 GitHub Actions。

## 🚀 部署步骤

### 1. 前端部署 (Cloudflare Pages)

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 导航到 **Pages** → **创建项目**
3. 选择 **连接到 Git** → 选择你的 GitHub 仓库
4. 配置构建设置：
   ```
   项目名称: hn-clone-frontend
   生产分支: main
   构建命令: cd frontend && pnpm install && pnpm run build && pnpm run export
   构建输出目录: frontend/out
   根目录: / (留空)
   ```
5. 点击 **保存并部署**

### 2. 后端部署 (Cloudflare Workers)

1. 在 Cloudflare Dashboard 中导航到 **Workers & Pages**
2. 选择 **创建应用程序**
3. 选择 **Pages** → **连接到 Git**
4. 选择相同的 GitHub 仓库
5. 配置设置：
   ```
   项目名称: hn-clone-backend
   生产分支: main
   构建命令: cd backend && pnpm install
   输出目录: backend
   ```

### 3. 环境变量配置

#### 前端环境变量 (Pages)
在 Pages 项目设置中添加：
```
NEXT_PUBLIC_API_URL=https://your-worker-name.your-subdomain.workers.dev
```

#### 后端环境变量 (Workers)
在 Workers 项目设置中添加：
```
JWT_SECRET=你的强密码密钥  # 使用 openssl rand -base64 32 生成
```

### 4. 数据库配置

确保你的 D1 数据库已创建并应用了迁移：
```bash
npx wrangler d1 create hn-clone-db
npx wrangler d1 migrations apply hn-clone-db --remote
```

## ✨ 自动部署

配置完成后，每次推送到 `main` 分支都会触发：
- 前端自动构建和部署到 Cloudflare Pages
- 后端自动部署到 Cloudflare Workers

## 🔧 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建项目
pnpm build
```

## 📋 部署检查清单

- [ ] GitHub 仓库已推送最新代码
- [ ] Cloudflare Pages 项目已配置
- [ ] Cloudflare Workers 项目已配置
- [ ] 环境变量已设置
- [ ] D1 数据库已创建和迁移
- [ ] 域名已配置（可选）

## 🛡️ 安全注意事项

- JWT_SECRET 必须在生产环境中设置为强密码
- 数据库 ID 和 API 密钥不应硬编码在代码中
- 使用 Cloudflare 的环境变量管理敏感信息

## 📞 技术支持

如遇到部署问题，请检查：
1. Cloudflare Dashboard 中的构建日志
2. Workers 的运行时日志
3. Pages 的部署状态

---

**注意**: 此方法比 GitHub Actions 更简单，因为它使用 Cloudflare 的原生 Git 集成，减少了配置复杂性。