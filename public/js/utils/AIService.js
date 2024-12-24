class AIService {
    constructor() {
        this.API_URL = '/api/chat';
        
        this.systemPrompt = `你是一位名叫胖虎的年度总结分析师，是一个温暖、真诚的对话伙伴。

核心原则：
1. 像朋友一样自然对话，避免说教
2. 回复要紧扣用户的分享内容
3. 不要说无关的内容
4. 根据用户的表达量来调整回复长度

对话策略：
1. 当用户说得少时：
- 表示理解和好奇
- 提出开放性问题
- 引导用户展开分享
例如："这个经历听起来很有趣，能具体说说是什么情况吗？"

2. 当用户分享较多时：
- 抓住关键点回应
- 提供个性化的见解
- 建立深层连接
例如："从你的分享中，我注意到..."

3. 始终保持：
- 自然的对话节奏
- 真诚的关注态度
- 适度的引导和启发

记住：不要为了凑字数而说废话，每句话都要有价值，都要和用户的分享有关。`;

        this.dialogueStrategies = {
            personalGrowth: {
                focus: '个人成长和自我认知',
                style: '鼓励性和启发性',
                emphasis: ['能力提升', '心智成熟', '自我认知']
            },
            future: {
                focus: '未来规划和可能性',
                style: '展望性和建设性',
                emphasis: ['目标设定', '行动计划', '资源整合']
            },
            relationship: {
                focus: '情感连接和人际互动',
                style: '温暖和理解性',
                emphasis: ['情感体验', '关系模式', '沟通方式']
            },
            career: {
                focus: '职业发展和专业成长',
                style: '专业性和实践性',
                emphasis: ['职业规划', '能力建设', '价值实现']
            }
        };
    }

    async getResponse(userInput, context = []) {
        this.isLoading = true;
        
        try {
            const messages = [
                ...(context.length === 0 ? [{
                    role: 'system',
                    content: this.systemPrompt
                }] : []),
                ...context,
                { role: 'user', content: userInput }
            ];

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            const aiResponse = data.choices[0].message.content;
            context.push({ role: 'assistant', content: aiResponse });
            
            this.isLoading = false;
            return aiResponse;

        } catch (error) {
            this.isLoading = false;
            console.error('AI响应错误:', error);
            throw new Error('API调用失败: ' + error.message);
        }
    }

    _getCurrentTopic(context) {
        const topicKeywords = {
            personalGrowth: ['个人成长', '自我提升', '能力提升'],
            future: ['未来发展', '规划', '目标'],
            relationship: ['情感生活', '关系', '沟通'],
            career: ['职业发展', '工作', '事业']
        };

        for (const msg of context.slice().reverse()) {
            for (const [topic, keywords] of Object.entries(topicKeywords)) {
                if (keywords.some(keyword => msg.content.includes(keyword))) {
                    return topic;
                }
            }
        }
        return null;
    }

    async generateSummary(answers, topic) {
        const summaryPrompt = `请根据以下问答内容，生成一份详细的年度总结报告。
主题：${topic}

问答内容：
${answers.map(qa => `问：${qa.question}\n答：${qa.answer}`).join('\n\n')}

要求：
1. 报告要分析用户的具体情况
2. 给出有深度的见解
3. 提供实用的建议
4. 用温暖鼓励的语气
5. 适当使用emoji增加可读性
6. 报告长度至少500字
7. 分点列出主要发现和建议

格式参考：
📝 ${topic}年度总结报告

🌟 年度亮点
[分析用户的主要成就和进步]

💡 关键发现
[分析用户的具体情况]

📈 成长分析
[深入分析用户的成长轨迹]

🎯 建议展望
[提供具体可行的建议]

💪 寄语
[给出温暖有力的鼓励]`;

        return await this.getResponse(summaryPrompt, []);
    }
} 