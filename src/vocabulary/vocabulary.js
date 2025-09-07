// 单词本功能

class VocabularyBook {
    constructor() {
        this.words = [];
        this.initializeElements();
        this.bindEvents();
        this.loadWords();
        this.updateStats();
    }
    
    initializeElements() {
        this.wordInput = document.getElementById('word');
        this.definitionInput = document.getElementById('definition');
        this.exampleInput = document.getElementById('example');
        this.addWordBtn = document.getElementById('addWord');
        this.wordsContainer = document.getElementById('wordsContainer');
        this.searchInput = document.getElementById('searchInput');
        this.totalWordsElement = document.getElementById('totalWords');
        this.todayWordsElement = document.getElementById('todayWords');
    }
    
    bindEvents() {
        this.addWordBtn?.addEventListener('click', () => this.addWord());
        this.searchInput?.addEventListener('input', () => this.searchWords());
        
        // 支持回车添加单词
        this.wordInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addWord();
        });
    }
    
    addWord() {
        const word = this.wordInput.value.trim();
        const definition = this.definitionInput.value.trim();
        const example = this.exampleInput.value.trim();
        
        if (!word) {
            alert('请输入单词');
            return;
        }
        
        const newWord = {
            id: Date.now(),
            word: word,
            definition: definition,
            example: example,
            date: new Date().toISOString().split('T')[0],
            addedAt: new Date().getTime()
        };
        
        this.words.unshift(newWord);
        this.saveWords();
        this.renderWords();
        this.updateStats();
        
        // 清空输入框
        this.wordInput.value = '';
        this.definitionInput.value = '';
        this.exampleInput.value = '';
        this.wordInput.focus();
    }
    
    deleteWord(id) {
        if (confirm('确定要删除这个单词吗？')) {
            this.words = this.words.filter(word => word.id !== id);
            this.saveWords();
            this.renderWords();
            this.updateStats();
        }
    }
    
    searchWords() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredWords = this.words.filter(word => 
            word.word.toLowerCase().includes(searchTerm) ||
            word.definition.toLowerCase().includes(searchTerm) ||
            word.example.toLowerCase().includes(searchTerm)
        );
        this.renderWords(filteredWords);
    }
    
    renderWords(wordsToRender = this.words) {
        if (wordsToRender.length === 0) {
            this.wordsContainer.innerHTML = '<div class="empty-state">暂无单词，添加您的第一个单词吧！</div>';
            return;
        }
        
        this.wordsContainer.innerHTML = wordsToRender.map(word => `
            <div class="word-card">
                <div class="word-header">
                    <h4 class="word-title">${word.word}</h4>
                    <button class="delete-btn" onclick="vocabularyBook.deleteWord(${word.id})">删除</button>
                </div>
                <div class="word-content">
                    ${word.definition ? `<p class="definition"><strong>释义:</strong> ${word.definition}</p>` : ''}
                    ${word.example ? `<p class="example"><strong>例句:</strong> ${word.example}</p>` : ''}
                    <p class="date">添加于: ${word.date}</p>
                </div>
            </div>
        `).join('');
    }
    
    updateStats() {
        this.totalWordsElement.textContent = this.words.length;
        
        // 计算今日添加的单词数
        const today = new Date().toISOString().split('T')[0];
        const todayWords = this.words.filter(word => word.date === today).length;
        this.todayWordsElement.textContent = todayWords;
    }
    
    loadWords() {
        const savedWords = localStorage.getItem('vocabularyWords');
        if (savedWords) {
            this.words = JSON.parse(savedWords);
        }
        this.renderWords();
    }
    
    saveWords() {
        localStorage.setItem('vocabularyWords', JSON.stringify(this.words));
    }
}

// 初始化单词本
let vocabularyBook;
document.addEventListener('DOMContentLoaded', () => {
    vocabularyBook = new VocabularyBook();
});