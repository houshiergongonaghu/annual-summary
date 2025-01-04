class QuestionBank {
    constructor() {
      this.questions = {
        personalGrowth: [
          "你今年做了哪些之前从未做过的事？",
          "你有没有遵守年初时和自己许下的约定？",
          "今年的哪个或哪些日子会铭刻在你的记忆中，为什么？",
          "你今年最大的成就是什么？",
          "你今年最大的失败是什么？",
          "你今年还遇到过哪些困难？",
          "与去年的这个时候相比，你是：感到更快乐还是更悲伤了？变得更瘦还是更胖了？变得更富还是更穷了？",
          "你希望自己能做得更多的是什么？",
          "你希望自己能做得更少的是什么？",
          "是什么让你保持理智？",
          "今年你学到了什么宝贵的人生经验？",
          "能够总结你这一年的一句话是什么？",
          "你会如何描述你今年的个人时尚风格？"
        ],
        future: [
          "明年你想要获得哪些你今年没有的东西？",
          "有什么还未发生的事，如果发生了，会让你的这一年变得无比满足？"
        ],
        relationship: [
          "你身边有人生孩子了吗？",
          "你身边有人去世了吗？",
          "谁的行为值得去表扬？",
          "谁的行为令你感到震惊？",
          "有什么事让你感到超级、超级、超级兴奋？",
          "你今年坠入爱河了吗？",
          "你想念哪些人？",
          "你是否有讨厌某个你去年此时不觉得讨厌的人呢？",
          "在你新认识的人之中，谁是最好的？"
        ],
        career: [
          "你大部分的钱都花到哪里去了？",
          "你今年买过的最好的东西是什么？",
          "你今年看过最喜欢的一部电影是什么？",
          "你今年吃过最好吃的一顿饭是什么？"
        ]
      };

      // 记录每个方向已问过的问题索引
      this.askedQuestions = {
        personalGrowth: new Set(),
        future: new Set(),
        relationship: new Set(),
        career: new Set()
      };
    }
  
    // 获取下一个问题
    getNextQuestion(direction) {
      const questions = this.questions[direction];
      const asked = this.askedQuestions[direction];
      
      // 如果所有问题都问过了
      if (asked.size >= questions.length) {
        return null;
      }

      // 找到一个未问过的问题
      let availableIndices = [];
      for (let i = 0; i < questions.length; i++) {
        if (!asked.has(i)) {
          availableIndices.push(i);
        }
      }

      // 随机选择一个未问过的问题
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      const selectedIndex = availableIndices[randomIndex];
      
      // 记录这个问题已经被问过
      asked.add(selectedIndex);
      
      return questions[selectedIndex];
    }

    // 重置某个方向的问题记录
    resetTopic(direction) {
      if (this.askedQuestions[direction]) {
        this.askedQuestions[direction].clear();
      }
    }

    // 重置所有方向的问题记录
    resetAll() {
      Object.keys(this.askedQuestions).forEach(direction => {
        this.askedQuestions[direction].clear();
      });
    }
}