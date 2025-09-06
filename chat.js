// API Key 管理
const API_KEY_STORAGE_KEY = 'google_ai_api_key';

// 页面加载时恢复保存的 API Key
window.addEventListener('load', () => {
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }
});

// 保存 API Key
document.getElementById('saveApiKey').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (apiKey) {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        showMessage('API Key 已保存', 'system');
    } else {
        showMessage('请输入有效的 API Key', 'error');
    }
});

// 清空聊天记录
document.getElementById('clearChat').addEventListener('click', () => {
    const chatMessages = document.getElementById('chatMessages');
    // 保留第一条欢迎消息
    chatMessages.innerHTML = `
        <div class="message ai-message">
            <div class="message-content">
                您好！我是您的AI助手，我可以帮助您回答问题、提供信息或进行创意讨论。请在下方输入框中输入您的问题，然后点击发送或按回车键。
            </div>
            <div class="message-time">现在</div>
        </div>
    `;
});

// 聊天功能
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendMessage');

// 显示消息
function showMessage(content, type = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
        showMessage('请先设置 API Key', 'error');
        return;
    }

    // 显示用户消息
    showMessage(message, 'user');
    userInput.value = '';

    // 显示"AI正在思考"消息
    const thinkingMessage = document.createElement('div');
    thinkingMessage.className = 'message ai-message thinking';
    thinkingMessage.innerHTML = `
        <div class="message-content">AI正在思考中...</div>
        <div class="message-time">现在</div>
    `;
    chatMessages.appendChild(thinkingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        // 调用 Google AI API (Gemini)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        // 移除"AI正在思考"消息
        chatMessages.removeChild(thinkingMessage);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API调用失败');
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            showMessage(aiResponse, 'ai');
        } else {
            showMessage('抱歉，AI未能生成回复。请稍后重试。', 'error');
        }
    } catch (error) {
        // 移除"AI正在思考"消息
        if (chatMessages.contains(thinkingMessage)) {
            chatMessages.removeChild(thinkingMessage);
        }
        
        console.error('Error:', error);
        showMessage(`错误: ${error.message}`, 'error');
    }
}

// 发送按钮点击事件
sendButton.addEventListener('click', sendMessage);

// 回车发送消息（支持Shift+Enter换行）
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});