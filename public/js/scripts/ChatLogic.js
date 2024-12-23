class ChatLogic {
    constructor() {
        this.aiService = new AIService();
        this.questionBank = new QuestionBank();
        this.currentTopic = null;
        this.questionIndex = 0;
        this.context = [];
    }

    async handleUserInput(text) {
        this.context.push({ role: 'user', content: text });

        if (!this.currentTopic) {
            return this.handleTopicSelection(text);
        }

        const response = await this.aiService.getResponse(text, this.context);
        this.context.push({ role: 'assistant', content: response });

        const nextQuestion = this.questionBank.getNextQuestion(
            this.currentTopic, 
            this.questionIndex++
        );

        return nextQuestion 
            ? response + '\n\n' + nextQuestion 
            : response + '\n\n让我们来总结一下你的回答...';
    }

    handleTopicSelection(text) {
        const topics = {
            '1': 'personalGrowth',
            '个人成长': 'personalGrowth',
            '2': 'future',
            '未来发展': 'future',
            '3': 'relationship',
            '情感生活': 'relationship',
            '4': 'career',
            '职业发展': 'career'
        };

        this.currentTopic = topics[text];
        
        if (this.currentTopic) {
            const firstQuestion = this.questionBank.getNextQuestion(
                this.currentTopic, 
                this.questionIndex++
            );
            return `好的，让我们来聊聊${text}。\n\n${firstQuestion}`;
        }

        return '请选择有效的主题(1-4)或直接输入主题名称。';
    }
} 