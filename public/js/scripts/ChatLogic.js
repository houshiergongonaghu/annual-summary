class ChatLogic {
    constructor() {
        console.log('ChatLogic 初始化');
        this.aiService = new AIService();
        this.questionBank = new QuestionBank();
        this.currentTopic = null;
        this.context = [];
        this.userAnswers = new Map();
        this.isGeneratingSummary = false;
        this.minAnswerLength = 10;
        this.followUpQuestions = new Map();
        this.conversationDepth = new Map();
        this.maxFollowUpCount = 3;
        this.completedTopics = new Set();
        this.isChoosingNewTopic = false;
    }

    async handleUserInput(text) {
        console.log('Received user input:', text);
        console.log('Current complete state:', {
            isChoosingNewTopic: this.isChoosingNewTopic,
            isGeneratingSummary: this.isGeneratingSummary,
            currentTopic: this.currentTopic,
            completedTopics: Array.from(this.completedTopics),
            userAnswers: this.userAnswers
        });

        if (!this.validateInput(text)) {
            return 'Please enter valid content (at least 2 characters)';
        }

        this.context.push({ role: 'user', content: text });

        try {
            if (this.isChoosingNewTopic) {
                if (text.toLowerCase() === 'end') {
                    console.log('User chose to end, generating final summary');
                    const summary = await this.generateFinalSummary();
                    this.reset();
                    return summary;
                }
                return this.handleTopicSelection(text);
            }

            if (!this.currentTopic) {
                return this.handleTopicSelection(text);
            }

            return await this.handleQuestionAnswer(text);
        } catch (error) {
            console.error('Conversation processing error:', error);
            return 'Sorry, there was a problem processing your response. Please try again.';
        }
    }

    validateInput(text) {
        return text && text.trim().length >= 2;
    }

    handleTopicSelection(text) {
        const topics = {
            '1': ['personalGrowth', 'Personal Growth'],
            '2': ['future', 'Future Development'],
            '3': ['relationship', 'Relationships'],
            '4': ['career', 'Career Development']
        };

        const matchedTopic = Object.entries(topics).find(([key, [code, name]]) => 
            key === text || text.includes(name)
        );

        if (matchedTopic) {
            const [_, [code, name]] = matchedTopic;
            
            if (this.completedTopics.has(code)) {
                return `We've already discussed this direction. Would you like to choose another direction, or type "end" to generate a summary report?`;
            }

            this.currentTopic = code;
            this.isChoosingNewTopic = false;
            this.questionBank.resetTopic(code);
            const firstQuestion = this.questionBank.getNextQuestion(code);
            return `Great, let's talk about ${name}.\n\n${firstQuestion}`;
        }

        return 'Please select a valid topic (1-4) or enter the topic name directly.\n\nAvailable topics: Personal Growth, Future Development, Relationships, Career Development';
    }

    async handleQuestionAnswer(text) {
        try {
            const currentQuestion = this.questionBank.getCurrentQuestion(this.currentTopic);
            if (!currentQuestion) {
                console.error('无法获取当前问题');
                return '抱歉，处理问题时出现错误。';
            }

            const answers = this.userAnswers.get(this.currentTopic) || [];
            answers.push({
                question: currentQuestion,
                answer: text
            });
            this.userAnswers.set(this.currentTopic, answers);

            const depth = this.conversationDepth.get(this.currentTopic) || 0;
            this.conversationDepth.set(this.currentTopic, depth + 1);

            if (depth >= this.maxFollowUpCount - 1) {
                this.completedTopics.add(this.currentTopic);
                
                const response = await this.aiService.generateResponse(
                    currentQuestion,
                    text,
                    this.context,
                    true
                );

                this.isChoosingNewTopic = true;
                this.currentTopic = null;

                const remainingTopics = ['personalGrowth', 'future', 'relationship', 'career']
                    .filter(topic => !this.completedTopics.has(topic));

                const topicNames = {
                    personalGrowth: 'Personal Growth',
                    future: 'Future Development',
                    relationship: 'Relationships',
                    career: 'Career Development'
                };

                const suggestions = remainingTopics
                    .map(topic => `${topicNames[topic]}`)
                    .join(', ');

                return `${response}\n\n${
                    remainingTopics.length > 0 
                        ? `\n\nWe can also explore: ${suggestions}\n\n(Type the direction you'd like to discuss, or type "end" to generate a summary report)`
                        : '\n\nWe have completed all directions. Type "end" to generate your summary report!'
                }`;
            }

            const nextQuestion = this.questionBank.getNextQuestion(this.currentTopic);
            if (nextQuestion) {
                const transition = await this.generateTransition(currentQuestion, nextQuestion, text);
                return `${transition}\n\n${nextQuestion}`;
            }

            return await this.suggestNextTopic();

        } catch (error) {
            console.error('问题处理错误:', error);
            return '抱歉，处理您的回答时出现了问题。请重试。';
        }
    }

    analyzeAnswer(text) {
        const answer = text.trim();
        
        const hasDetails = answer.includes('因为') || answer.includes('所以') || 
                          answer.includes('但是') || answer.includes('而且');
        
        const isComplete = answer.length >= this.minAnswerLength && 
                          !answer.includes('不知道') && 
                          !answer.includes('随便');
                          
        const emotionalWords = ['觉得', '感觉', '认为', '希望', '担心', '开心', '难过'];
        const hasEmotion = emotionalWords.some(word => answer.includes(word));
        
        return !isComplete || (hasEmotion && !hasDetails);
    }

    async generateFollowUpQuestion(originalQuestion, answer) {
        const followUp = this.followUpQuestions.get(originalQuestion);
        if (followUp) {
            return followUp;
        }

        const prompt = `基于用户对"${originalQuestion}"的回答："${answer}"，生成一个更具体的跟进问题，引导用户深入思考和表达。`;
        const followUpQuestion = await this.aiService.generateFollowUpQuestion(prompt);
        
        return followUpQuestion;
    }

    async handleSummaryConfirmation(text) {
        const confirmation = text.trim().toLowerCase();
        if (['yes', 'y', '1'].includes(confirmation)) {
            const summary = await this.generateSummary();
            this.reset();
            return summary;
        } else if (['no', 'n', '0'].includes(confirmation)) {
            this.reset();
            return 'Alright, let\'s start over.\n\nPlease choose a direction to summarize:\n1. Personal Growth\n2. Future Development\n3. Relationships\n4. Career Development';
        } else {
            return 'Please answer "yes" or "no".';
        }
    }

    async generateSummary() {
        const answers = Array.from(this.userAnswers.entries()).map(([question, answer]) => ({
            question,
            answer
        }));

        const topicNames = {
            personalGrowth: 'Personal Growth',
            future: 'Future Development',
            relationship: 'Relationships',
            career: 'Career Development'
        };

        const topicName = topicNames[this.currentTopic];

        return await this.aiService.generateSummary(answers, topicName);
    }

    reset() {
        console.log('Resetting all states');
        this.currentTopic = null;
        this.context = [];
        this.userAnswers.clear();
        this.isGeneratingSummary = false;
        this.followUpQuestions.clear();
        this.conversationDepth.clear();
        this.questionBank.reset();
        this.completedTopics.clear();
        this.isChoosingNewTopic = false;
    }

    async generateTransition(currentQuestion, nextQuestion, lastAnswer) {
        const prompt = `Based on the user's answer to "${currentQuestion}": "${lastAnswer}",
please generate a natural transition that leads to the next question: "${nextQuestion}".
The transition should:
1. Briefly summarize or acknowledge the user's sharing
2. Explain why you're asking the next question
3. Make the topic transition feel natural`;

        return await this.aiService.getResponse(prompt, this.context);
    }

    async suggestNextTopic() {
        console.log('suggestNextTopic called');
        console.log('Current completed topics:', this.completedTopics);
        
        const allTopics = ['personalGrowth', 'future', 'relationship', 'career'];
        const remainingTopics = allTopics.filter(topic => !this.completedTopics.has(topic));
        
        console.log('Remaining topics:', remainingTopics);

        if (remainingTopics.length === 0) {
            console.log('没有剩余主题，准备生成总结');
            this.isGeneratingSummary = true;
            return await this.generateFinalSummary();
        }

        this.isChoosingNewTopic = true;
        this.currentTopic = null;

        console.log('设置状态:', {
            isChoosingNewTopic: this.isChoosingNewTopic,
            currentTopic: this.currentTopic
        });

        const topicNames = {
            personalGrowth: 'Personal Growth',
            future: 'Future Development',
            relationship: 'Relationships',
            career: 'Career Development'
        };

        const suggestions = remainingTopics
            .map(topic => `${topicNames[topic]}`)
            .join(', ');

        return `It seems we've gained a deep understanding of this direction. Would you like to explore other aspects?\n\nWe can discuss: ${suggestions}\n\n(Type the direction you'd like to discuss, or type "end" to generate a summary report)`;
    }

    async generateFinalSummary() {
        console.log('生成总结报告，当前答案:', this.userAnswers);
        
        const allAnswers = Array.from(this.userAnswers.entries())
            .map(([topic, answers]) => ({
                topic,
                answers: Array.isArray(answers) ? answers : [answers]
            }));
            
        console.log('格式化后的答案:', allAnswers);
        
        return await this.aiService.generateFinalSummary(allAnswers);
    }
} 