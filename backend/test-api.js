// API 测试脚本
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 测试数据
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123'
};

let authToken = '';

async function testAPI() {
    console.log('🚀 开始测试 AI Hub API...\n');

    try {
        // 1. 测试用户注册
        console.log('1. 测试用户注册...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
        console.log('✅ 注册成功:', registerResponse.data.message);
        authToken = registerResponse.data.token;
        console.log('Token:', authToken.substring(0, 20) + '...\n');

        // 2. 测试用户登录
        console.log('2. 测试用户登录...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            username: testUser.username,
            password: testUser.password
        });
        console.log('✅ 登录成功:', loginResponse.data.message);
        console.log('');

        // 3. 测试获取用户信息
        console.log('3. 测试获取用户信息...');
        const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ 获取用户信息成功:', profileResponse.data.user.username);
        console.log('');

        // 4. 测试获取随机名言
        console.log('4. 测试获取随机名言...');
        const quoteResponse = await axios.get(`${BASE_URL}/quotes/random`);
        console.log('✅ 获取名言成功:', quoteResponse.data.text);
        console.log('作者:', quoteResponse.data.author);
        console.log('');

        // 5. 测试收藏名言
        console.log('5. 测试收藏名言...');
        const saveQuoteResponse = await axios.post(`${BASE_URL}/quotes/save`, {
            quote_text: quoteResponse.data.text,
            author: quoteResponse.data.author
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ 收藏名言成功:', saveQuoteResponse.data.message);
        console.log('');

        // 6. 测试添加单词
        console.log('6. 测试添加单词...');
        const addWordResponse = await axios.post(`${BASE_URL}/vocabulary/word`, {
            word: 'test',
            definition: '测试',
            example: 'This is a test example.'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ 添加单词成功:', addWordResponse.data.message);
        console.log('');

        // 7. 测试记录番茄钟
        console.log('7. 测试记录番茄钟...');
        const pomodoroResponse = await axios.post(`${BASE_URL}/pomodoro/session`, {
            date: new Date().toISOString().split('T')[0],
            session_type: 'focus',
            duration: 25
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ 记录番茄钟成功:', pomodoroResponse.data.message);
        console.log('');

        // 8. 测试每日打卡
        console.log('8. 测试每日打卡...');
        const checkinResponse = await axios.post(`${BASE_URL}/daily/checkin`, {
            checkin_type: 'quote',
            reference_id: 1
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ 每日打卡成功:', checkinResponse.data.message);
        console.log('');

        // 9. 测试获取星座运势
        console.log('9. 测试获取星座运势...');
        const horoscopeResponse = await axios.get(`${BASE_URL}/horoscope/aries`);
        console.log('✅ 获取星座运势成功:', horoscopeResponse.data.sign);
        console.log('运势:', horoscopeResponse.data.luck + '星');
        console.log('');

        console.log('🎉 所有测试通过！API 运行正常。');

    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('详细错误:', error.response.data);
        }
    }
}

// 运行测试
testAPI();
