class QuestionBank {
    constructor() {
        this.questions = {
            personalGrowth: [
                "What was your biggest personal achievement this year?",
                "What new skills did you develop in the past year?",
                "What personal challenge did you overcome this year?",
                "How have you changed as a person in the last year?"
            ],
            future: [
                "What are your key goals for the coming year?",
                "What skills would you like to develop next year?",
                "What changes are you planning to make in your life?",
                "Where do you see yourself in one year from now?"
            ],
            relationship: [
                "How have your relationships evolved this year?",
                "What was the most meaningful connection you formed this year?",
                "What did you learn about relationships this year?",
                "How would you like your relationships to develop in the coming year?"
            ],
            career: [
                "What was your biggest professional achievement this year?",
                "What challenges did you face in your career this year?",
                "How have your career goals evolved?",
                "What professional skills would you like to develop next year?"
            ]
        };
        
        this.currentIndexes = {
            personalGrowth: 0,
            future: 0,
            relationship: 0,
            career: 0
        };
    }

    // 获取当前问题
    getCurrentQuestion(topic) {
        if (!this.questions[topic]) {
            console.error('无效的主题:', topic);
            return null;
        }

        const currentIndex = (this.currentIndexes[topic] || 0) - 1;
        return this.questions[topic][currentIndex];
    }

    // 获取下一个问题
    getNextQuestion(topic) {
        if (!this.questions[topic]) {
            console.error('无效的主题:', topic);
            return null;
        }

        const questions = this.questions[topic];
        let currentIndex = this.currentIndexes[topic] || 0;
        
        // 检查是否还有下一个问题
        if (currentIndex >= questions.length) {
            return null;
        }

        // 记录当前问题索引
        this.currentIndexes[topic] = currentIndex + 1;
        return questions[currentIndex];
    }

    // 重置某个方向的问题记录
    resetTopic(topic) {
        if (!this.questions[topic]) {
            console.error('无效的主题:', topic);
            return;
        }
        this.currentIndexes[topic] = 0;
    }

    // 重置所有记录
    reset() {
        for (const topic in this.currentIndexes) {
            this.currentIndexes[topic] = 0;
        }
    }

    // 添加新方法
    getTopicProgress(topic) {
        if (!this.questions[topic]) {
            return null;
        }
        const currentIndex = this.currentIndexes[topic] || 0;
        return {
            current: currentIndex,
            total: this.questions[topic].length
        };
    }

    hasMoreQuestions(topic) {
        if (!this.questions[topic]) {
            return false;
        }
        const currentIndex = this.currentIndexes[topic] || 0;
        return currentIndex < this.questions[topic].length;
    }
}