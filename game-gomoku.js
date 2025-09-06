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
        
        // 使用更智能的AI策略
        const move = this.findBestMove();
        if (move) {
            this.makeMove(move.row, move.col, 'white');
        } else {
            // 如果没有找到好的位置，随机选择一个空位
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
    }
    
    // 寻找最佳落子位置
    findBestMove() {
        let bestScore = -1;
        let bestMove = null;
        
        // 遍历所有空位
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    // 评估这个位置的分数
                    const score = this.evaluatePosition(i, j);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row: i, col: j };
                    }
                }
            }
        }
        
        return bestMove;
    }
    
    // 评估位置的分数
    evaluatePosition(row, col) {
        let score = 0;
        
        // 检查AI自己能形成的连线
        score += this.evaluateLine(row, col, 'white') * 2;
        
        // 检查阻止玩家形成的连线
        score += this.evaluateLine(row, col, 'black');
        
        // 优先选择中心位置
        const center = Math.floor(this.boardSize / 2);
        const distanceToCenter = Math.abs(row - center) + Math.abs(col - center);
        score += (this.boardSize - distanceToCenter) * 0.5;
        
        return score;
    }
    
    // 评估某个位置在某个方向上能形成的连线
    evaluateLine(row, col, player) {
        let totalScore = 0;
        
        const directions = [
            [0, 1],  // 水平
            [1, 0],  // 垂直
            [1, 1],  // 对角线
            [1, -1]  // 反对角线
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1; // 包括当前子
            let blocked = 0; // 被阻挡的边数
            
            // 正方向计数
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize) {
                    if (this.board[newRow][newCol] === player) {
                        count++;
                    } else if (this.board[newRow][newCol] !== null) {
                        blocked++;
                        break;
                    } else {
                        break;
                    }
                } else {
                    blocked++;
                    break;
                }
            }
            
            // 反方向计数
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize) {
                    if (this.board[newRow][newCol] === player) {
                        count++;
                    } else if (this.board[newRow][newCol] !== null) {
                        blocked++;
                        break;
                    } else {
                        break;
                    }
                } else {
                    blocked++;
                    break;
                }
            }
            
            // 根据连线长度和阻挡情况评分
            if (count >= 5) {
                totalScore += 10000; // 胜利
            } else if (count === 4 && blocked === 0) {
                totalScore += 1000; // 活四
            } else if (count === 4 && blocked === 1) {
                totalScore += 100; // 冲四
            } else if (count === 3 && blocked === 0) {
                totalScore += 100; // 活三
            } else if (count === 3 && blocked === 1) {
                totalScore += 10; // 眠三
            } else if (count === 2 && blocked === 0) {
                totalScore += 10; // 活二
            } else if (count === 2 && blocked === 1) {
                totalScore += 1; // 眠二
            }
        }
        
        return totalScore;
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