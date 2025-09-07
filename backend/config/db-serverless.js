// 无服务器数据库配置 - 使用 PlanetScale
const mysql = require('mysql2/promise');

// PlanetScale 连接配置
const dbConfig = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
        rejectUnauthorized: true
    },
    // 无服务器环境下的连接配置
    connectionLimit: 1,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

module.exports = pool;
