// 认证控制器
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 生成JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'ai_hub_secret', {
        expiresIn: '7d'
    });
};

// 注册
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 验证输入
        if (!username || !email || !password) {
            return res.status(400).json({ message: '请提供用户名、邮箱和密码' });
        }
        
        // 检查用户是否已存在
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }
        
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ message: '邮箱已被注册' });
        }
        
        // 创建新用户
        const userId = await User.create({ username, email, password });
        
        // 生成token
        const token = generateToken(userId);
        
        res.status(201).json({
            message: '用户注册成功',
            token,
            user: {
                id: userId,
                username,
                email
            }
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 登录
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ message: '请提供用户名和密码' });
        }
        
        // 查找用户
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }
        
        // 验证密码
        const isPasswordValid = await User.validatePassword(user, password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }
        
        // 生成token
        const token = generateToken(user.id);
        
        res.json({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 获取用户信息
const getProfile = async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                created_at: req.user.created_at
            }
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

module.exports = {
    register,
    login,
    getProfile
};