// 单词本路由
const express = require('express');
const router = express.Router();
const vocabularyController = require('../controllers/vocabularyController');
const authenticate = require('../middleware/auth');

// 添加新单词 (需要认证)
router.post('/word', authenticate, vocabularyController.addWord);

// 获取用户单词列表 (需要认证)
router.get('/words', authenticate, vocabularyController.getWords);

// 更新单词 (需要认证)
router.put('/word/:id', authenticate, vocabularyController.updateWord);

// 删除单词 (需要认证)
router.delete('/word/:id', authenticate, vocabularyController.deleteWord);

module.exports = router;