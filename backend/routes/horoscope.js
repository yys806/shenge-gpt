// 星座运势路由
const express = require('express');
const router = express.Router();
const horoscopeController = require('../controllers/horoscopeController');
const authenticate = require('../middleware/auth');

// 获取指定星座运势
router.get('/:zodiac', horoscopeController.getHoroscope);

// 保存星座运势记录 (需要认证)
router.post('/record', authenticate, horoscopeController.saveHoroscopeRecord);

// 获取用户运势历史 (需要认证)
router.get('/history', authenticate, horoscopeController.getHoroscopeHistory);

module.exports = router;