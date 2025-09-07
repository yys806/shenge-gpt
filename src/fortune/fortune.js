// 星座运势功能

// 星座数据
const zodiacSigns = {
    aries: { name: "白羊座", dates: "3/21-4/19", icon: "♈" },
    taurus: { name: "金牛座", dates: "4/20-5/20", icon: "♉" },
    gemini: { name: "双子座", dates: "5/21-6/21", icon: "♊" },
    cancer: { name: "巨蟹座", dates: "6/22-7/22", icon: "♋" },
    leo: { name: "狮子座", dates: "7/23-8/22", icon: "♌" },
    virgo: { name: "处女座", dates: "8/23-9/22", icon: "♍" },
    libra: { name: "天秤座", dates: "9/23-10/23", icon: "♎" },
    scorpio: { name: "天蝎座", dates: "10/24-11/22", icon: "♏" },
    sagittarius: { name: "射手座", dates: "11/23-12/21", icon: "♐" },
    capricorn: { name: "摩羯座", dates: "12/22-1/19", icon: "♑" },
    aquarius: { name: "水瓶座", dates: "1/20-2/18", icon: "♒" },
    pisces: { name: "双鱼座", dates: "2/19-3/20", icon: "♓" }
};

// 获取运势按钮事件
document.getElementById('getFortune')?.addEventListener('click', function() {
    const selectedZodiac = document.getElementById('zodiacSelect').value;
    getFortune(selectedZodiac);
});

// 获取星座运势
async function getFortune(zodiac) {
    const resultElement = document.getElementById('fortuneResult');
    resultElement.innerHTML = '<div class="fortune-placeholder">正在获取运势...</div>';
    
    try {
        // 这里应该调用真实的星座运势API
        // 暂时使用模拟数据
        const fortune = generateMockFortune(zodiac);
        displayFortune(fortune);
    } catch (error) {
        resultElement.innerHTML = '<div class="fortune-placeholder">获取运势失败，请稍后重试</div>';
    }
}

// 生成模拟星座运势
function generateMockFortune(zodiac) {
    const zodiacData = zodiacSigns[zodiac];
    
    // 模拟运势数据
    const luckLevels = ["★", "★★", "★★★", "★★★★", "★★★★★"];
    const randomLuck = Math.floor(Math.random() * 5);
    
    return {
        sign: zodiacData.name,
        icon: zodiacData.icon,
        date: new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
        luck: luckLevels[randomLuck],
        love: luckLevels[Math.floor(Math.random() * 5)],
        work: luckLevels[Math.floor(Math.random() * 5)],
        health: luckLevels[Math.floor(Math.random() * 5)],
        fortuneText: getRandomFortuneText(),
        suggestion: getRandomSuggestion()
    };
}

// 随机运势文本
function getRandomFortuneText() {
    const texts = [
        "今天是展现自己才能的好时机，不要害怕表达自己的想法。",
        "保持积极的心态，好运自然会降临。",
        "与朋友的交流会带来意想不到的收获。",
        "专注于当前的任务，你会取得不错的进展。",
        "适当放松，给自己一些喘息的空间。",
        "勇敢面对挑战，你会发现自己比想象中更强大。"
    ];
    return texts[Math.floor(Math.random() * texts.length)];
}

// 随机建议
function getRandomSuggestion() {
    const suggestions = [
        "建议多与人交流，分享你的想法。",
        "今天适合制定新的计划和目标。",
        "保持耐心，好事多磨。",
        "注意休息，保持良好的作息习惯。",
        "尝试新的事物，拓展自己的视野。",
        "相信自己的直觉，它会引导你走向正确的方向。"
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
}

// 显示运势
function displayFortune(fortune) {
    const resultElement = document.getElementById('fortuneResult');
    resultElement.innerHTML = `
        <div class="fortune-card">
            <div class="fortune-header">
                <span class="fortune-icon">${fortune.icon}</span>
                <h3>${fortune.sign}运势</h3>
                <p>${fortune.date}</p>
            </div>
            
            <div class="fortune-details">
                <div class="fortune-item">
                    <label>综合运势:</label>
                    <div class="luck-level">${fortune.luck}</div>
                </div>
                
                <div class="fortune-item">
                    <label>爱情运势:</label>
                    <div class="luck-level">${fortune.love}</div>
                </div>
                
                <div class="fortune-item">
                    <label>工作运势:</label>
                    <div class="luck-level">${fortune.work}</div>
                </div>
                
                <div class="fortune-item">
                    <label>健康运势:</label>
                    <div class="luck-level">${fortune.health}</div>
                </div>
            </div>
            
            <div class="fortune-content">
                <div class="fortune-text">
                    <h4>今日运势：</h4>
                    <p>${fortune.fortuneText}</p>
                </div>
                
                <div class="fortune-suggestion">
                    <h4>建议：</h4>
                    <p>${fortune.suggestion}</p>
                </div>
            </div>
        </div>
    `;
}