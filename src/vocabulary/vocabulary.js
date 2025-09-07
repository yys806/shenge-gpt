// 四级单词本功能
class VocabularyApp {
    constructor() {
        this.currentWord = null;
        this.currentIndex = 0;
        this.todayLearned = 0;
        this.totalLearned = 0;
        this.favorites = [];
        this.dailyGoal = 20;
        this.difficulty = 'medium';
        
        this.initElements();
        this.loadData();
        this.loadRandomWord();
        this.bindEvents();
        this.updateStats();
    }

    initElements() {
        this.wordText = document.getElementById('wordText');
        this.wordPhonetic = document.getElementById('wordPhonetic');
        this.wordMeaning = document.getElementById('wordMeaning');
        this.wordExample = document.getElementById('wordExample');
        this.showMeaningBtn = document.getElementById('showMeaningBtn');
        this.nextWordBtn = document.getElementById('nextWordBtn');
        this.addToFavoritesBtn = document.getElementById('addToFavoritesBtn');
        this.todayLearnedEl = document.getElementById('todayLearned');
        this.totalLearnedEl = document.getElementById('totalLearned');
        this.favoritesCountEl = document.getElementById('favoritesCount');
        this.dailyGoalSelect = document.getElementById('dailyGoal');
        this.difficultySelect = document.getElementById('difficulty');
        this.favoritesList = document.getElementById('favoritesList');
    }

    bindEvents() {
        this.showMeaningBtn.addEventListener('click', () => this.showMeaning());
        this.nextWordBtn.addEventListener('click', () => this.nextWord());
        this.addToFavoritesBtn.addEventListener('click', () => this.addToFavorites());
        this.dailyGoalSelect.addEventListener('change', () => this.updateSettings());
        this.difficultySelect.addEventListener('change', () => this.updateSettings());
    }

    // 四级单词库
    getWordList() {
        const words = {
            easy: [
                { word: "apple", phonetic: "/ˈæpl/", meaning: "n. 苹果", example: "I eat an apple every day." },
                { word: "book", phonetic: "/bʊk/", meaning: "n. 书", example: "This is a good book." },
                { word: "cat", phonetic: "/kæt/", meaning: "n. 猫", example: "The cat is sleeping." },
                { word: "dog", phonetic: "/dɔːɡ/", meaning: "n. 狗", example: "My dog is very friendly." },
                { word: "house", phonetic: "/haʊs/", meaning: "n. 房子", example: "I live in a big house." }
            ],
            medium: [
                { word: "abandon", phonetic: "/əˈbændən/", meaning: "v. 放弃，抛弃", example: "Don't abandon your dreams." },
                { word: "achieve", phonetic: "/əˈtʃiːv/", meaning: "v. 实现，达到", example: "She achieved her goal." },
                { word: "benefit", phonetic: "/ˈbenɪfɪt/", meaning: "n. 利益，好处", example: "Exercise has many benefits." },
                { word: "challenge", phonetic: "/ˈtʃælɪndʒ/", meaning: "n. 挑战", example: "This is a big challenge." },
                { word: "develop", phonetic: "/dɪˈveləp/", meaning: "v. 发展，开发", example: "The city developed quickly." },
                { word: "efficient", phonetic: "/ɪˈfɪʃənt/", meaning: "adj. 高效的", example: "This method is very efficient." },
                { word: "familiar", phonetic: "/fəˈmɪliər/", meaning: "adj. 熟悉的", example: "This place looks familiar." },
                { word: "generate", phonetic: "/ˈdʒenəreɪt/", meaning: "v. 产生，生成", example: "The machine generates electricity." },
                { word: "hospital", phonetic: "/ˈhɒspɪtl/", meaning: "n. 医院", example: "He works in a hospital." },
                { word: "important", phonetic: "/ɪmˈpɔːtnt/", meaning: "adj. 重要的", example: "This is very important." }
            ],
            hard: [
                { word: "accomplish", phonetic: "/əˈkʌmplɪʃ/", meaning: "v. 完成，实现", example: "We accomplished our mission." },
                { word: "benevolent", phonetic: "/bəˈnevələnt/", meaning: "adj. 仁慈的", example: "He is a benevolent person." },
                { word: "comprehensive", phonetic: "/ˌkɒmprɪˈhensɪv/", meaning: "adj. 全面的", example: "This is a comprehensive study." },
                { word: "demonstrate", phonetic: "/ˈdemənstreɪt/", meaning: "v. 证明，演示", example: "He demonstrated the theory." },
                { word: "entrepreneur", phonetic: "/ˌɒntrəprəˈnɜːr/", meaning: "n. 企业家", example: "She is a successful entrepreneur." },
                { word: "fundamental", phonetic: "/ˌfʌndəˈmentl/", meaning: "adj. 基本的", example: "This is a fundamental principle." },
                { word: "hypothesis", phonetic: "/haɪˈpɒθəsɪs/", meaning: "n. 假设", example: "The hypothesis was proven wrong." },
                { word: "infrastructure", phonetic: "/ˈɪnfrəstrʌktʃər/", meaning: "n. 基础设施", example: "The infrastructure needs improvement." },
                { word: "jurisdiction", phonetic: "/ˌdʒʊərɪsˈdɪkʃn/", meaning: "n. 管辖权", example: "This is outside our jurisdiction." },
                { word: "knowledgeable", phonetic: "/ˈnɒlɪdʒəbl/", meaning: "adj. 博学的", example: "He is very knowledgeable about history." }
            ]
        };
        return words[this.difficulty] || words.medium;
    }

    loadRandomWord() {
        const words = this.getWordList();
        const randomIndex = Math.floor(Math.random() * words.length);
        this.currentWord = words[randomIndex];
        this.currentIndex = randomIndex;
        
        this.displayWord();
        this.hideMeaning();
    }

    displayWord() {
        this.wordText.textContent = this.currentWord.word;
        this.wordPhonetic.textContent = this.currentWord.phonetic;
        this.showMeaningBtn.textContent = "显示释义";
        this.addToFavoritesBtn.disabled = false;
    }

    showMeaning() {
        this.wordMeaning.innerHTML = `<p><strong>释义：</strong>${this.currentWord.meaning}</p>`;
        this.wordExample.innerHTML = `<h4>例句：</h4><p>${this.currentWord.example}</p>`;
        this.wordExample.style.display = 'block';
        this.showMeaningBtn.textContent = "已显示";
        this.showMeaningBtn.disabled = true;
        
        // 记录学习
        this.todayLearned++;
        this.totalLearned++;
        this.updateStats();
        this.saveData();
    }

    hideMeaning() {
        this.wordMeaning.innerHTML = '<p>点击"显示释义"查看单词含义</p>';
        this.wordExample.style.display = 'none';
        this.showMeaningBtn.disabled = false;
    }

    nextWord() {
        this.loadRandomWord();
    }

    addToFavorites() {
        if (this.currentWord && !this.favorites.find(fav => fav.word === this.currentWord.word)) {
            this.favorites.push(this.currentWord);
            this.updateStats();
            this.saveData();
            this.updateFavoritesList();
            this.showNotification('已添加到收藏', 'success');
        }
    }

    updateStats() {
        this.todayLearnedEl.textContent = this.todayLearned;
        this.totalLearnedEl.textContent = this.totalLearned;
        this.favoritesCountEl.textContent = this.favorites.length;
    }

    updateFavoritesList() {
        if (this.favorites.length === 0) {
            this.favoritesList.innerHTML = '<p class="empty-message">还没有收藏的单词</p>';
            return;
        }

        const favoritesHTML = this.favorites.map((word, index) => `
            <div class="favorite-item">
                <div class="favorite-word">
                    <strong>${word.word}</strong>
                    <span class="favorite-phonetic">${word.phonetic}</span>
                </div>
                <div class="favorite-meaning">${word.meaning}</div>
                <button class="btn btn-small btn-danger" onclick="vocabularyApp.removeFavorite(${index})">删除</button>
            </div>
        `).join('');

        this.favoritesList.innerHTML = favoritesHTML;
    }

    removeFavorite(index) {
        this.favorites.splice(index, 1);
        this.updateStats();
        this.saveData();
        this.updateFavoritesList();
        this.showNotification('已从收藏中删除', 'info');
    }

    updateSettings() {
        this.dailyGoal = parseInt(this.dailyGoalSelect.value);
        this.difficulty = this.difficultySelect.value;
        this.saveData();
        this.loadRandomWord();
    }

    loadData() {
        const savedData = localStorage.getItem('vocabularyData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.todayLearned = data.todayLearned || 0;
            this.totalLearned = data.totalLearned || 0;
            this.favorites = data.favorites || [];
            this.dailyGoal = data.dailyGoal || 20;
            this.difficulty = data.difficulty || 'medium';
            
            this.dailyGoalSelect.value = this.dailyGoal;
            this.difficultySelect.value = this.difficulty;
        }
        
        // 检查是否是新的学习日
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('vocabularyLastDate');
        if (lastDate !== today) {
            this.todayLearned = 0;
            localStorage.setItem('vocabularyLastDate', today);
        }
    }

    saveData() {
        const data = {
            todayLearned: this.todayLearned,
            totalLearned: this.totalLearned,
            favorites: this.favorites,
            dailyGoal: this.dailyGoal,
            difficulty: this.difficulty
        };
        localStorage.setItem('vocabularyData', JSON.stringify(data));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// 页面加载完成后初始化
let vocabularyApp;
document.addEventListener('DOMContentLoaded', () => {
    vocabularyApp = new VocabularyApp();
    vocabularyApp.updateFavoritesList();
});