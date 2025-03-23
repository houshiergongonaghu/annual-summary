class QuestionBank {
    constructor() {
        this.questions = {
            personalGrowth: [
                "今年你在哪些方面有了明显的进步？",
                "遇到过什么挑战，是如何克服的？",
                "有什么新学会的技能或知识？",
                "对自己有了哪些新的认识？"
            ],
            future: [
                "对明年有什么期待和规划？",
                "想要实现哪些具体的目标？",
                "准备如何提升自己？",
                "对未来有什么新的想法？"
            ],
            relationship: [
                "今年人际关系有什么变化？",
                "与重要的人相处得如何？",
                "学到了哪些与人相处的经验？",
                "想要改善哪些人际关系？"
            ],
            career: [
                "工作上有什么成就或突破？",
                "职业发展遇到什么机遇或挑战？",
                "对目前的工作状态满意吗？",
                "对职业规划有什么调整？"
            ]
        };
        
        this.currentIndices = new Map(); // 添加当前问题索引追踪
    }

    // 获取当前问题
    getCurrentQuestion(topic) {
        if (!this.questions[topic]) {
            console.error('无效的主题:', topic);
            return null;
        }

        const currentIndex = (this.currentIndices.get(topic) || 0) - 1;
        return this.questions[topic][currentIndex];
    }

    // 获取下一个问题
    getNextQuestion(topic) {
        if (!this.questions[topic]) {
            console.error('无效的主题:', topic);
            return null;
        }

        const questions = this.questions[topic];
        let currentIndex = this.currentIndices.get(topic) || 0;
        
        // 检查是否还有下一个问题
        if (currentIndex >= questions.length) {
            return null;
        }

        // 记录当前问题索引
        this.currentIndices.set(topic, currentIndex + 1);
        return questions[currentIndex];
    }

    // 重置某个方向的问题记录
    resetTopic(topic) {
        if (!this.questions[topic]) {
            console.error('无效的主题:', topic);
            return;
        }
        this.currentIndices.delete(topic);
    }

    // 重置所有记录
    reset() {
        this.currentIndices.clear();
    }

    // 添加新方法
    getTopicProgress(topic) {
        if (!this.questions[topic]) {
            return null;
        }
        const currentIndex = this.currentIndices.get(topic) || 0;
        return {
            current: currentIndex,
            total: this.questions[topic].length
        };
    }

    hasMoreQuestions(topic) {
        if (!this.questions[topic]) {
            return false;
        }
        const currentIndex = this.currentIndices.get(topic) || 0;
        return currentIndex < this.questions[topic].length;
    }
}