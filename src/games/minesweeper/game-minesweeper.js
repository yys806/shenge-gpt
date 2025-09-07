// 扫雷游戏逻辑
class MinesweeperGame {
    constructor() {
        this.boardSize = 10;
        this.mineCount = 10;
        this.board = [];
        this.revealedCount = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.startTime = null;
        this.timerInterval = null;
        this.flaggedCount = 0;
        
        this.initializeBoard();
        this.placeMines();
        this.calculateNumbers();
        this.renderBoard();
        this.bindEvents();
        this.updateMineCount();
    }
    
    // 初始化棋盘
    initializeBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
    }
    
    // 放置地雷
    placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.boardSize);
            const col = Math.floor(Math.random() * this.boardSize);
            
            if (!this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
    }
    
    // 计算每个方块周围的地雷数
    calculateNumbers() {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (!this.board[i][j].isMine) {
                    let count = 0;
                    for (const [dx, dy] of directions) {
                        const newRow = i + dx;
                        const newCol = j + dy;
                        
                        if (newRow >= 0 && newRow < this.boardSize && 
                            newCol >= 0 && newCol < this.boardSize && 
                            this.board[newRow][newCol].isMine) {
                            count++;
                        }
                    }
                    this.board[i][j].neighborMines = count;
                }
            }
        }
    }
    
    // 渲染棋盘
    renderBoard() {
        const boardElement = document.getElementById('minesweeperBoard');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                const cellData = this.board[i][j];
                
                if (cellData.isRevealed) {
                    cell.classList.add('revealed');
                    
                    if (cellData.isMine) {
                        cell.classList.add('mine');
                    } else if (cellData.neighborMines > 0) {
                        cell.textContent = cellData.neighborMines;
                        // 设置数字颜色
                        const colors = ['', 'blue', 'green', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'];
                        cell.style.color = colors[cellData.neighborMines];
                    }
                } else if (cellData.isFlagged) {
                    cell.classList.add('flagged');
                }
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    // 绑定事件
    bindEvents() {
        const boardElement = document.getElementById('minesweeperBoard');
        const resetButton = document.getElementById('resetGame');
        
        boardElement.addEventListener('click', (e) => {
            if (this.gameOver || this.gameWon) return;
            
            const cell = e.target;
            if (cell.classList.contains('mine-cell')) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                
                this.revealCell(row, col);
            }
        });
        
        boardElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            if (this.gameOver || this.gameWon) return;
            
            const cell = e.target;
            if (cell.classList.contains('mine-cell')) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                
                this.toggleFlag(row, col);
            }
        });
        
        resetButton.addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    // 翻开方块
    revealCell(row, col) {
        const cell = this.board[row][col];
        
        // 如果已翻开或已标记，不处理
        if (cell.isRevealed || cell.isFlagged) return;
        
        // 如果是第一次点击，开始计时
        if (this.startTime === null) {
            this.startTime = Date.now();
            this.startTimer();
        }
        
        // 标记为已翻开
        cell.isRevealed = true;
        this.revealedCount++;
        
        // 如果是地雷，游戏结束
        if (cell.isMine) {
            this.gameOver = true;
            this.revealAllMines();
            this.stopTimer();
            document.getElementById('gameStatus').textContent = '游戏结束！';
            return;
        }
        
        // 如果是空白方块，翻开周围的方块
        if (cell.neighborMines === 0) {
            this.revealNeighbors(row, col);
        }
        
        // 检查是否获胜
        this.checkWin();
        
        // 重新渲染
        this.renderBoard();
    }
    
    // 翻开周围的方块
    revealNeighbors(row, col) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (newRow >= 0 && newRow < this.boardSize && 
                newCol >= 0 && newCol < this.boardSize) {
                const neighbor = this.board[newRow][newCol];
                
                if (!neighbor.isRevealed && !neighbor.isFlagged) {
                    this.revealCell(newRow, newCol);
                }
            }
        }
    }
    
    // 切换标记
    toggleFlag(row, col) {
        const cell = this.board[row][col];
        
        if (cell.isRevealed) return;
        
        cell.isFlagged = !cell.isFlagged;
        this.flaggedCount += cell.isFlagged ? 1 : -1;
        
        this.updateMineCount();
        this.renderBoard();
        this.checkWin();
    }
    
    // 更新剩余地雷数显示
    updateMineCount() {
        const mineCountElement = document.getElementById('mineCount');
        mineCountElement.textContent = this.mineCount - this.flaggedCount;
    }
    
    // 翻开所有地雷
    revealAllMines() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j].isMine) {
                    this.board[i][j].isRevealed = true;
                }
            }
        }
    }
    
    // 检查是否获胜
    checkWin() {
        const totalCells = this.boardSize * this.boardSize;
        if (this.revealedCount === totalCells - this.mineCount) {
            this.gameWon = true;
            this.stopTimer();
            document.getElementById('gameStatus').textContent = '恭喜获胜！';
        }
    }
    
    // 开始计时
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('timer').textContent = elapsed;
        }, 1000);
    }
    
    // 停止计时
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    // 重置游戏
    resetGame() {
        this.stopTimer();
        this.revealedCount = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.startTime = null;
        this.flaggedCount = 0;
        
        document.getElementById('timer').textContent = '0';
        document.getElementById('gameStatus').textContent = '游戏进行中';
        
        this.initializeBoard();
        this.placeMines();
        this.calculateNumbers();
        this.renderBoard();
        this.updateMineCount();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new MinesweeperGame();
});