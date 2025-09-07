// 电子木鱼功能
class WoodenFish {
    constructor() {
        this.counter = 0;
        this.totalTaps = 0;
        this.todayTaps = 0;
        this.fishModeCount = 0;
        this.isFishMode = false;
        
        this.initElements();
        this.loadData();
        this.bindEvents();
        this.updateDisplay();
    }

    initElements() {
        this.counterNumber = document.getElementById('counterNumber');
        this.woodenFish = document.getElementById('woodenFish');
        this.fishStick = document.getElementById('fishStick');
        this.tapBtn = document.getElementById('tapBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.totalTapsEl = document.getElementById('totalTaps');
        this.todayTapsEl = document.getElementById('todayTaps');
        this.fishModeCountEl = document.getElementById('fishModeCount');
        this.fishMode = document.getElementById('fishMode');
        this.exitFishModeBtn = document.getElementById('exitFishModeBtn');
        this.plusOne = document.getElementById('plusOne');
    }

    bindEvents() {
        this.tapBtn.addEventListener('click', () => this.tapFish());
        this.resetBtn.addEventListener('click', () => this.resetCounter());
        this.exitFishModeBtn.addEventListener('click', () => this.exitFishMode());
        
        // 键盘支持
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isFishMode) {
                e.preventDefault();
                this.tapFish();
            }
        });
    }

    tapFish() {
        if (this.isFishMode) return;
        
        this.counter++;
        this.totalTaps++;
        this.todayTaps++;
        
        // 播放敲击动画
        this.playTapAnimation();
        
        // 播放音效
        this.playSound();
        
        // 显示+1动效
        this.showPlusOne();
        
        // 更新显示
        this.updateDisplay();
        
        // 检查是否进入摸鱼模式
        if (this.counter >= 100) {
            this.enterFishMode();
        }
        
        // 保存数据
        this.saveData();
    }

    playTapAnimation() {
        // 木鱼震动效果
        this.woodenFish.style.transform = 'scale(0.95)';
        this.woodenFish.style.transition = 'transform 0.1s ease';
        
        // 木槌敲击动画
        this.fishStick.style.transform = 'rotate(-15deg) translateY(-5px)';
        this.fishStick.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            this.woodenFish.style.transform = 'scale(1)';
            this.fishStick.style.transform = 'rotate(0deg) translateY(0px)';
        }, 100);
    }

    playSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建木鱼敲击音效
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 设置音效参数
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('音频播放失败:', error);
        }
    }

    showPlusOne() {
        // 重置+1动效位置
        this.plusOne.style.left = '50%';
        this.plusOne.style.top = '50%';
        this.plusOne.style.opacity = '1';
        this.plusOne.style.transform = 'translate(-50%, -50%) scale(1)';
        
        // 动画效果
        setTimeout(() => {
            this.plusOne.style.opacity = '0';
            this.plusOne.style.transform = 'translate(-50%, -60%) scale(1.5)';
        }, 100);
    }

    enterFishMode() {
        this.isFishMode = true;
        this.fishModeCount++;
        this.fishMode.style.display = 'block';
        
        // 播放进入摸鱼模式的音效
        this.playFishModeSound();
        
        // 更新统计
        this.updateDisplay();
        this.saveData();
    }

    exitFishMode() {
        this.isFishMode = false;
        this.counter = 0;
        this.fishMode.style.display = 'none';
        this.updateDisplay();
        this.saveData();
    }

    resetCounter() {
        this.counter = 0;
        this.updateDisplay();
        this.saveData();
    }

    updateDisplay() {
        this.counterNumber.textContent = this.counter;
        this.totalTapsEl.textContent = this.totalTaps;
        this.todayTapsEl.textContent = this.todayTaps;
        this.fishModeCountEl.textContent = this.fishModeCount;
        
        // 更新按钮状态
        this.tapBtn.disabled = this.isFishMode;
        this.tapBtn.textContent = this.isFishMode ? '摸鱼中...' : '敲击木鱼';
    }

    playFishModeSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 播放更柔和的音效
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 1);
        } catch (error) {
            console.log('音频播放失败:', error);
        }
    }

    loadData() {
        const savedData = localStorage.getItem('woodenFishData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.counter = data.counter || 0;
            this.totalTaps = data.totalTaps || 0;
            this.todayTaps = data.todayTaps || 0;
            this.fishModeCount = data.fishModeCount || 0;
        }
        
        // 检查是否是新的修行日
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('woodenFishLastDate');
        if (lastDate !== today) {
            this.todayTaps = 0;
            localStorage.setItem('woodenFishLastDate', today);
        }
    }

    saveData() {
        const data = {
            counter: this.counter,
            totalTaps: this.totalTaps,
            todayTaps: this.todayTaps,
            fishModeCount: this.fishModeCount
        };
        localStorage.setItem('woodenFishData', JSON.stringify(data));
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new WoodenFish();
});
