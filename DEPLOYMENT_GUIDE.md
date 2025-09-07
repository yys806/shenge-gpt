# AI Hub 部署指南

## 🚀 快速部署到 Vercel

### 方案一：使用 PlanetScale 数据库（推荐）

#### 1. 设置数据库

1. **注册 PlanetScale**
   - 访问 [PlanetScale](https://planetscale.com/)
   - 创建免费账户
   - 创建新数据库

2. **获取数据库连接信息**
   - 在 PlanetScale 控制台获取连接字符串
   - 记录以下信息：
     - Host
     - Username  
     - Password
     - Database name

#### 2. 部署到 Vercel

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Add backend API and deployment config"
   git push origin main
   ```

2. **在 Vercel 部署**
   - 访问 [Vercel](https://vercel.com/)
   - 连接 GitHub 仓库
   - 导入项目

3. **配置环境变量**
   在 Vercel 项目设置中添加：
   ```
   DATABASE_HOST=your-planetscale-host
   DATABASE_USERNAME=your-username
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=your-database-name
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=production
   ```

4. **部署**
   - Vercel 会自动检测配置并部署
   - 等待部署完成

#### 3. 初始化数据库

1. **连接 PlanetScale**
   ```bash
   # 安装 PlanetScale CLI
   npm install -g @planetscale/cli
   
   # 登录
   pscale auth login
   
   # 连接数据库
   pscale connect your-database-name main --port 3309
   ```

2. **导入数据库结构**
   ```bash
   mysql -h 127.0.0.1 -P 3309 -u your-username -p < backend/database/schema.sql
   ```

### 方案二：使用 Supabase 数据库

#### 1. 设置 Supabase

1. **注册 Supabase**
   - 访问 [Supabase](https://supabase.com/)
   - 创建新项目

2. **获取连接信息**
   - 在项目设置中获取数据库连接字符串
   - 记录连接信息

#### 2. 修改数据库配置

更新 `backend/config/db.js`：
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

#### 3. 部署到 Vercel

按照方案一的步骤2-4进行部署。

### 方案三：使用 Vercel Postgres

#### 1. 在 Vercel 添加 Postgres

1. 在 Vercel 项目设置中添加 Postgres 数据库
2. 获取连接字符串

#### 2. 修改数据库配置

更新 `backend/config/db.js`：
```javascript
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
```

## 🔧 前端部署

### 1. 更新API配置

在 `src/common/api.js` 中更新生产环境URL：
```javascript
production: {
    baseURL: 'https://your-vercel-app.vercel.app/api',
    timeout: 10000
}
```

### 2. 部署前端

前端会自动部署到 Vercel，因为 `vercel.json` 已经配置了静态文件部署。

## 🧪 测试部署

### 1. 测试API端点

访问你的 Vercel URL：
```
https://your-app.vercel.app/api/auth/profile
```

### 2. 测试前端功能

1. 访问前端页面
2. 尝试注册/登录
3. 测试各个功能模块

## 📝 部署检查清单

- [ ] 数据库服务已设置
- [ ] 环境变量已配置
- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建
- [ ] 数据库结构已导入
- [ ] API 端点测试通过
- [ ] 前端功能测试通过

## 🚨 常见问题

### 1. 数据库连接失败
- 检查环境变量是否正确
- 确认数据库服务是否运行
- 检查网络连接

### 2. API 返回 500 错误
- 检查 Vercel 函数日志
- 确认数据库表结构是否正确
- 检查 JWT 密钥配置

### 3. 前端无法连接后端
- 检查 API 配置中的 URL
- 确认 CORS 设置
- 检查网络请求

## 📞 技术支持

如果遇到问题，请检查：
1. Vercel 部署日志
2. 浏览器控制台错误
3. 网络请求状态

## 🎉 部署完成

部署成功后，你的 AI Hub 应用将可以：
- 用户注册和登录
- 使用所有功能模块
- 数据持久化存储
- 全球CDN加速访问
