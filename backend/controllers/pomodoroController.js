// 番茄钟控制器
const db = require('../config/db');

// 记录完成的番茄钟 session
const recordPomodoroSession = async (req, res) => {
    try {
        const { date, session_type, duration } = req.body;
        const user_id = req.user.id;
        
        // 获取当天的记录
        let query = `
            SELECT * FROM pomodoro_records 
            WHERE user_id = ? AND date = ?
        `;
        let [rows] = await db.execute(query, [user_id, date]);
        
        let record;
        if (rows.length > 0) {
            // 更新现有记录
            record = rows[0];
            const updateQuery = `
                UPDATE pomodoro_records 
                SET completed_sessions = completed_sessions + 1,
                    total_focus_minutes = total_focus_minutes + ?
                WHERE id = ?
            `;
            await db.execute(updateQuery, [duration, record.id]);
        } else {
            // 创建新记录
            const insertQuery = `
                INSERT INTO pomodoro_records (user_id, date, completed_sessions, total_focus_minutes)
                VALUES (?, ?, 1, ?)
            `;
            const [result] = await db.execute(insertQuery, [user_id, date, duration]);
            record = { id: result.insertId, user_id, date, completed_sessions: 1, total_focus_minutes: duration };
        }
        
        res.json({ message: '番茄钟记录保存成功', record });
    } catch (error) {
        console.error('记录番茄钟错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 获取用户番茄钟统计
const getPomodoroStats = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { date_range } = req.query;
        
        let query;
        let params = [user_id];
        
        if (date_range === 'week') {
            query = `
                SELECT 
                    SUM(completed_sessions) as total_sessions,
                    SUM(total_focus_minutes) as total_minutes,
                    COUNT(*) as active_days
                FROM pomodoro_records 
                WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            `;
        } else if (date_range === 'month') {
            query = `
                SELECT 
                    SUM(completed_sessions) as total_sessions,
                    SUM(total_focus_minutes) as total_minutes,
                    COUNT(*) as active_days
                FROM pomodoro_records 
                WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            `;
        } else {
            query = `
                SELECT 
                    SUM(completed_sessions) as total_sessions,
                    SUM(total_focus_minutes) as total_minutes,
                    COUNT(*) as active_days
                FROM pomodoro_records 
                WHERE user_id = ?
            `;
        }
        
        const [rows] = await db.execute(query, params);
        res.json(rows[0] || { total_sessions: 0, total_minutes: 0, active_days: 0 });
    } catch (error) {
        console.error('获取番茄钟统计错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 获取用户番茄钟历史记录
const getPomodoroHistory = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { limit = 30 } = req.query;
        
        const query = `
            SELECT * FROM pomodoro_records 
            WHERE user_id = ? 
            ORDER BY date DESC 
            LIMIT ?
        `;
        
        const [rows] = await db.execute(query, [user_id, parseInt(limit)]);
        res.json(rows);
    } catch (error) {
        console.error('获取番茄钟历史错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

module.exports = {
    recordPomodoroSession,
    getPomodoroStats,
    getPomodoroHistory
};