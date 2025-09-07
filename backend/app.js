// 主应用文件
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 检查是否为无服务器环境
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
const authRoutes = require('./routes/auth');
const horoscopeRoutes = require('./routes/horoscope');
const pomodoroRoutes = require('./routes/pomodoro');
const vocabularyRoutes = require('./routes/vocabulary');
const quotesRoutes = require('./routes/quotes');
const dailyCheckinRoutes = require('./routes/dailyCheckin');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/daily', dailyCheckinRoutes);

// 根路径
app.get('/', (req, res) => {
    res.json({ message: 'AI Hub API 服务器正在运行' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服务器内部错误' });
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({ message: '请求的资源不存在' });
});

// 只在非无服务器环境下启动服务器
if (!isServerless) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`AI Hub API 服务器正在端口 ${PORT} 上运行`);
    });
}

module.exports = app;