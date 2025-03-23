console.log('AIService.js 已加载');

class AIService {
    constructor() {
        // 检测是否在本地开发环境
        const isLocalDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        // 根据环境选择API URL
        this.API_URL = isLocalDev 
            ? '/api/chat'  // 本地开发URL (相对路径)
            : 'https://annual-summary-api.daisyquanzhixian.workers.dev/api/chat';
        
        console.log('使用API URL:', this.API_URL);
        this.isLoading = false;
        
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

        // 添加请求超时设置
        this.timeout = 30000; // 30秒
    }

    async getResponse(text, context = [], isFollowUp = false, isSummary = false) {
        try {
            this.isLoading = true;
            
            // 构建messages数组
            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                }
            ];

            // 添加上下文消息
            if (Array.isArray(context) && context.length > 0) {
                messages.push(...context);
            }

            // 添加当前问题
            messages.push({
                role: 'user',
                content: text
            });

            // 打印请求信息
            console.log('发送请求:', {
                url: this.API_URL,
                messages: messages
            });

            // 发送请求
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages,
                    model: 'deepseek-chat',
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            // 检查响应
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '请求失败');
            }

            const data = await response.json();
            this.isLoading = false;

            return data.choices[0].message.content;
        } catch (error) {
            this.isLoading = false;
            console.error('API请求错误:', error);
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
        // 添加默认策略，防止 strategy 为 undefined
        const strategy = this.dialogueStrategies[currentTopic] || {
            style: '温暖真诚',
            focus: '整体表现',
            emphasis: ['成长', '收获', '展望']
        };
        
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
        try {
            console.log('开始生成最终总结');
            this.isLoading = true;

            const summaryPrompt = `作为一位专业的年度总结分析师，请基于用户在不同方向的分享，生成一份深度洞察的年度总结报告。

用户的分享内容：${JSON.stringify(allAnswers, null, 2)}

分析要求：
1. 多维度分析
   - 分析用户在各个方向的表现特点
   - 发现不同方向之间的内在联系
   - 识别用户的核心价值观和行为模式
   
2. 深度洞察
   - 从用户的表达方式中解读性格特征
   - 发现用户可能没有意识到的个人特质
   - 揭示潜在的心理需求和动机
   - 分析用户的决策倾向和思维方式
   
3. 个性化见解
   - 找出用户独特的优势组合
   - 发现用户特有的成长机会
   - 提供有针对性的发展建议
   
4. 跨领域关联
   - 分析不同领域的经历如何相互影响
   - 发现用户生活中的潜在模式
   - 揭示个人发展的内在逻辑

5. 前瞻性建议
   - 基于深度分析提供建设性建议
   - 指出潜在的发展机会
   - 建议具体可行的行动方案

格式要求：
📊 多维度分析报告

🔍 深度洞察
- 核心特质解读
- 潜在模式分析
- 独特优势发现
- 思维倾向剖析

💫 个人特质全景
- 性格特征
- 价值观取向
- 决策风格
- 成长倾向

🌟 潜力探索
- 未被充分发挥的优势
- 潜在发展机会
- 可能的突破方向

🎯 精准建议
- 针对性的提升方向
- 具体的行动建议
- 可能的发展路径

💡 独特发现
[分享一些用户可能没有意识到的，但从整体分析中发现的独特见解]

🎁 寄语
[给出温暖有力的鼓励，突出用户的独特价值]

注意事项：
1. 分析要有深度，避免表面总结
2. 见解要独特，给出用户意想不到的洞察
3. 建议要具体，便于用户行动
4. 语气要温暖，富有共情
5. 突出用户的独特性，避免泛泛而谈
6. 多角度交叉分析，发现深层联系`;

            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                },
                {
                    role: 'user',
                    content: summaryPrompt
                }
            ];

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.isLoading = false;

            if (data.error) {
                throw new Error(data.error);
            }

            return data.choices[0].message.content;

        } catch (error) {
            this.isLoading = false;
            console.error('生成总结报告错误:', error);
            return '抱歉，生成总结报告时出现错误。请稍后重试。';
        }
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

    async generateResponse(question, answer, context, isLastQuestion = false) {
        try {
            // 确保context是数组
            const currentContext = Array.isArray(context) ? context : [];
            
            // 构建新的消息
            const newMessage = {
                role: 'user',
                content: `问题：${question}\n用户回答：${answer}`
            };
            
            // 构建完整上下文
            const fullContext = [...currentContext, newMessage];
            
            // 构建提示词
            const prompt = isLastQuestion ? 
                '这是当前方向的最后一个问题，请生成一个温暖的总结性回应，肯定用户的分享，并给出一些建议或启发。' :
                '请根据用户的回答生成温暖的回应，并自然地引导到下一个问题。';

            // 调用API
            return await this.getResponse(prompt, fullContext, true, isLastQuestion);
        } catch (error) {
            console.error('生成回应错误:', error);
            throw error;
        }
    }
}

if (typeof window !== 'undefined') {
    window.aiService = new AIService();
    console.log('AIService 已实例化:', window.aiService);
} 
