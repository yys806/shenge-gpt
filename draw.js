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
        showMessage('请输入图像描述', 'error');
        return;
    }

    // 显示生成中状态
    imageResult.innerHTML = '<div class="draw-placeholder">正在生成图像...</div>';
    generateButton.disabled = true;
    downloadButton.disabled = true;

    try {
        // 这里应该是调用Google Nano Banana API的代码
        // 由于Nano Banana是虚构的模型，我们模拟一个API调用
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 模拟生成的图像URL
        const imageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;
        
        // 显示生成的图像
        imageResult.innerHTML = `<img src="${imageUrl}" alt="生成的图像" id="generatedImage">`;
        downloadButton.disabled = false;
        
        // 保存图像URL用于下载
        downloadButton.onclick = () => downloadImage(imageUrl);
        
    } catch (error) {
        console.error('Error:', error);
        imageResult.innerHTML = '<div class="draw-placeholder">生成图像失败，请稍后重试</div>';
    } finally {
        generateButton.disabled = false;
    }
}

function showMessage(content, type = 'info') {
    // 简单的消息提示功能
    alert(`${type.toUpperCase()}: ${content}`);
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