// 番茄钟路由
const express = require('express');
const router = express.Router();
const pomodoroController = require('../controllers/pomodoroController');
const authenticate = require('../middleware/auth');

// 记录完成的番茄钟 session (需要认证)
router.post('/session', authenticate, pomodoroController.recordPomodoroSession);

// 获取用户番茄钟统计 (需要认证)
router.get('/stats', authenticate, pomodoroController.getPomodoroStats);

// 获取用户番茄钟历史记录 (需要认证)
router.get('/history', authenticate, pomodoroController.getPomodoroHistory);

module.exports = router;