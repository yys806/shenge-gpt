// 名言警句控制器
const db = require('../config/db');

// 获取随机名言
const getRandomQuote = async (req, res) => {
    try {
        // 预定义的名言列表
        const quotes = [
            {
                text: "书山有路勤为径，学海无涯苦作舟。",
                author: "韩愈"
            },
            {
                text: "成功不是将来才有的，而是从决定去做的那一刻起，持续累积而成。",
                author: "俞敏洪"
            },
            {
                text: "人生最大的光荣，不在于永不失败，而在于能屡仆屡起。",
                author: "拿破仑"
            },
            {
                text: "天行健，君子以自强不息。",
                author: "《周易》"
            },
            {
                text: "山不辞土，故能成其高；海不辞水，故能成其深。",
                author: "《管子》"
            }
        ];
        
        const randomIndex = Math.floor(Math.random() * quotes.length);
        res.json(quotes[randomIndex]);
    } catch (error) {
        console.error('获取随机名言错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 收藏名言
const saveQuote = async (req, res) => {
    try {
        const { quote_text, author } = req.body;
        const user_id = req.user.id;
        
        // 验证输入
        if (!quote_text) {
            return res.status(400).json({ message: '请提供名言内容' });
        }
        
        // 检查是否已经收藏
        const checkQuery = `
            SELECT id FROM saved_quotes 
            WHERE user_id = ? AND quote_text = ?
        `;
        const [existing] = await db.execute(checkQuery, [user_id, quote_text]);
        
        if (existing.length > 0) {
            return res.status(400).json({ message: '这句话已经收藏过了' });
        }
        
        const query = `
            INSERT INTO saved_quotes (user_id, quote_text, author)
            VALUES (?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [user_id, quote_text, author]);
        
        res.status(201).json({
            message: '名言收藏成功',
            quote: {
                id: result.insertId,
                user_id,
                quote_text,
                author,
                created_at: new Date()
            }
        });
    } catch (error) {
        console.error('收藏名言错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 获取用户收藏的名言
const getSavedQuotes = async (req, res) => {
    try {
        const user_id = req.user.id;
        
        const query = `
            SELECT * FROM saved_quotes 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;
        
        const [rows] = await db.execute(query, [user_id]);
        res.json(rows);
    } catch (error) {
        console.error('获取收藏名言错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 取消收藏名言
const unsaveQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        const query = `
            DELETE FROM saved_quotes 
            WHERE id = ? AND user_id = ?
        `;
        
        const [result] = await db.execute(query, [id, user_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '收藏记录不存在或无权限删除' });
        }
        
        res.json({ message: '取消收藏成功' });
    } catch (error) {
        console.error('取消收藏名言错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 每日名言打卡
const checkIn = async (req, res) => {
    try {
        const user_id = req.user.id;
        const checkin_date = new Date().toISOString().split('T')[0];
        const checkin_type = 'quote';
        const { reference_id } = req.body;
        
        // 检查是否已经打卡
        const checkQuery = `
            SELECT id FROM daily_checkins 
            WHERE user_id = ? AND checkin_date = ? AND checkin_type = ?
        `;
        const [existing] = await db.execute(checkQuery, [user_id, checkin_date, checkin_type]);
        
        if (existing.length > 0) {
            return res.status(400).json({ message: '今日已经打过卡了' });
        }
        
        const query = `
            INSERT INTO daily_checkins (user_id, checkin_date, checkin_type, reference_id)
            VALUES (?, ?, ?, ?)
        `;
        
        await db.execute(query, [user_id, checkin_date, checkin_type, reference_id]);
        
        res.json({ message: '打卡成功' });
    } catch (error) {
        console.error('名言打卡错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 获取打卡状态
const getCheckInStatus = async (req, res) => {
    try {
        const user_id = req.user.id;
        const checkin_date = new Date().toISOString().split('T')[0];
        const checkin_type = 'quote';
        
        const query = `
            SELECT id FROM daily_checkins 
            WHERE user_id = ? AND checkin_date = ? AND checkin_type = ?
        `;
        
        const [rows] = await db.execute(query, [user_id, checkin_date, checkin_type]);
        
        res.json({
            checked_in: rows.length > 0,
            date: checkin_date
        });
    } catch (error) {
        console.error('获取打卡状态错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

module.exports = {
    getRandomQuote,
    saveQuote,
    getSavedQuotes,
    unsaveQuote,
    checkIn,
    getCheckInStatus
};