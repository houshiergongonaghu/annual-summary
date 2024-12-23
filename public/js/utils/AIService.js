class AIService {
    constructor() {
        this.basePrompt = "你是一个年度总结分析师，名叫胖虎。请根据用户的回答，给出温暖、积极、有见地的建议。";
        this.isLoading = false;
        
        // 模拟更智能的回复模板
        this.responseTemplates = {
            personalGrowth: {
                skills: [
                    "学习新技能确实需要勇气和毅力，你做得很好！",
                    "这个技能对你的未来发展很有帮助，继续加油！",
                    "看得出你在这方面投入了很多努力，非常棒！"
                ],
                challenges: [
                    "面对挑战的态度非常积极，这正是成长的关键！",
                    "克服困难的过程虽然辛苦，但收获满满！",
                    "这个经历一定让你收获了宝贵的经验。"
                ],
                achievements: [
                    "这是一个值得骄傲的成就，继续保持！",
                    "看得出你在这方面很有天赋和热情。",
                    "这个成就证明了你的潜力和努力。"
                ]
            },
            future: {
                goals: [
                    "你的目标很明确，相信一定能实现！",
                    "规划得很好，建议可以制定一个详细的时间表。",
                    "这些目标既有挑战性又很实际，很棒！"
                ],
                plans: [
                    "计划制定得很详细，执行时要保持耐心。",
                    "分步骤实现确实是个好方法，继续加油！",
                    "看得出你对未来充满期待，这种态度很好！"
                ]
            },
            relationship: {
                experiences: [
                    "感情经历让我们更了解自己，这是很宝贵的。",
                    "你对感情的态度很成熟，这很难得。",
                    "这些经历都是成长的养分，相信会让你更好。"
                ],
                learnings: [
                    "你从中学到了很多，这些感悟很有价值。",
                    "理解和包容确实是感情中最重要的。",
                    "保持这种积极的心态，爱会如期而至。"
                ]
            },
            career: {
                progress: [
                    "职业发展很稳健，继续保持这种步调！",
                    "你在工作中展现出了很强的学习能力。",
                    "这些进步为你的职业发展打下了好基础。"
                ],
                skills: [
                    "专业能力的提升非常明显，继续加油！",
                    "这些技能在未来一定会很有帮助。",
                    "善于学习和总结是非常难得的品质。"
                ]
            }
        };
    }

    async getResponse(userInput, context = []) {
        this.isLoading = true;
        
        try {
            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 分析上下文，生成更相关的回复
            const response = this.generateContextAwareResponse(userInput, context);
            
            this.isLoading = false;
            return response;
        } catch (error) {
            this.isLoading = false;
            console.error('AI响应错误:', error);
            throw new Error('生成回复时出现错误，请重试。');
        }
    }

    generateContextAwareResponse(userInput, context) {
        // 分析上下文中的主题
        const topic = this.analyzeContext(context);
        
        // 根据主题和输入生成回复
        if (topic) {
            const templates = this.responseTemplates[topic];
            if (templates) {
                // 选择最相关的模板类别
                const category = this.selectResponseCategory(userInput, templates);
                const responses = templates[category];
                
                // 随机选择一个回复
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }

        // 如果是总结请求
        if (userInput.includes('总结')) {
            return this.generateSummaryResponse(context);
        }

        // 默认回复
        return "你说得很好！让我们继续深入探讨这个话题。";
    }

    analyzeContext(context) {
        // 分析上下文，确定当前主题
        const topicKeywords = {
            personalGrowth: ['成长', '学习', '进步', '克服', '收获'],
            future: ['目标', '规划', '计划', '未来', '展望'],
            relationship: ['感情', '关系', '交往', '沟通'],
            career: ['工作', '职业', '事业', '技能', '发展']
        };

        // 获取最后几条对话
        const recentContext = context.slice(-3);
        
        // 统计关键词出现频率
        const topicCounts = {};
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            topicCounts[topic] = keywords.reduce((count, keyword) => {
                return count + recentContext.filter(msg => 
                    msg.content.includes(keyword)
                ).length;
            }, 0);
        });

        // 返回最频繁的主题
        return Object.entries(topicCounts)
            .sort(([,a], [,b]) => b - a)[0][0];
    }

    selectResponseCategory(input, templates) {
        // 根据输入内容选择最相关的回复类别
        const categories = Object.keys(templates);
        return categories[Math.floor(Math.random() * categories.length)];
    }

    generateSummaryResponse(context) {
        // 生成总结性回复
        const summaryTemplates = [
            "从我们的对话中可以看出，你在这方面有很大的进步和潜力。继续保持这种积极的态度！",
            "总的来说，你的思路很清晰，规划也很实际。相信通过努力，一定能实现你的目标。",
            "这段时间的经历让你成长了很多，未来一定会更好！"
        ];

        return summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];
    }
} 