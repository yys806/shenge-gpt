// 每日打卡控制器
const db = require('../config/db');

// 每日打卡
const checkIn = async (req, res) => {
    try {
        const { checkin_type, reference_id } = req.body;
        const user_id = req.user.id;
        const checkin_date = new Date().toISOString().split('T')[0];
        
        // 验证打卡类型
        const validTypes = ['quote', 'vocabulary', 'pomodoro'];
        if (!validTypes.includes(checkin_type)) {
            return res.status(400).json({ message: '无效的打卡类型' });
        }
        
        // 检查是否已经打卡
        const checkQuery = `
            SELECT id FROM daily_checkins 
            WHERE user_id = ? AND checkin_date = ? AND checkin_type = ?
        `;
        const [existing] = await db.execute(checkQuery, [user_id, checkin_date, checkin_type]);
        
        if (existing.length > 0) {
            return res.status(400).json({ message: '今日该类型已经打过卡了' });
        }
        
        const query = `
            INSERT INTO daily_checkins (user_id, checkin_date, checkin_type, reference_id)
            VALUES (?, ?, ?, ?)
        `;
        
        await db.execute(query, [user_id, checkin_date, checkin_type, reference_id]);
        
        res.json({ message: '打卡成功' });
    } catch (error) {
        console.error('每日打卡错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 获取用户打卡历史
const getCheckInHistory = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { date_range } = req.query;
        
        let query = `
            SELECT * FROM daily_checkins 
            WHERE user_id = ?
        `;
        let params = [user_id];
        
        if (date_range === 'week') {
            query += ` AND checkin_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
        } else if (date_range === 'month') {
            query += ` AND checkin_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
        }
        
        query += ` ORDER BY checkin_date DESC, created_at DESC`;
        
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('获取打卡历史错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 获取用户打卡统计
const getCheckInStats = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { date_range } = req.query;
        
        let query = `
            SELECT 
                checkin_type,
                COUNT(*) as count
            FROM daily_checkins 
            WHERE user_id = ?
        `;
        let params = [user_id];
        
        if (date_range === 'week') {
            query += ` AND checkin_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
        } else if (date_range === 'month') {
            query += ` AND checkin_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
        }
        
        query += ` GROUP BY checkin_type`;
        
        const [rows] = await db.execute(query, params);
        
        // 格式化统计数据
        const stats = {
            quote: 0,
            vocabulary: 0,
            pomodoro: 0
        };
        
        rows.forEach(row => {
            stats[row.checkin_type] = row.count;
        });
        
        res.json(stats);
    } catch (error) {
        console.error('获取打卡统计错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

module.exports = {
    checkIn,
    getCheckInHistory,
    getCheckInStats
};