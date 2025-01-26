class ChatLogic {
    constructor() {
        console.log('ChatLogic 初始化');
        this.aiService = new AIService();
        this.questionBank = new QuestionBank();
        this.currentTopic = null;
        this.context = [];
        this.userAnswers = new Map();
        this.isGeneratingSummary = false;
        this.minAnswerLength = 10;
        this.followUpQuestions = new Map();
        this.conversationDepth = new Map();
        this.maxFollowUpCount = 3;
        this.completedTopics = new Set();
        this.isChoosingNewTopic = false;
    }

    async handleUserInput(text) {
        console.log('收到用户输入:', text);
        console.log('当前完整状态:', {
            isChoosingNewTopic: this.isChoosingNewTopic,
            isGeneratingSummary: this.isGeneratingSummary,
            currentTopic: this.currentTopic,
            completedTopics: Array.from(this.completedTopics),
            userAnswers: this.userAnswers
        });

        if (!this.validateInput(text)) {
            return '请输入有效的内容（不少于2个字符）';
        }

        this.context.push({ role: 'user', content: text });

        try {
            if (this.isChoosingNewTopic) {
                if (text.toLowerCase() === '结束') {
                    console.log('用户选择结束，生成总结报告');
                    const summary = await this.generateFinalSummary();
                    this.reset();
                    return summary;
                }
                return this.handleTopicSelection(text);
            }

            if (!this.currentTopic) {
                return this.handleTopicSelection(text);
            }

            return await this.handleQuestionAnswer(text);
        } catch (error) {
            console.error('对话处理错误:', error);
            return '抱歉，处理您的回答时出现了问题。请重试。';
        }
    }

    validateInput(text) {
        return text && text.trim().length >= 2;
    }

    handleTopicSelection(text) {
        const topics = {
            '1': ['personalGrowth', '个人成长'],
            '2': ['future', '未来发展'],
            '3': ['relationship', '情感生活'],
            '4': ['career', '职业发展']
        };

        const matchedTopic = Object.entries(topics).find(([key, [code, name]]) => 
            key === text || text.includes(name)
        );

        if (matchedTopic) {
            const [_, [code, name]] = matchedTopic;
            
            if (this.completedTopics.has(code)) {
                return `这个方向我们已经聊过了。\n\n要不要选择其他方向，或输入"结束"生成总结报告？`;
            }

            this.currentTopic = code;
            this.isChoosingNewTopic = false;
            this.questionBank.resetTopic(code);
            const firstQuestion = this.questionBank.getNextQuestion(code);
            return `好的，让我们来聊聊${name}。\n\n${firstQuestion}`;
        }

        return '请选择有效的主题(1-4)或直接输入主题名称。\n\n可选主题：个人成长、未来发展、情感生活、职业发展';
    }

    async handleQuestionAnswer(text) {
        try {
            const currentQuestion = this.questionBank.getCurrentQuestion(this.currentTopic);
            if (!currentQuestion) {
                console.error('无法获取当前问题');
                return '抱歉，处理问题时出现错误。';
            }

            const answers = this.userAnswers.get(this.currentTopic) || [];
            answers.push({
                question: currentQuestion,
                answer: text
            });
            this.userAnswers.set(this.currentTopic, answers);

            const depth = this.conversationDepth.get(this.currentTopic) || 0;
            this.conversationDepth.set(this.currentTopic, depth + 1);

            if (depth >= this.maxFollowUpCount - 1) {
                this.completedTopics.add(this.currentTopic);
                
                const response = await this.aiService.generateResponse(
                    currentQuestion,
                    text,
                    this.context,
                    true
                );

                this.isChoosingNewTopic = true;
                this.currentTopic = null;

                const remainingTopics = ['personalGrowth', 'future', 'relationship', 'career']
                    .filter(topic => !this.completedTopics.has(topic));

                const topicNames = {
                    personalGrowth: '个人成长',
                    future: '未来发展',
                    relationship: '情感生活',
                    career: '职业发展'
                };

                const suggestions = remainingTopics
                    .map(topic => `${topicNames[topic]}`)
                    .join('、');

                return `${response}\n\n看来我们已经完成了这个方向的交流。${
                    remainingTopics.length > 0 
                        ? `\n\n还可以探讨：${suggestions}\n\n(直接输入想聊的方向，或输入"结束"生成总结报告)`
                        : '\n\n所有方向都已经聊完了，输入"结束"来生成总结报告吧！'
                }`;
            }

            const nextQuestion = this.questionBank.getNextQuestion(this.currentTopic);
            if (nextQuestion) {
                const transition = await this.generateTransition(currentQuestion, nextQuestion, text);
                return `${transition}\n\n${nextQuestion}`;
            }

            return await this.suggestNextTopic();

        } catch (error) {
            console.error('问题处理错误:', error);
            return '抱歉，处理您的回答时出现了问题。请重试。';
        }
    }

    analyzeAnswer(text) {
        const answer = text.trim();
        
        const hasDetails = answer.includes('因为') || answer.includes('所以') || 
                          answer.includes('但是') || answer.includes('而且');
        
        const isComplete = answer.length >= this.minAnswerLength && 
                          !answer.includes('不知道') && 
                          !answer.includes('随便');
                          
        const emotionalWords = ['觉得', '感觉', '认为', '希望', '担心', '开心', '难过'];
        const hasEmotion = emotionalWords.some(word => answer.includes(word));
        
        return !isComplete || (hasEmotion && !hasDetails);
    }

    async generateFollowUpQuestion(originalQuestion, answer) {
        const followUp = this.followUpQuestions.get(originalQuestion);
        if (followUp) {
            return followUp;
        }

        const prompt = `基于用户对"${originalQuestion}"的回答："${answer}"，生成一个更具体的跟进问题，引导用户深入思考和表达。`;
        const followUpQuestion = await this.aiService.generateFollowUpQuestion(prompt);
        
        return followUpQuestion;
    }

    async handleSummaryConfirmation(text) {
        const confirmation = text.trim().toLowerCase();
        if (['是', 'yes', 'y', '1'].includes(confirmation)) {
            const summary = await this.generateSummary();
            this.reset();
            return summary;
        } else if (['否', 'no', 'n', '0'].includes(confirmation)) {
            this.reset();
            return '好的，让我们重新开始。\n\n请选择要总结的方向：\n1. 个人成长\n2. 未来发展\n3. 情感生活\n4. 职业发展';
        } else {
            return '请回答"是"或"否"。';
        }
    }

    async generateSummary() {
        const answers = Array.from(this.userAnswers.entries()).map(([question, answer]) => ({
            question,
            answer
        }));

        const topicNames = {
            personalGrowth: '个人成长',
            future: '未来发展',
            relationship: '情感生活',
            career: '职业发展'
        };

        const topicName = topicNames[this.currentTopic];

        return await this.aiService.generateSummary(answers, topicName);
    }

    reset() {
        console.log('重置所有状态');
        this.currentTopic = null;
        this.context = [];
        this.userAnswers.clear();
        this.isGeneratingSummary = false;
        this.followUpQuestions.clear();
        this.conversationDepth.clear();
        this.questionBank.reset();
        this.completedTopics.clear();
        this.isChoosingNewTopic = false;
    }

    async generateTransition(currentQuestion, nextQuestion, lastAnswer) {
        const prompt = `基于用户对"${currentQuestion}"的回答："${lastAnswer}"，
请生成一个自然的过渡语，引导到下一个问题："${nextQuestion}"。
过渡语要：
1. 对用户的分享做简短的总结或认可
2. 解释为什么要问下一个问题
3. 让话题转换显得自然`;

        return await this.aiService.getResponse(prompt, this.context);
    }

    async suggestNextTopic() {
        console.log('suggestNextTopic被调用');
        console.log('当前完成的主题:', this.completedTopics);
        
        const allTopics = ['personalGrowth', 'future', 'relationship', 'career'];
        const remainingTopics = allTopics.filter(topic => !this.completedTopics.has(topic));
        
        console.log('剩余主题:', remainingTopics);

        if (remainingTopics.length === 0) {
            console.log('没有剩余主题，准备生成总结');
            this.isGeneratingSummary = true;
            return await this.generateFinalSummary();
        }

        this.isChoosingNewTopic = true;
        this.currentTopic = null;

        console.log('设置状态:', {
            isChoosingNewTopic: this.isChoosingNewTopic,
            currentTopic: this.currentTopic
        });

        const topicNames = {
            personalGrowth: '个人成长',
            future: '未来发展',
            relationship: '情感生活',
            career: '职业发展'
        };

        const suggestions = remainingTopics
            .map(topic => `${topicNames[topic]}`)
            .join('、');

        return `看来我们已经对这个方向有了深入的了解。要不要也聊聊其他方面？\n\n还可以探讨：${suggestions}\n\n(直接输入想聊的方向，或输入"结束"生成总结报告)`;
    }

    async generateFinalSummary() {
        console.log('生成总结报告，当前答案:', this.userAnswers);
        
        const allAnswers = Array.from(this.userAnswers.entries())
            .map(([topic, answers]) => ({
                topic,
                answers: Array.isArray(answers) ? answers : [answers]
            }));
            
        console.log('格式化后的答案:', allAnswers);
        
        return await this.aiService.generateFinalSummary(allAnswers);
    }
} 