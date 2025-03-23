// 简单的AI服务实现
class AIService {
    constructor() {
        // 检测是否在本地开发环境
        const isLocalDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        // 根据环境选择API URL
        this.API_URL = isLocalDev 
            ? 'http://localhost:3000/api/chat'  // 本地开发URL
            : 'https://annual-summary-api.daisyquanzhixian.workers.dev/api/chat'; // 生产URL
        
        console.log('使用API URL:', this.API_URL);
        this.isLoading = false;
        
        this.model = 'default';
    }

    async getResponse(prompt) {
        // 保持简单的实现
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                body: JSON.stringify({ prompt })
            });
            return await response.json();
        } catch (error) {
            console.error('AI服务错误:', error);
            return null;
        }
    }
} 