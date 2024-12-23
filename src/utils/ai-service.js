// 简单的AI服务实现
class AIService {
    constructor() {
        this.model = 'default';
    }

    async getResponse(prompt) {
        // 保持简单的实现
        try {
            const response = await fetch('/api/ai', {
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