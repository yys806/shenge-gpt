// API 配置
const API_CONFIG = {
    // 开发环境
    development: {
        baseURL: 'http://localhost:3000/api',
        timeout: 10000
    },
    // 生产环境
    production: {
        baseURL: 'https://shenge-gpt.vercel.app/api',
        timeout: 10000
    }
};

// 获取当前环境
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const currentConfig = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// API 基础类
class API {
    constructor() {
        this.baseURL = currentConfig.baseURL;
        this.timeout = currentConfig.timeout;
        this.token = localStorage.getItem('auth_token');
    }

    // 设置认证token
    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    // 清除token
    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    // 发送请求
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.timeout,
            ...options
        };

        // 添加认证头
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '请求失败');
            }

            return data;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }

    // GET 请求
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }

    // POST 请求
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT 请求
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE 请求
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// 创建API实例
const api = new API();

// 导出API实例和配置
window.API = api;
window.API_CONFIG = currentConfig;

// 导出给模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, API_CONFIG };
}
