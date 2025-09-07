# AI Hub 后端 API

这是 AI Hub 项目的后端 API 服务器，提供用户认证、星座运势、番茄钟、单词本、名言警句和每日打卡等功能。

## 功能特性

- 🔐 用户认证系统（注册、登录、JWT验证）
- 🔮 星座运势查询和记录
- 🍅 番茄钟时间管理
- 📚 个人单词本管理
- 💭 名言警句收藏和打卡
- 📅 每日打卡系统

## 技术栈

- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **MySQL** - 数据库
- **JWT** - 身份验证
- **bcryptjs** - 密码加密

## 安装和运行

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 数据库设置

1. 确保 MySQL 服务正在运行
2. 创建数据库并导入表结构：

```bash
mysql -u root -p < database/schema.sql
```

### 3. 环境变量配置

复制环境变量示例文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，填入你的数据库配置：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_hub
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. 启动服务器

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动

## API 接口文档

### 用户认证

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息（需要认证）

### 星座运势

- `GET /api/horoscope/:zodiac` - 获取指定星座运势
- `POST /api/horoscope/record` - 保存运势记录（需要认证）
- `GET /api/horoscope/history` - 获取运势历史（需要认证）

### 番茄钟

- `POST /api/pomodoro/session` - 记录番茄钟会话（需要认证）
- `GET /api/pomodoro/stats` - 获取番茄钟统计（需要认证）
- `GET /api/pomodoro/history` - 获取番茄钟历史（需要认证）

### 单词本

- `POST /api/vocabulary/word` - 添加单词（需要认证）
- `GET /api/vocabulary/words` - 获取单词列表（需要认证）
- `PUT /api/vocabulary/word/:id` - 更新单词（需要认证）
- `DELETE /api/vocabulary/word/:id` - 删除单词（需要认证）

### 名言警句

- `GET /api/quotes/random` - 获取随机名言
- `POST /api/quotes/save` - 收藏名言（需要认证）
- `GET /api/quotes/saved` - 获取收藏名言（需要认证）
- `DELETE /api/quotes/unsave/:id` - 取消收藏（需要认证）
- `POST /api/quotes/checkin` - 名言打卡（需要认证）
- `GET /api/quotes/checkin/status` - 获取打卡状态（需要认证）

### 每日打卡

- `POST /api/daily/checkin` - 每日打卡（需要认证）
- `GET /api/daily/history` - 获取打卡历史（需要认证）
- `GET /api/daily/stats` - 获取打卡统计（需要认证）

## 认证说明

需要认证的接口需要在请求头中包含 JWT token：

```
Authorization: Bearer <your_jwt_token>
```

## 数据库结构

项目使用 MySQL 数据库，包含以下表：

- `users` - 用户信息
- `horoscope_records` - 星座运势记录
- `pomodoro_records` - 番茄钟记录
- `vocabulary_words` - 单词本
- `saved_quotes` - 收藏名言
- `daily_checkins` - 每日打卡记录

详细的表结构请查看 `database/schema.sql` 文件。

## 开发说明

### 项目结构

```
backend/
├── app.js                 # 主应用文件
├── package.json           # 依赖配置
├── config/
│   └── db.js             # 数据库配置
├── controllers/          # 控制器
├── middleware/           # 中间件
├── models/              # 数据模型
├── routes/              # 路由定义
├── database/
│   └── schema.sql       # 数据库结构
└── env.example          # 环境变量示例
```

### 添加新功能

1. 在 `controllers/` 目录下创建控制器
2. 在 `routes/` 目录下创建路由
3. 在 `app.js` 中注册新路由
4. 如需数据库操作，在 `database/schema.sql` 中添加表结构

## 部署

### 使用 PM2 部署

```bash
npm install -g pm2
pm2 start app.js --name "ai-hub-api"
pm2 save
pm2 startup
```

### 使用 Docker 部署

```bash
# 构建镜像
docker build -t ai-hub-api .

# 运行容器
docker run -d -p 3000:3000 --name ai-hub-api ai-hub-api
```

## 许可证

MIT License
