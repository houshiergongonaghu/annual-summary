class AIService {
    constructor() {
        this.API_URL = '/api/chat';
        
        this.systemPrompt = `你是一位名叫胖虎的年度总结分析师，是一个温暖、真诚的对话伙伴。

核心原则：
1. 真诚共情：深入理解用户的情感和经历
2. 个性化回应：针对用户的具体分享给出独特见解
3. 循序渐进：通过自然的追问深入话题
4. 平等对话：以朋友的身份交流，避免说教

对话策略：
1. 回应用户时：
- 首先对用户的分享表示理解和认可
- 分享类似的经历或感受建立共鸣
- 提出有深度的见解或建议
- 用开放性问题自然引导深入

2. 话题切换时：
- 找到当前话题和新话题的关联点
- 解释为什么要聊这个新话题
- 平滑过渡避免突兀

3. 追问策略：
- 针对用户提到的关键词展开
- 引导用户说出具体的例子
- 探讨背后的原因和感受
- 帮助用户获得新的认知

始终记住：每次回应都要：
1. 体现真诚的理解
2. 给出个性化的见解
3. 自然地引导深入
4. 保持对话的连贯性`;

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

    async getResponse(text, context, isFollowUp = false) {
        this.isLoading = true;
        
        try {
            // 根据是否是跟进对话调整prompt
            const prompt = isFollowUp ? 
                this.generateFollowUpPrompt(text, context) :
                this.generateNormalPrompt(text, context);

            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                },
                ...context,
                { 
                    role: 'user', 
                    content: prompt 
                }
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
            this.isLoading = false;
            return aiResponse;

        } catch (error) {
            this.isLoading = false;
            console.error('AI响应错误:', error);
            throw error;
        }
    }

    // 生成跟进问题的prompt
    generateFollowUpPrompt(text, context) {
        const recentContext = context.slice(-3); // 获取最近的对话上下文
        
        return `基于以下对话上下文：
${recentContext.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

用户刚才的回答是："${text}"

请以朋友的身份生成一个自然的回应，包括：
1. 对用户分享的理解和认可
2. 分享相关的经历或感受(可选)
3. 一个能够引导用户更深入思考和分享的问题

注意：
- 回应要体现出你真的理解和关心用户
- 追问要自然，像朋友间的对话
- 避免生硬的说教和客套话
- 问题要具体，不要太宽泛`;
    }

    // 生成常规对话的prompt
    generateNormalPrompt(text, context) {
        const currentTopic = this._getCurrentTopic(context);
        const strategy = this.dialogueStrategies[currentTopic];
        
        return `作为一个${strategy.style}的对话伙伴，请对用户的分享："${text}"生成回应。

回应要求：
1. 表达真诚的理解和认可
2. 给出个性化的见解
3. 分享相关的经历或感受
4. 自然地引导继续交流

重点关注：${strategy.focus}
关键词：${strategy.emphasis.join(', ')}`;
    }

    // 生成跟进问题
    async generateFollowUpQuestion(prompt) {
        try {
            const response = await this.getResponse(prompt, [], true);
            // 确保返回的是一个问题
            if (!response.endsWith('？') && !response.endsWith('?')) {
                return response + '？';
            }
            return response;
        } catch (error) {
            console.error('生成跟进问题错误:', error);
            throw error;
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

    async generateFinalSummary(allAnswers) {
        const summaryPrompt = `请根据用户在不同方向的分享，生成一份全面的年度总结报告。

用户的分享内容：
${allAnswers.map(({topic, answers}) => `
${this.getTopicName(topic)}:
${answers.map(qa => `问：${qa.question}\n答：${qa.answer}`).join('\n')}
`).join('\n')}

要求：
1. 分析用户在各个方向的表现和特点
2. 发现用户的潜在特质和优势
3. 找出不同方向之间的联系
4. 提供有建设性的建议
5. 用温暖鼓励的语气
6. 让用户对自己更有信心
7. 对未来充满希望

格式参考：
📝 2023年度总结报告

🌟 年度亮点
[总结用户的主要成就和进步]

💡 特质发现
[分析用户的独特品质]

📈 多维度分析
[从不同方向分析用户的表现]

🎯 发展建议
[提供具体可行的建议]

💪 未来展望
[给出温暖有力的鼓励]`;

        return await this.getResponse(summaryPrompt, []);
    }

    getTopicName(topic) {
        const names = {
            personalGrowth: '个人成长',
            future: '未来发展',
            relationship: '情感生活',
            career: '职业发展'
        };
        return names[topic] || topic;
    }
} 