class AIService {
    constructor() {
        this.basePrompt = "你是一个年度总结分析师，名叫胖虎。请根据用户的回答，给出温暖、积极、有见地的建议。";
    }

    async getResponse(userInput, context = []) {
        // 模拟AI响应
        return new Promise(resolve => {
            setTimeout(() => {
                const responses = {
                    "个人成长": "很高兴听到你的成长经历！每一个进步都值得肯定...",
                    "未来发展": "对未来有规划是很好的，让我们一起分析一下...",
                    "情感生活": "感情是人生的重要部分，你的经历很有价值...",
                    "职业发展": "职业发展是一个循序渐进的过程，你已经做得很好..."
                };
                
                resolve(responses[userInput] || "让我们继续探讨这个话题...");
            }, 1000);
        });
    }
} 