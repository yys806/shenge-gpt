// 用户认证功能

// 登录表单处理
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('请填写用户名和密码', 'error');
        return;
    }
    
    try {
        showMessage('正在登录...', 'info');
        
        // 调用后端API进行登录
        const response = await API.post('/auth/login', {
            username: username,
            password: password
        });
        
        // 保存token和用户信息
        API.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        showMessage('登录成功！', 'success');
        
        // 延迟跳转
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 1000);
        
    } catch (error) {
        showMessage(error.message || '登录失败', 'error');
    }
});

// 注册表单处理
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 简单验证
    if (password !== confirmPassword) {
        showMessage('密码和确认密码不匹配', 'error');
        return;
    }
    
    if (!username || !email || !password) {
        showMessage('请填写所有字段', 'error');
        return;
    }
    
    try {
        showMessage('正在注册...', 'info');
        
        // 调用后端API进行注册
        const response = await API.post('/auth/register', {
            username: username,
            email: email,
            password: password
        });
        
        // 保存token和用户信息
        API.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        showMessage('注册成功！', 'success');
        
        // 延迟跳转
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 1000);
        
    } catch (error) {
        showMessage(error.message || '注册失败', 'error');
    }
});

// 检查用户是否已登录
function checkLoginStatus() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
}

// 获取当前用户信息
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// 登出功能
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    API.clearToken();
    window.location.href = 'login.html';
}

// 显示消息
function showMessage(message, type = 'info') {
    // 移除现有消息
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // 添加到页面
    document.body.appendChild(messageDiv);
    
    // 自动移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    if (checkLoginStatus()) {
        const user = getCurrentUser();
        console.log('用户已登录:', user.username);
    }
});