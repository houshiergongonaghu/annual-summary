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

    // ... 其他方法 ...
} 