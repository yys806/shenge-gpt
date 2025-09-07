// 名言警句功能

class QuotesApp {
    constructor() {
        this.quotes = [
            {
                text: "书山有路勤为径，学海无涯苦作舟。",
                author: "韩愈"
            },
            {
                text: "成功不是将来才有的，而是从决定去做的那一刻起，持续累积而成。",
                author: "俞敏洪"
            },
            {
                text: "人生最大的光荣，不在于永不失败，而在于能屡仆屡起。",
                author: "拿破仑"
            },
            {
                text: "天行健，君子以自强不息。",
                author: "《周易》"
            },
            {
                text: "山不辞土，故能成其高；海不辞水，故能成其深。",
                author: "《管子》"
            },
            {
                text: "业精于勤，荒于嬉；行成于思，毁于随。",
                author: "韩愈"
            },
            {
                text: "不积跬步，无以至千里；不积小流，无以成江海。",
                author: "荀子"
            },
            {
                text: "路漫漫其修远兮，吾将上下而求索。",
                author: "屈原"
            },
            {
                text: "宝剑锋从磨砺出，梅花香自苦寒来。",
                author: "《警世贤文》"
            },
            {
                text: "少壮不努力，老大徒伤悲。",
                author: "《长歌行》"
            }
        ];
        
        this.savedQuotes = [];
        this.initializeElements();
        this.bindEvents();
        this.loadSavedQuotes();
        this.displayRandomQuote();
        this.updateCheckInStatus();
    }
    
    initializeElements() {
        this.quoteTextElement = document.getElementById('quoteText');
        this.quoteAuthorElement = document.getElementById('quoteAuthor');
        this.newQuoteBtn = document.getElementById('newQuote');
        this.saveQuoteBtn = document.getElementById('saveQuote');
        this.savedQuotesList = document.getElementById('savedQuotesList');
        this.checkInButton = document.getElementById('checkInButton');
        this.checkInStatus = document.getElementById('checkInStatus');
    }
    
    bindEvents() {
        this.newQuoteBtn?.addEventListener('click', () => this.displayRandomQuote());
        this.saveQuoteBtn?.addEventListener('click', () => this.saveCurrentQuote());
        this.checkInButton?.addEventListener('click', () => this.checkIn());
    }
    
    displayRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        const quote = this.quotes[randomIndex];
        
        this.quoteTextElement.textContent = `"${quote.text}"`;
        this.quoteAuthorElement.textContent = `—— ${quote.author}`;
        
        // 保存当前显示的名言
        this.currentQuote = quote;
    }
    
    saveCurrentQuote() {
        // 检查是否已经收藏
        const isAlreadySaved = this.savedQuotes.some(q => 
            q.text === this.currentQuote.text && q.author === this.currentQuote.author
        );
        
        if (isAlreadySaved) {
            alert('这句话已经收藏过了！');
            return;
        }
        
        const quoteToSave = {
            ...this.currentQuote,
            id: Date.now(),
            savedAt: new Date().toISOString()
        };
        
        this.savedQuotes.push(quoteToSave);
        this.saveSavedQuotes();
        this.renderSavedQuotes();
        alert('收藏成功！');
    }
    
    deleteSavedQuote(id) {
        if (confirm('确定要取消收藏这句话吗？')) {
            this.savedQuotes = this.savedQuotes.filter(quote => quote.id !== id);
            this.saveSavedQuotes();
            this.renderSavedQuotes();
        }
    }
    
    renderSavedQuotes() {
        if (this.savedQuotes.length === 0) {
            this.savedQuotesList.innerHTML = '<div class="empty-state">暂无收藏的名言</div>';
            return;
        }
        
        this.savedQuotesList.innerHTML = this.savedQuotes.map(quote => `
            <div class="saved-quote-card">
                <div class="quote-content">
                    <p class="quote-text">"${quote.text}"</p>
                    <p class="quote-author">—— ${quote.author}</p>
                </div>
                <button class="delete-btn" onclick="quotesApp.deleteSavedQuote(${quote.id})">取消收藏</button>
            </div>
        `).join('');
    }
    
    checkIn() {
        const today = new Date().toISOString().split('T')[0];
        const checkInData = {
            date: today,
            quote: this.currentQuote
        };
        
        localStorage.setItem('dailyQuoteCheckIn', JSON.stringify(checkInData));
        this.updateCheckInStatus();
        alert('打卡成功！');
    }
    
    updateCheckInStatus() {
        const today = new Date().toISOString().split('T')[0];
        const checkInData = localStorage.getItem('dailyQuoteCheckIn');
        
        if (checkInData) {
            const parsedData = JSON.parse(checkInData);
            if (parsedData.date === today) {
                this.checkInStatus.innerHTML = `
                    <p>今日已打卡</p>
                    <p class="checked-in-quote">"${parsedData.quote.text}"</p>
                `;
                this.checkInButton.style.display = 'none';
                return;
            }
        }
        
        this.checkInStatus.innerHTML = `
            <p>今日还未打卡</p>
            <button id="checkInButton" class="checkin-button">打卡</button>
        `;
        this.checkInButton = document.getElementById('checkInButton');
        this.checkInButton?.addEventListener('click', () => this.checkIn());
    }
    
    loadSavedQuotes() {
        const saved = localStorage.getItem('savedQuotes');
        if (saved) {
            this.savedQuotes = JSON.parse(saved);
        }
        this.renderSavedQuotes();
    }
    
    saveSavedQuotes() {
        localStorage.setItem('savedQuotes', JSON.stringify(this.savedQuotes));
    }
}

// 初始化名言警句应用
let quotesApp;
document.addEventListener('DOMContentLoaded', () => {
    quotesApp = new QuotesApp();
});