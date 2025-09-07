// 认证中间件
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    try {
        // 从请求头获取token
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '访问被拒绝，缺少认证token' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        
        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ai_hub_secret');
        
        // 查找用户
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: '用户不存在' });
        }
        
        // 将用户信息添加到请求对象
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: '无效的认证token' });
    }
};

module.exports = authenticate;