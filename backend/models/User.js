// 用户模型
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    // 创建新用户
    static async create(userData) {
        const { username, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        return result.insertId;
    }
    
    // 根据用户名查找用户
    static async findByUsername(username) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }
    
    // 根据邮箱查找用户
    static async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }
    
    // 根据ID查找用户
    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }
    
    // 验证密码
    static async validatePassword(user, password) {
        return await bcrypt.compare(password, user.password);
    }
}

module.exports = User;
        
        const query = `
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [username, email, hashedPassword]);
        return result.insertId;
    }
    
    // 根据用户名查找用户
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await db.execute(query, [username]);
        return rows[0];
    }
    
    // 根据邮箱查找用户
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows[0];
    }
    
    // 根据ID查找用户
    static async findById(id) {
        const query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }
    
    // 验证密码
    static async validatePassword(user, password) {
        return await bcrypt.compare(password, user.password_hash);
    }
}

module.exports = User;