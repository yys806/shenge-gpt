// API Key 管理
const API_KEY_STORAGE_KEY = 'modelscope_api_key';

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
        alert('API Key 已保存');
    } else {
        alert('请输入有效的 API Key');
    }
});

// 绘图功能
const promptInput = document.getElementById('promptInput');
const generateButton = document.getElementById('generateImage');
const clearButton = document.getElementById('clearPrompt');
const imageResult = document.getElementById('imageResult');
const downloadButton = document.getElementById('downloadImage');

// 清空输入
clearButton.addEventListener('click', () => {
    promptInput.value = '';
    promptInput.focus();
});

// 生成图像
generateButton.addEventListener('click', generateImage);

// 回车生成图像（Shift+Enter换行）
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateImage();
    }
});

async function generateImage() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
        alert('请输入图像描述');
        return;
    }

    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
        alert('请先设置 API Key');
        return;
    }

    // 显示生成中状态
    imageResult.innerHTML = '<div class="draw-placeholder">正在生成图像...</div>';
    generateButton.disabled = true;
    downloadButton.disabled = true;

    try {
        // 调用 ModelScope API
        const response = await fetch('https://api-inference.modelscope.cn/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'Qwen/Qwen-Image',
                prompt: prompt
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API调用失败');
        }

        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].url) {
            const imageUrl = data.data[0].url;
            
            // 显示生成的图像
            imageResult.innerHTML = `<img src="${imageUrl}" alt="生成的图像" id="generatedImage">`;
            downloadButton.disabled = false;
            
            // 保存图像URL用于下载
            downloadButton.onclick = () => downloadImage(imageUrl);
        } else {
            imageResult.innerHTML = '<div class="draw-placeholder">生成图像失败，请稍后重试</div>';
        }
        
    } catch (error) {
        console.error('Error:', error);
        imageResult.innerHTML = `<div class="draw-placeholder">生成图像失败：${error.message}</div>`;
    } finally {
        generateButton.disabled = false;
    }
}

function downloadImage(imageUrl) {
    // 创建临时链接下载图像
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-generated-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}