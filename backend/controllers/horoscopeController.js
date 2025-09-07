// 星座运势控制器
const db = require('../config/db');

// 获取星座运势
const getHoroscope = async (req, res) => {
    try {
        const { zodiac } = req.params;
        
        // 这里应该调用真实的星座运势API
        // 目前使用模拟数据
        const zodiacSigns = {
            aries: { name: "白羊座", dates: "3/21-4/19" },
            taurus: { name: "金牛座", dates: "4/20-5/20" },
            gemini: { name: "双子座", dates: "5/21-6/21" },
            cancer: { name: "巨蟹座", dates: "6/22-7/22" },
            leo: { name: "狮子座", dates: "7/23-8/22" },
            virgo: { name: "处女座", dates: "8/23-9/22" },
            libra: { name: "天秤座", dates: "9/23-10/23" },
            scorpio: { name: "天蝎座", dates: "10/24-11/22" },
            sagittarius: { name: "射手座", dates: "11/23-12/21" },
            capricorn: { name: "摩羯座", dates: "12/22-1/19" },
            aquarius: { name: "水瓶座", dates: "1/20-2/18" },
            pisces: { name: "双鱼座", dates: "2/19-3/20" }
        };
        
        const zodiacData = zodiacSigns[zodiac];
        if (!zodiacData) {
            return res.status(400).json({ message: '无效的星座参数' });
        }
        
        // 生成模拟运势数据
        const luckLevels = [1, 2, 3, 4, 5];
        const randomLuck = luckLevels[Math.floor(Math.random() * luckLevels.length)];
        
        const horoscope = {
            sign: zodiacData.name,
            date: new Date().toLocaleDateString('zh-CN'),
            luck: randomLuck,
            love: luckLevels[Math.floor(Math.random() * luckLevels.length)],
            work: luckLevels[Math.floor(Math.random() * luckLevels.length)],
            health: luckLevels[Math.floor(Math.random() * luckLevels.length)],
            fortuneText: "今天是展现自己才能的好时机，不要害怕表达自己的想法。",
            suggestion: "建议多与人交流，分享你的想法。"
        };
        
        res.json(horoscope);
    } catch (error) {
        console.error('获取星座运势错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 保存星座运势记录
const saveHoroscopeRecord = async (req, res) => {
    try {
        const { zodiac_sign, date, luck_level, love_level, work_level, health_level, fortune_text, suggestion } = req.body;
        const user_id = req.user.id;
        
        const query = `
            INSERT INTO horoscope_records 
            (user_id, zodiac_sign, date, luck_level, love_level, work_level, health_level, fortune_text, suggestion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            luck_level = VALUES(luck_level),
            love_level = VALUES(love_level),
            work_level = VALUES(work_level),
            health_level = VALUES(health_level),
            fortune_text = VALUES(fortune_text),
            suggestion = VALUES(suggestion)
        `;
        
        await db.execute(query, [
            user_id, zodiac_sign, date, luck_level, love_level, work_level, health_level, fortune_text, suggestion
        ]);
        
        res.json({ message: '运势记录保存成功' });
    } catch (error) {
        console.error('保存星座运势记录错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 获取用户运势历史
const getHoroscopeHistory = async (req, res) => {
    try {
        const user_id = req.user.id;
        
        const query = `
            SELECT * FROM horoscope_records 
            WHERE user_id = ? 
            ORDER BY date DESC 
            LIMIT 30
        `;
        
        const [rows] = await db.execute(query, [user_id]);
        res.json(rows);
    } catch (error) {
        console.error('获取运势历史错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

module.exports = {
    getHoroscope,
    saveHoroscopeRecord,
    getHoroscopeHistory
};