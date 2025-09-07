// 番茄钟功能
class PomodoroTimer {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 25 * 60; // 25分钟，以秒为单位
        this.workTime = 25 * 60;
        this.breakTime = 5 * 60;
        this.longBreakTime = 15 * 60;
        this.currentSession = 0;
        this.totalSessions = 0;
        this.isWorkSession = true;
        this.timer = null;
        
        this.initElements();
        this.loadSettings();
        this.loadStats();
        this.updateDisplay();
        this.bindEvents();
    }

    initElements() {
        this.timeDisplay = document.getElementById('timeDisplay');
        this.timerProgress = document.getElementById('timerProgress');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.workTimeInput = document.getElementById('workTime');
        this.breakTimeInput = document.getElementById('breakTime');
        this.longBreakTimeInput = document.getElementById('longBreakTime');
        this.completedSessions = document.getElementById('completedSessions');
        this.totalTime = document.getElementById('totalTime');
        this.currentStreak = document.getElementById('currentStreak');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // 设置变化时更新
        this.workTimeInput.addEventListener('change', () => this.updateSettings());
        this.breakTimeInput.addEventListener('change', () => this.updateSettings());
        this.longBreakTimeInput.addEventListener('change', () => this.updateSettings());
    }

    updateSettings() {
        this.workTime = parseInt(this.workTimeInput.value) * 60;
        this.breakTime = parseInt(this.breakTimeInput.value) * 60;
        this.longBreakTime = parseInt(this.longBreakTimeInput.value) * 60;
        
        if (!this.isRunning) {
            this.currentTime = this.workTime;
            this.updateDisplay();
        }
        
        this.saveSettings();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            this.timer = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();
                
                if (this.currentTime <= 0) {
                    this.sessionComplete();
                }
            }, 1000);
            
            // 播放开始音效
            this.playSound('start');
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            
            clearInterval(this.timer);
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        clearInterval(this.timer);
        
        this.currentTime = this.workTime;
        this.isWorkSession = true;
        this.updateDisplay();
    }

    sessionComplete() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.isPaused = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        // 播放完成音效
        this.playSound('complete');
        
        if (this.isWorkSession) {
            this.totalSessions++;
            this.currentSession++;
            this.updateStats();
            this.saveStats();
            
            // 显示休息提示
            this.showNotification('🍅 番茄完成！该休息了', 'success');
            
            // 切换到休息时间
            this.isWorkSession = false;
            if (this.currentSession % 4 === 0) {
                this.currentTime = this.longBreakTime;
                this.showNotification('🎉 完成4个番茄！长休息时间', 'info');
            } else {
                this.currentTime = this.breakTime;
            }
        } else {
            // 休息结束，回到工作时间
            this.isWorkSession = true;
            this.currentTime = this.workTime;
            this.showNotification('💪 休息结束！开始新的番茄', 'info');
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 更新进度条
        const totalTime = this.isWorkSession ? this.workTime : (this.currentSession % 4 === 0 ? this.longBreakTime : this.breakTime);
        const progress = ((totalTime - this.currentTime) / totalTime) * 100;
        this.timerProgress.style.width = `${progress}%`;
        
        // 更新页面标题
        const sessionType = this.isWorkSession ? '工作时间' : '休息时间';
        document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - ${sessionType} | AI Hub`;
    }

    updateStats() {
        this.completedSessions.textContent = this.totalSessions;
        this.totalTime.textContent = this.totalSessions * parseInt(this.workTimeInput.value);
        
        // 计算连续天数（简化版本）
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('pomodoroLastDate');
        if (lastDate === today) {
            // 今天已经更新过了
        } else if (lastDate === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
            // 昨天有记录，连续天数+1
            const streak = parseInt(localStorage.getItem('pomodoroStreak') || '0') + 1;
            localStorage.setItem('pomodoroStreak', streak.toString());
            this.currentStreak.textContent = streak;
        } else {
            // 连续中断，重置为1
            localStorage.setItem('pomodoroStreak', '1');
            this.currentStreak.textContent = '1';
        }
        localStorage.setItem('pomodoroLastDate', today);
    }

    loadStats() {
        this.totalSessions = parseInt(localStorage.getItem('pomodoroTotalSessions') || '0');
        this.currentStreak.textContent = localStorage.getItem('pomodoroStreak') || '0';
        this.completedSessions.textContent = this.totalSessions;
        this.totalTime.textContent = this.totalSessions * parseInt(this.workTimeInput.value);
    }

    saveStats() {
        localStorage.setItem('pomodoroTotalSessions', this.totalSessions.toString());
    }

    loadSettings() {
        const savedWorkTime = localStorage.getItem('pomodoroWorkTime');
        const savedBreakTime = localStorage.getItem('pomodoroBreakTime');
        const savedLongBreakTime = localStorage.getItem('pomodoroLongBreakTime');
        
        if (savedWorkTime) {
            this.workTimeInput.value = savedWorkTime;
            this.workTime = parseInt(savedWorkTime) * 60;
        }
        if (savedBreakTime) {
            this.breakTimeInput.value = savedBreakTime;
            this.breakTime = parseInt(savedBreakTime) * 60;
        }
        if (savedLongBreakTime) {
            this.longBreakTimeInput.value = savedLongBreakTime;
            this.longBreakTime = parseInt(savedLongBreakTime) * 60;
        }
        
        this.currentTime = this.workTime;
    }

    saveSettings() {
        localStorage.setItem('pomodoroWorkTime', this.workTimeInput.value);
        localStorage.setItem('pomodoroBreakTime', this.breakTimeInput.value);
        localStorage.setItem('pomodoroLongBreakTime', this.longBreakTimeInput.value);
    }

    playSound(type) {
        // 创建音频上下文播放提示音
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'start') {
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            } else if (type === 'complete') {
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            }
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('音频播放失败:', error);
        }
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});