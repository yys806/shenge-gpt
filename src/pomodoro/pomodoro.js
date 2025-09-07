// 番茄钟功能

class PomodoroTimer {
    constructor() {
        this.workDuration = 25 * 60 * 1000; // 25分钟
        this.breakDuration = 5 * 60 * 1000;  // 5分钟
        this.timeLeft = this.workDuration;
        this.isRunning = false;
        this.isBreak = false;
        this.timer = null;
        this.completedPomodoros = 0;
        this.totalFocusTime = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.loadStats();
    }
    
    initializeElements() {
        this.timeElement = document.getElementById('time');
        this.sessionTypeElement = document.getElementById('sessionType');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.workDurationInput = document.getElementById('workDuration');
        this.breakDurationInput = document.getElementById('breakDuration');
        this.completedPomodorosElement = document.getElementById('completedPomodoros');
        this.totalTimeElement = document.getElementById('totalTime');
    }
    
    bindEvents() {
        this.startBtn?.addEventListener('click', () => this.start());
        this.pauseBtn?.addEventListener('click', () => this.pause());
        this.resetBtn?.addEventListener('click', () => this.reset());
        
        this.workDurationInput?.addEventListener('change', (e) => {
            this.workDuration = parseInt(e.target.value) * 60 * 1000;
            if (!this.isRunning) {
                this.reset();
            }
        });
        
        this.breakDurationInput?.addEventListener('change', (e) => {
            this.breakDuration = parseInt(e.target.value) * 60 * 1000;
            if (!this.isRunning) {
                this.reset();
            }
        });
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        const startTime = Date.now() - (this.workDuration - this.timeLeft);
        
        this.timer = setInterval(() => {
            this.timeLeft = (this.isBreak ? this.breakDuration : this.workDuration) - (Date.now() - startTime);
            
            if (this.timeLeft <= 0) {
                this.completeSession();
            } else {
                this.updateDisplay();
            }
        }, 1000);
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        clearInterval(this.timer);
    }
    
    reset() {
        this.pause();
        this.isBreak = false;
        this.timeLeft = this.workDuration;
        this.updateDisplay();
        this.sessionTypeElement.textContent = '专注时间';
    }
    
    completeSession() {
        this.pause();
        
        if (!this.isBreak) {
            // 完成一个专注时间
            this.completedPomodoros++;
            this.totalFocusTime += 25; // 增加25分钟专注时间
            this.updateStats();
            this.saveStats();
            
            // 播放提示音（如果浏览器支持）
            this.playNotificationSound();
            
            // 切换到休息时间
            this.isBreak = true;
            this.timeLeft = this.breakDuration;
            this.sessionTypeElement.textContent = '休息时间';
            this.sessionTypeElement.style.color = '#4CAF50';
        } else {
            // 完成一个休息时间
            this.isBreak = false;
            this.timeLeft = this.workDuration;
            this.sessionTypeElement.textContent = '专注时间';
            this.sessionTypeElement.style.color = '#f44336';
        }
        
        this.updateDisplay();
        
        // 显示通知
        if (Notification.permission === 'granted') {
            new Notification('番茄钟', {
                body: this.isBreak ? '专注时间结束，开始休息吧！' : '休息时间结束，开始新的专注时间吧！'
            });
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60000);
        const seconds = Math.floor((this.timeLeft % 60000) / 1000);
        this.timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    playNotificationSound() {
        // 创建简单的提示音
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 1);
        } catch (e) {
            // 如果不支持Web Audio API，使用系统提示音
            console.log('\x07');
        }
    }
    
    updateStats() {
        this.completedPomodorosElement.textContent = this.completedPomodoros;
        this.totalTimeElement.textContent = this.totalFocusTime;
    }
    
    loadStats() {
        const stats = localStorage.getItem('pomodoroStats');
        if (stats) {
            const parsedStats = JSON.parse(stats);
            this.completedPomodoros = parsedStats.completedPomodoros || 0;
            this.totalFocusTime = parsedStats.totalFocusTime || 0;
            this.updateStats();
        }
    }
    
    saveStats() {
        const stats = {
            completedPomodoros: this.completedPomodoros,
            totalFocusTime: this.totalFocusTime,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }
}

// 初始化番茄钟
document.addEventListener('DOMContentLoaded', () => {
    // 请求通知权限
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    new PomodoroTimer();
});