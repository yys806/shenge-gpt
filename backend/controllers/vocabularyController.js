// 单词本控制器
const db = require('../config/db');

// 添加新单词
const addWord = async (req, res) => {
    try {
        const { word, definition, example } = req.body;
        const user_id = req.user.id;
        
        // 验证输入
        if (!word) {
            return res.status(400).json({ message: '请提供单词' });
        }
        
        const query = `
            INSERT INTO vocabulary_words (user_id, word, definition, example)
            VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [user_id, word, definition, example]);
        
        res.status(201).json({
            message: '单词添加成功',
            word: {
                id: result.insertId,
                user_id,
                word,
                definition,
                example,
                created_at: new Date()
            }
        });
    } catch (error) {
        console.error('添加单词错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 获取用户单词列表
const getWords = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { search, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT * FROM vocabulary_words 
            WHERE user_id = ?
        `;
        let params = [user_id];
        
        if (search) {
            query += ` AND (word LIKE ? OR definition LIKE ? OR example LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));
        
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('获取单词列表错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 更新单词
const updateWord = async (req, res) => {
    try {
        const { id } = req.params;
        const { word, definition, example } = req.body;
        const user_id = req.user.id;
        
        // 验证输入
        if (!word) {
            return res.status(400).json({ message: '请提供单词' });
        }
        
        const query = `
            UPDATE vocabulary_words 
            SET word = ?, definition = ?, example = ?
            WHERE id = ? AND user_id = ?
        `;
        
        const [result] = await db.execute(query, [word, definition, example, id, user_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '单词不存在或无权限修改' });
        }
        
        res.json({ message: '单词更新成功' });
    } catch (error) {
        console.error('更新单词错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

// 删除单词
const deleteWord = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        const query = `
            DELETE FROM vocabulary_words 
            WHERE id = ? AND user_id = ?
        `;
        
        const [result] = await db.execute(query, [id, user_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '单词不存在或无权限删除' });
        }
        
        res.json({ message: '单词删除成功' });
    } catch (error) {
        console.error('删除单词错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};

module.exports = {
    addWord,
    getWords,
    updateWord,
    deleteWord
};