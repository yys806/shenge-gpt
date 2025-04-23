// API Key 管理
const API_KEY_STORAGE_KEY = 'deepseek_api_key';

// 保存 API Key
document.getElementById('saveApiKey').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (apiKey) {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        alert('API Key 已保存');
    } else {
        alert('请输入有效的 API Key');
    }
});

// 加载保存的 API Key
window.addEventListener('load', () => {
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }
});

// 聊天功能
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendMessage');

// 添加消息到聊天界面
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
        alert('请先设置 API Key');
        return;
    }

    // 添加用户消息
    addMessage(message, true);
    userInput.value = '';

    try {
        // 调用 DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: message }],
                model: 'deepseek-chat'
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            addMessage(data.choices[0].message.content);
        } else {
            addMessage('抱歉，我无法处理您的请求。请检查 API Key 是否正确。');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('抱歉，发生了错误。请稍后重试。');
    }
}

// 发送按钮点击事件
sendButton.addEventListener('click', sendMessage);

// 回车发送消息
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}); 