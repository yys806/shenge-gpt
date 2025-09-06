// 五子棋游戏逻辑
class GomokuGame {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'black'; // black为玩家，white为AI
        this.gameOver = false;
        this.scores = { player: 0, ai: 0 };
        
        this.initializeBoard();
        this.renderBoard();
        this.bindEvents();
    }
    
    // 初始化棋盘
    initializeBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
            }
        }
    }
    
    // 渲染棋盘
    renderBoard() {
        const boardElement = document.getElementById('gomokuBoard');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'gomoku-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (this.board[i][j] === 'black') {
                    cell.classList.add('black');
                } else if (this.board[i][j] === 'white') {
                    cell.classList.add('white');
                }
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    // 绑定事件
    bindEvents() {
        const boardElement = document.getElementById('gomokuBoard');
        const resetButton = document.getElementById('resetGame');
        
        boardElement.addEventListener('click', (e) => {
            if (this.gameOver || this.currentPlayer !== 'black') return;
            
            const cell = e.target;
            if (cell.classList.contains('gomoku-cell')) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                
                if (this.board[row][col] === null) {
                    this.makeMove(row, col, 'black');
                }
            }
        });
        
        resetButton.addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    // 落子
    makeMove(row, col, player) {
        if (this.board[row][col] !== null || this.gameOver) return false;
        
        this.board[row][col] = player;
        this.renderBoard();
        
        if (this.checkWin(row, col, player)) {
            this.endGame(player);
            return true;
        }
        
        // 检查是否平局
        if (this.isBoardFull()) {
            this.endGame(null);
            return true;
        }
        
        // 切换玩家
        this.currentPlayer = player === 'black' ? 'white' : 'black';
        this.updateStatus();
        
        // 如果是AI回合，延迟执行AI落子
        if (this.currentPlayer === 'white' && !this.gameOver) {
            setTimeout(() => {
                this.makeAIMove();
            }, 500);
        }
        
        return true;
    }
    
    // AI落子
    makeAIMove() {
        if (this.gameOver) return;
        
        // 简单的AI策略：随机选择一个空位
        const emptyCells = [];
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const { row, col } = emptyCells[randomIndex];
            this.makeMove(row, col, 'white');
        }
    }
    
    // 检查是否获胜
    checkWin(row, col, player) {
        const directions = [
            [0, 1],  // 水平
            [1, 0],  // 垂直
            [1, 1],  // 对角线
            [1, -1]  // 反对角线
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1; // 包括当前子
            
            // 正方向计数
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize && 
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反方向计数
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize && 
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    // 检查棋盘是否已满
    isBoardFull() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 结束游戏
    endGame(winner) {
        this.gameOver = true;
        
        if (winner === 'black') {
            this.scores.player++;
            document.getElementById('playerScore').textContent = this.scores.player;
            this.updateStatus('恭喜您获胜！');
        } else if (winner === 'white') {
            this.scores.ai++;
            document.getElementById('aiScore').textContent = this.scores.ai;
            this.updateStatus('AI获胜！');
        } else {
            this.updateStatus('平局！');
        }
    }
    
    // 更新状态显示
    updateStatus(message) {
        const statusElement = document.getElementById('gameStatus');
        
        if (message) {
            statusElement.textContent = message;
        } else {
            statusElement.textContent = this.currentPlayer === 'black' ? '您的回合' : 'AI思考中...';
        }
    }
    
    // 重置游戏
    resetGame() {
        this.initializeBoard();
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.renderBoard();
        this.updateStatus();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new GomokuGame();
});