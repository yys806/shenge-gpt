// 游戏状态
let gameState = {
    score: 0,
    round: 1,
    maxRounds: 5,
    isDrawing: false,
    lastX: 0,
    lastY: 0
};

// 获取DOM元素
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const roundElement = document.getElementById('round');
const aiGuessElement = document.getElementById('aiGuess');
const submitButton = document.getElementById('submitDrawing');
const nextButton = document.getElementById('nextRound');
const clearButton = document.getElementById('clearCanvas');

// 初始化画布
function initCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
}

// 设置画笔颜色
function setPenColor(color) {
    ctx.strokeStyle = color;
}

// 清空画布
function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 开始绘制
function startDrawing(e) {
    gameState.isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    gameState.lastX = e.clientX - rect.left;
    gameState.lastY = e.clientY - rect.top;
}

// 绘制过程
function draw(e) {
    if (!gameState.isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(gameState.lastX, gameState.lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    gameState.lastX = currentX;
    gameState.lastY = currentY;
}

// 停止绘制
function stopDrawing() {
    gameState.isDrawing = false;
}

// 提交绘画
function submitDrawing() {
    if (isCanvasBlank()) {
        alert('请先绘制一些内容');
        return;
    }
    
    // 禁用提交按钮
    submitButton.disabled = true;
    
    // 显示AI识别过程
    aiGuessElement.innerHTML = '<div>AI正在识别中...</div>';
    
    // 模拟API调用延迟
    setTimeout(() => {
        // 这里应该调用AI图像识别API
        // 为了演示，我们生成一些可能的猜测和概率
        const guesses = [
            { word: '苹果', probability: Math.random() * 0.3 + 0.1 },
            { word: '香蕉', probability: Math.random() * 0.3 + 0.1 },
            { word: '猫', probability: Math.random() * 0.3 + 0.1 },
            { word: '狗', probability: Math.random() * 0.3 + 0.1 },
            { word: '房子', probability: Math.random() * 0.3 + 0.1 },
            { word: '汽车', probability: Math.random() * 0.3 + 0.1 },
            { word: '花', probability: Math.random() * 0.3 + 0.1 },
            { word: '树', probability: Math.random() * 0.3 + 0.1 },
            { word: '鸟', probability: Math.random() * 0.3 + 0.1 },
            { word: '鱼', probability: Math.random() * 0.3 + 0.1 }
        ];
        
        // 按概率排序
        guesses.sort((a, b) => b.probability - a.probability);
        
        // 只显示前3个猜测
        const topGuesses = guesses.slice(0, 3);
        
        // 生成显示内容
        let guessHTML = '<div style="text-align: left;">';
        topGuesses.forEach((guess, index) => {
            const percentage = (guess.probability * 100).toFixed(1);
            guessHTML += `<div>${index + 1}. ${guess.word} (${percentage}%)</div>`;
        });
        guessHTML += '</div>';
        
        aiGuessElement.innerHTML = guessHTML;
        
        // 启用下一回合按钮
        nextButton.disabled = false;
    }, 2000);
}

// 检查画布是否为空
function isCanvasBlank() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
            return false;
        }
    }
    return true;
}

// 下一回合
function nextRound() {
    if (gameState.round >= gameState.maxRounds) {
        // 游戏结束
        alert(`游戏结束！您的最终得分是: ${gameState.score}`);
        resetGame();
        return;
    }
    
    // 更新回合数
    gameState.round++;
    roundElement.textContent = `${gameState.round}/${gameState.maxRounds}`;
    
    // 清空画布
    clearCanvas();
    
    // 重置AI猜测显示
    aiGuessElement.innerHTML = '-';
    
    // 重置按钮状态
    submitButton.disabled = false;
    nextButton.disabled = true;
}

// 重置游戏
function resetGame() {
    gameState.score = 0;
    gameState.round = 1;
    scoreElement.textContent = gameState.score;
    roundElement.textContent = `${gameState.round}/${gameState.maxRounds}`;
    
    // 清空画布
    clearCanvas();
    
    // 重置AI猜测显示
    aiGuessElement.innerHTML = '-';
    
    // 重置按钮状态
    submitButton.disabled = false;
    nextButton.disabled = true;
}

// 事件监听器
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

submitButton.addEventListener('click', submitDrawing);
nextButton.addEventListener('click', nextRound);
clearButton.addEventListener('click', clearCanvas);

// 颜色选择器事件
document.getElementById('blackPen').addEventListener('click', () => setPenColor('black'));
document.getElementById('redPen').addEventListener('click', () => setPenColor('red'));
document.getElementById('bluePen').addEventListener('click', () => setPenColor('blue'));
document.getElementById('greenPen').addEventListener('click', () => setPenColor('green'));

// 初始化游戏
initCanvas();