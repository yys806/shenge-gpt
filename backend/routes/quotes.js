// 名言警句路由
const express = require('express');
const router = express.Router();
const quotesController = require('../controllers/quotesController');
const authenticate = require('../middleware/auth');

// 获取随机名言
router.get('/random', quotesController.getRandomQuote);

// 收藏名言 (需要认证)
router.post('/save', authenticate, quotesController.saveQuote);

// 获取用户收藏的名言 (需要认证)
router.get('/saved', authenticate, quotesController.getSavedQuotes);

// 取消收藏名言 (需要认证)
router.delete('/unsave/:id', authenticate, quotesController.unsaveQuote);

// 每日名言打卡 (需要认证)
router.post('/checkin', authenticate, quotesController.checkIn);

// 获取打卡状态 (需要认证)
router.get('/checkin/status', authenticate, quotesController.getCheckInStatus);

module.exports = router;