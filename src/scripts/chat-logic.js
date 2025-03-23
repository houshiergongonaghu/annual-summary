export class ChatLogic {
    constructor() {
        this.ai = new AIService();
        this.questionBank = new QuestionBank();
        this.currentStage = 'DIRECTION_SELECTION';
        this.selectedDirection = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
    }

    async handleUserInput(input) {
        switch(this.currentStage) {
            case 'DIRECTION_SELECTION':
                return this.handleDirectionSelection(input);
            case 'ANSWERING_QUESTIONS':
                return this.handleQuestionAnswer(input);
            case 'SUMMARY':
                return this.generateSummary();
        }
    }

    async handleQuestionAnswer(text) {
        const currentQuestion = this.questionBank.getNextQuestion(this.currentTopic);
        
        // 记录用户回答
        this.userAnswers.set(currentQuestion, text);

        // 获取AI响应
        const response = await this.aiService.getResponse(text, this.context);
        this.context.push({ role: 'assistant', content: response });

        // 获取下一个问题
        const nextQuestion = this.questionBank.getNextQuestion(this.currentTopic);

        if (nextQuestion) {
            return `${response}\n\n${nextQuestion}`;
        } else {
            this.isGeneratingSummary = true;
            return `${response}\n\n看起来我们已经聊完了这个方向的问题。要为您生成总结吗？(请回答"是"或"否")`;
        }
    }

    // 重置时也要重置问题库
    reset() {
        this.currentTopic = null;
        this.questionIndex = 0;
        this.context = [];
        this.userAnswers.clear();
        this.isGeneratingSummary = false;
        this.questionBank.resetAll();
    }

    // ... 其他方法 ...
} 