// 简单的问题库实现
class QuestionBank {
    constructor() {
        this.questions = {
            '个人成长': [
                '今年最大的收获是什么？',
                '遇到了哪些挑战？',
                // 可以轻松添加更多问题
            ]
        };
    }

    // 获取随机问题
    getRandomQuestion(category) {
        const questions = this.questions[category];
        const index = Math.floor(Math.random() * questions.length);
        return questions[index];
    }
} 