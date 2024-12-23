export class QuestionBank {
    constructor() {
        this.questions = {
            '个人成长': [
                '今年最大的收获是什么？',
                '遇到了哪些挑战？',
                '有什么特别让你感到骄傲的事情吗？'
            ]
        };
    }

    getRandomQuestion(category) {
        const questions = this.questions[category];
        const index = Math.floor(Math.random() * questions.length);
        return questions[index];
    }
} 