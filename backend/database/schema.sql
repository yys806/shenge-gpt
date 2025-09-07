-- AI Hub 数据库结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS ai_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_hub;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 星座运势记录表
CREATE TABLE IF NOT EXISTS horoscope_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    zodiac_sign VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    luck_level INT DEFAULT 1,
    love_level INT DEFAULT 1,
    work_level INT DEFAULT 1,
    health_level INT DEFAULT 1,
    fortune_text TEXT,
    suggestion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_zodiac_date (user_id, zodiac_sign, date)
);

-- 番茄钟记录表
CREATE TABLE IF NOT EXISTS pomodoro_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    completed_sessions INT DEFAULT 0,
    total_focus_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date)
);

-- 单词本表
CREATE TABLE IF NOT EXISTS vocabulary_words (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    word VARCHAR(100) NOT NULL,
    definition TEXT,
    example TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 收藏名言表
CREATE TABLE IF NOT EXISTS saved_quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quote_text TEXT NOT NULL,
    author VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 每日打卡记录表
CREATE TABLE IF NOT EXISTS daily_checkins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    checkin_date DATE NOT NULL,
    checkin_type ENUM('quote', 'vocabulary', 'pomodoro') NOT NULL,
    reference_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date_type (user_id, checkin_date, checkin_type)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_horoscope_user_date ON horoscope_records(user_id, date);
CREATE INDEX idx_pomodoro_user_date ON pomodoro_records(user_id, date);
CREATE INDEX idx_vocabulary_user ON vocabulary_words(user_id);
CREATE INDEX idx_quotes_user ON saved_quotes(user_id);
CREATE INDEX idx_checkins_user_date ON daily_checkins(user_id, checkin_date);
