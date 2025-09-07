// 每日打卡路由
const express = require('express');
const router = express.Router();
const dailyCheckinController = require('../controllers/dailyCheckinController');
const authenticate = require('../middleware/auth');

// 每日打卡 (需要认证)
router.post('/checkin', authenticate, dailyCheckinController.checkIn);

// 获取用户打卡历史 (需要认证)
router.get('/history', authenticate, dailyCheckinController.getCheckInHistory);

// 获取用户打卡统计 (需要认证)
router.get('/stats', authenticate, dailyCheckinController.getCheckInStats);

module.exports = router;