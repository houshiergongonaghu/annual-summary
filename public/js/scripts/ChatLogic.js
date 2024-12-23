class ChatLogic {
    constructor() {
        this.aiService = new AIService();
        this.questionBank = new QuestionBank();
        this.currentTopic = null;
        this.questionIndex = 0;
        this.context = [];
        this.userAnswers = new Map();
        this.isGeneratingSummary = false;
    }

    async handleUserInput(text) {
        if (!this.validateInput(text)) {
            return '请输入有效的内容（不少于2个字符）';
        }

        this.context.push({ role: 'user', content: text });

        try {
            if (!this.currentTopic) {
                return this.handleTopicSelection(text);
            }

            if (this.isGeneratingSummary) {
                return this.handleSummaryConfirmation(text);
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
            key === text || text === name
        );

        if (matchedTopic) {
            const [_, [code, name]] = matchedTopic;
            this.currentTopic = code;
            const firstQuestion = this.questionBank.getNextQuestion(code, this.questionIndex++);
            return `好的，让我们来聊聊${name}。\n\n${firstQuestion}`;
        }

        return '请选择有效的主题(1-4)或直接输入主题名称。\n\n可选主题：个人成长、未来发展、情感生活、职业发展';
    }

    async handleQuestionAnswer(text) {
        const currentQuestion = this.questionBank.getNextQuestion(
            this.currentTopic, 
            this.questionIndex - 1
        );
        
        this.userAnswers.set(currentQuestion, text);

        const response = await this.aiService.getResponse(text, this.context);
        this.context.push({ role: 'assistant', content: response });

        const nextQuestion = this.questionBank.getNextQuestion(
            this.currentTopic, 
            this.questionIndex++
        );

        if (nextQuestion) {
            return `${response}\n\n${nextQuestion}`;
        } else {
            this.isGeneratingSummary = true;
            return `${response}\n\n看起来我们已经聊完了所有问题。要为您生成总结吗？(请回答"是"或"否")`;
        }
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
        const answers = Array.from(this.userAnswers.entries())
            .map(([question, answer]) => `问：${question}\n答：${answer}`)
            .join('\n\n');

        const summaryPrompt = `
            基于以下问答内容，生成一个温暖、积极、有见地的总结：
            ${answers}
        `;

        return await this.aiService.getResponse(summaryPrompt, [
            { role: 'system', content: '请生成一个鼓励的、有见地的总结' },
            { role: 'user', content: summaryPrompt }
        ]);
    }

    reset() {
        this.currentTopic = null;
        this.questionIndex = 0;
        this.context = [];
        this.userAnswers.clear();
        this.isGeneratingSummary = false;
    }
} 