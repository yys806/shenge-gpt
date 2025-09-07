// 消消乐游戏
class MatchThreeGame {
    constructor() {
        this.boardSize = 8;
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.board = [];
        this.score = 0;
        this.timeLeft = 60;
        this.level = 1;
        this.isPlaying = false;
        this.isPaused = false;
        this.selectedTile = null;
        this.timer = null;
        
        this.initElements();
        this.bindEvents();
        this.initBoard();
        this.updateDisplay();
    }

    initElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreEl = document.getElementById('score');
        this.timeEl = document.getElementById('time');
        this.levelEl = document.getElementById('level');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }

    initBoard() {
        this.board = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = this.getRandomColor();
            }
        }
        
        // 确保没有初始匹配
        this.removeInitialMatches();
        this.renderBoard();
    }

    getRandomColor() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    removeInitialMatches() {
        let hasMatches = true;
        while (hasMatches) {
            hasMatches = false;
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    if (this.checkMatch(row, col)) {
                        this.board[row][col] = this.getRandomColor();
                        hasMatches = true;
                    }
                }
            }
        }
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${this.board[row][col]}`;
                tile.dataset.row = row;
                tile.dataset.col = col;
                tile.addEventListener('click', () => this.selectTile(row, col));
                this.gameBoard.appendChild(tile);
            }
        }
    }

    selectTile(row, col) {
        if (!this.isPlaying || this.isPaused) return;
        
        if (this.selectedTile === null) {
            this.selectedTile = { row, col };
            this.highlightTile(row, col, true);
        } else {
            const prevTile = this.selectedTile;
            if (prevTile.row === row && prevTile.col === col) {
                // 取消选择
                this.highlightTile(row, col, false);
                this.selectedTile = null;
            } else if (this.isAdjacent(prevTile.row, prevTile.col, row, col)) {
                // 尝试交换
                this.swapTiles(prevTile.row, prevTile.col, row, col);
                this.highlightTile(prevTile.row, prevTile.col, false);
                this.selectedTile = null;
            } else {
                // 选择新的方块
                this.highlightTile(prevTile.row, prevTile.col, false);
                this.selectedTile = { row, col };
                this.highlightTile(row, col, true);
            }
        }
    }

    highlightTile(row, col, highlight) {
        const tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (tile) {
            tile.classList.toggle('selected', highlight);
        }
    }

    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    swapTiles(row1, col1, row2, col2) {
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;
        
        this.renderBoard();
        
        // 检查是否有匹配
        const matches = this.findMatches();
        if (matches.length > 0) {
            this.processMatches(matches);
        } else {
            // 没有匹配，交换回来
            const temp = this.board[row1][col1];
            this.board[row1][col1] = this.board[row2][col2];
            this.board[row2][col2] = temp;
            this.renderBoard();
        }
    }

    findMatches() {
        const matches = [];
        
        // 检查水平匹配
        for (let row = 0; row < this.boardSize; row++) {
            let count = 1;
            let currentColor = this.board[row][0];
            
            for (let col = 1; col < this.boardSize; col++) {
                if (this.board[row][col] === currentColor) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let i = col - count; i < col; i++) {
                            matches.push({ row, col: i });
                        }
                    }
                    count = 1;
                    currentColor = this.board[row][col];
                }
            }
            
            if (count >= 3) {
                for (let i = this.boardSize - count; i < this.boardSize; i++) {
                    matches.push({ row, col: i });
                }
            }
        }
        
        // 检查垂直匹配
        for (let col = 0; col < this.boardSize; col++) {
            let count = 1;
            let currentColor = this.board[0][col];
            
            for (let row = 1; row < this.boardSize; row++) {
                if (this.board[row][col] === currentColor) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let i = row - count; i < row; i++) {
                            matches.push({ row: i, col });
                        }
                    }
                    count = 1;
                    currentColor = this.board[row][col];
                }
            }
            
            if (count >= 3) {
                for (let i = this.boardSize - count; i < this.boardSize; i++) {
                    matches.push({ row: i, col });
                }
            }
        }
        
        return matches;
    }

    checkMatch(row, col) {
        const color = this.board[row][col];
        
        // 检查水平匹配
        let horizontalCount = 1;
        for (let c = col - 1; c >= 0 && this.board[row][c] === color; c--) {
            horizontalCount++;
        }
        for (let c = col + 1; c < this.boardSize && this.board[row][c] === color; c++) {
            horizontalCount++;
        }
        
        // 检查垂直匹配
        let verticalCount = 1;
        for (let r = row - 1; r >= 0 && this.board[r][col] === color; r--) {
            verticalCount++;
        }
        for (let r = row + 1; r < this.boardSize && this.board[r][col] === color; r++) {
            verticalCount++;
        }
        
        return horizontalCount >= 3 || verticalCount >= 3;
    }

    processMatches(matches) {
        // 计算分数
        const points = matches.length * 10;
        this.score += points;
        
        // 移除匹配的方块
        matches.forEach(match => {
            this.board[match.row][match.col] = null;
        });
        
        // 掉落新方块
        this.dropTiles();
        
        // 检查是否有新的匹配
        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            setTimeout(() => this.processMatches(newMatches), 300);
        }
        
        this.updateDisplay();
    }

    dropTiles() {
        for (let col = 0; col < this.boardSize; col++) {
            let writeIndex = this.boardSize - 1;
            
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col] !== null) {
                    this.board[writeIndex][col] = this.board[row][col];
                    if (writeIndex !== row) {
                        this.board[row][col] = null;
                    }
                    writeIndex--;
                }
            }
            
            // 填充空位
            for (let row = writeIndex; row >= 0; row--) {
                this.board[row][col] = this.getRandomColor();
            }
        }
        
        this.renderBoard();
    }

    startGame() {
        this.isPlaying = true;
        this.isPaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    pauseGame() {
        if (this.isPaused) {
            this.isPaused = false;
            this.pauseBtn.textContent = '暂停';
            this.startTimer();
        } else {
            this.isPaused = true;
            this.pauseBtn.textContent = '继续';
            this.stopTimer();
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resetGame() {
        this.stopTimer();
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.timeLeft = 60;
        this.level = 1;
        this.selectedTile = null;
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        
        this.initBoard();
        this.updateDisplay();
    }

    endGame() {
        this.stopTimer();
        this.isPlaying = false;
        this.isPaused = false;
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        alert(`游戏结束！\n最终分数: ${this.score}\n等级: ${this.level}`);
    }

    updateDisplay() {
        this.scoreEl.textContent = this.score;
        this.timeEl.textContent = this.timeLeft;
        this.levelEl.textContent = this.level;
        
        // 升级逻辑
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.timeLeft += 30; // 升级奖励时间
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new MatchThreeGame();
});
