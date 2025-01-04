// 简单的问题库实现
class QuestionBank {
    constructor() {
        // 按方向存储问题库
        this.questions = {
            personalGrowth: [
                "你今年做了哪些之前从未做过的事？",
                "你有没有遵守年初时和自己许下的约定？",
                "今年的哪个或哪些日子会铭刻在你的记忆中，为什么？",
                // ...其他个人成长问题
            ],
            future: [
                "明年你想要获得哪些你今年没有的东西？",
                "有什么还未发生的事，如果发生了，会让你的这一年变得无比满足？"
            ],
            relationship: [
                "你身边有人生孩子了吗？",
                "你身边有人去世了吗？",
                "谁的行为值得去表扬？",
                // ...其他情感生活问题
            ],
            career: [
                "你大部分的钱都花到哪里去了？",
                "你今年买过的最好的东西是什么？",
                "你今年看过最喜欢的一部电影是什么？",
                // ...其他学习娱乐问题
            ]
        };
        
        // 记录每个方向已问过的问题
        this.askedQuestions = {
            personalGrowth: new Set(),
            future: new Set(),
            relationship: new Set(),
            career: new Set()
        };
    }

    // 获取下一个问题
    getNextQuestion(topic) {
        const questions = this.questions[topic];
        const asked = this.askedQuestions[topic];
        
        // 过滤出未问过的问题
        const availableQuestions = questions.filter(q => !asked.has(q));
        
        // 如果所有问题都问过了,返回null
        if (availableQuestions.length === 0) {
            return null;
        }
        
        // 随机选择一个问题
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const selectedQuestion = availableQuestions[randomIndex];
        
        // 记录这个问题已经被问过
        asked.add(selectedQuestion);
        
        return selectedQuestion;
    }

    // 重置某个方向的问题记录
    resetTopic(topic) {
        this.askedQuestions[topic].clear();
    }

    // 重置所有方向的问题记录
    resetAll() {
        Object.keys(this.askedQuestions).forEach(topic => {
            this.askedQuestions[topic].clear();
        });
    }
} 