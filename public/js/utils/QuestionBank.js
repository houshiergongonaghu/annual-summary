class QuestionBank {
    constructor() {
        this.questions = {
            personalGrowth: [
                "今年你最大的成长是什么？",
                "有什么新学会的技能？",
                "克服了什么困难？"
            ],
            future: [
                "明年最想实现的目标是什么？",
                "有什么新的规划？",
                "准备如何实现这些目标？"
            ],
            relationship: [
                "今年感情生活有什么变化？",
                "人际关系有什么收获？",
                "对未来的感情有什么期待？"
            ],
            career: [
                "职业上有什么进步？",
                "工作中学到了什么？",
                "对事业有什么新规划？"
            ]
        };
    }

    getQuestionsByType(type) {
        return this.questions[type] || [];
    }

    getNextQuestion(type, index) {
        const questions = this.getQuestionsByType(type);
        return questions[index] || null;
    }
} 