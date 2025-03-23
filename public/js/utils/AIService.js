console.log('AIService.js 已加载');

class AIService {
    constructor() {
        // Check if in local development environment
        const isLocalDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        // Choose API URL based on environment
        this.API_URL = isLocalDev 
            ? '/api/chat'  // Local development URL (relative path)
            : 'https://annual-summary-api.daisyquanzhixian.workers.dev/api/chat';
        
        console.log('Using API URL:', this.API_URL);
        this.isLoading = false;
        
        this.systemPrompt = `You are Tiger, an annual summary analyst who is a warm and sincere conversation partner.

Core principles:
1. Genuine empathy: Deeply understand the user's emotions and experiences
2. Personalized responses: Provide unique insights for the user's specific sharing
3. Progressive depth: Naturally deepen topics through follow-up questions
4. Equal dialogue: Communicate as a friend, avoid lecturing

Conversation strategies:
1. When responding to users:
- First express understanding and acknowledgment of their sharing
- Share similar experiences or feelings to build rapport
- Offer deep insights or suggestions
- Use open-ended questions to naturally guide deeper conversation

2. When switching topics:
- Find connections between current and new topics
- Explain why the new topic is relevant
- Transition smoothly to avoid abruptness

3. Follow-up question strategy:
- Focus on key words mentioned by the user
- Guide users to share specific examples
- Explore underlying reasons and feelings
- Help users gain new insights

Always remember: Each response should:
1. Demonstrate sincere understanding
2. Provide personalized insights
3. Naturally guide deeper conversation
4. Maintain conversational coherence`;

        this.dialogueStrategies = {
            personalGrowth: {
                focus: 'Personal growth and self-awareness',
                style: 'Encouraging and inspiring',
                emphasis: ['Skill development', 'Mental maturity', 'Self-awareness']
            },
            future: {
                focus: 'Future planning and possibilities',
                style: 'Forward-looking and constructive',
                emphasis: ['Goal setting', 'Action plans', 'Resource integration']
            },
            relationship: {
                focus: 'Emotional connections and interpersonal interactions',
                style: 'Warm and understanding',
                emphasis: ['Emotional experiences', 'Relationship patterns', 'Communication methods']
            },
            career: {
                focus: 'Career development and professional growth',
                style: 'Professional and practical',
                emphasis: ['Career planning', 'Skill building', 'Value realization']
            }
        };

        // Add request timeout setting
        this.timeout = 30000; // 30 seconds
    }

    async getResponse(text, context = [], isFollowUp = false, isSummary = false) {
        try {
            this.isLoading = true;
            
            // Build messages array
            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                }
            ];

            // Add context messages
            if (Array.isArray(context) && context.length > 0) {
                messages.push(...context);
            }

            // Add current question
            messages.push({
                role: 'user',
                content: text
            });

            // Log request information
            console.log('Sending request:', {
                url: this.API_URL,
                messages: messages
            });

            // Send request
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages,
                    model: 'deepseek-chat',
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            // Check response
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Request failed');
            }

            const data = await response.json();
            this.isLoading = false;

            return data.choices[0].message.content;
        } catch (error) {
            this.isLoading = false;
            console.error('API request error:', error);
            throw error;
        }
    }

    // Generate prompt for normal conversation
    generateNormalPrompt(text, context) {
        const currentTopic = this._getCurrentTopic(context);
        // Add default strategy to prevent strategy from being undefined
        const strategy = this.dialogueStrategies[currentTopic] || {
            style: 'warm and sincere',
            focus: 'overall performance',
            emphasis: ['growth', 'achievements', 'outlook']
        };
        
        return `As a ${strategy.style} conversation partner, please generate a response to the user's sharing: "${text}".

Response requirements:
1. Express genuine understanding and acknowledgment
2. Provide personalized insights
3. Share related experiences or feelings
4. Naturally guide continued conversation

Focus on: ${strategy.focus}
Keywords: ${strategy.emphasis.join(', ')}`;
    }

    // Generate follow-up prompt
    generateFollowUpPrompt(text, context) {
        const recentContext = context.slice(-3); // Get recent conversation context
        
        return `Based on the following conversation context:
${recentContext.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User's recent answer was: "${text}"

Please generate a natural response as a friend, including:
1. Understanding and acknowledgment of the user's sharing
2. Sharing related experiences or feelings (optional)
3. A question that can naturally guide the user to think and share more

Note:
- The response should show that you truly understand and care about the user
- The question should be natural, like a conversation between friends
- Avoid hard-to-understand teaching or polite words
- The question should be specific, not too broad`;
    }

    // Generate follow-up question
    async generateFollowUpQuestion(prompt) {
        try {
            const response = await this.getResponse(prompt, [], true);
            // Ensure the response is a question
            if (!response.endsWith('?') && !response.endsWith('?')) {
                return response + '?';
            }
            return response;
        } catch (error) {
            console.error('Error generating follow-up question:', error);
            throw error;
        }
    }

    _getCurrentTopic(context) {
        const topicKeywords = {
            personalGrowth: ['Personal growth', 'Self-improvement', 'Skill development'],
            future: ['Future development', 'Planning', 'Goal'],
            relationship: ['Emotional life', 'Relationship', 'Communication'],
            career: ['Career development', 'Work', 'Career']
        };

        for (const msg of context.slice().reverse()) {
            for (const [topic, keywords] of Object.entries(topicKeywords)) {
                if (keywords.some(keyword => msg.content.includes(keyword))) {
                    return topic;
                }
            }
        }
        return null;
    }

    async generateSummary(answers, topic) {
        const summaryPrompt = `Please generate a detailed annual summary report based on the following question and answer content.
Theme: ${topic}

Question and answer content:
${answers.map(qa => `Question: ${qa.question}\nAnswer: ${qa.answer}`).join('\n\n')}

Requirements:
1. The report should analyze the user's specific situation
2. Provide deep insights
3. Offer practical suggestions
4. Use warm and encouraging tone
5. Use emojis to increase readability
6. The report should be at least 500 characters long
7. List main findings and suggestions in points

Format reference:
📝 ${topic} Annual Summary Report

🌟 Annual Highlights
[Analyze the user's main achievements and progress]

💡 Key Findings
[Analyze the user's specific situation]

📈 Growth Analysis
[Deeply analyze the user's growth trajectory]

🎯 Suggestions for Outlook
[Provide specific and feasible suggestions]

💪 Encouragement
[Give warm and encouraging encouragement]`;

        return await this.getResponse(summaryPrompt, []);
    }

    async generateFinalSummary(allAnswers) {
        try {
            console.log('Starting to generate final summary');
            this.isLoading = true;

            const summaryPrompt = `As a professional annual summary analyst, please generate a deep insight annual summary report based on the user's sharing in different directions.

User's sharing content: ${JSON.stringify(allAnswers, null, 2)}

Analysis requirements:
1. Multi-dimensional analysis
   - Analyze the user's performance characteristics in various directions
   - Discover the internal connections between different directions
   - Identify the user's core values and behavioral patterns
   
2. Deep insight
   - Interpret personality characteristics from the user's expression style
   - Discover personal characteristics that the user may not be aware of
   - Reveal potential psychological needs and motivations
   - Analyze the user's decision-making tendencies and thinking style
   
3. Personalized insights
   - Identify the unique advantage combination of the user
   - Discover the unique growth opportunities of the user
   - Provide targeted development suggestions
   
4. Cross-field association
   - Analyze how the experiences in different fields affect each other
   - Discover potential patterns in the user's life
   - Reveal the inherent logic of personal development

5. Forward-looking suggestions
   - Provide constructive suggestions based on deep analysis
   - Identify potential development opportunities
   - Suggest specific feasible action plans

Format requirements:
📊 Multi-dimensional analysis report

🔍 Deep insight
- Core characteristic interpretation
- Potential pattern analysis
- Unique advantage discovery
- Thinking style analysis

💫 Personal characteristic panoramic view
- Personality characteristics
- Value orientation
- Decision style
- Growth tendency

🌟 Potential exploration
- Unutilized advantages
- Potential development opportunities
- Possible breakthrough directions

🎯 Precise suggestions
- Targeted improvement direction
- Specific action suggestions
- Possible development path

💡 Unique discovery
[Share some unique insights that the user may not have been aware of, but discovered from overall analysis]

🎁 Encouragement
[Give warm and encouraging encouragement, highlighting the unique value of the user]

Notes:
1. Analysis should be deep, not surface-level summary
2. Insights should be unique, providing user-unexpected insights
3. Suggestions should be specific, easy for users to take action
4. Tone should be warm, full of empathy
5. Highlight the user's uniqueness, not general discussion
6. Multi-angle cross-analysis, discover deep connections`;

            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                },
                {
                    role: 'user',
                    content: summaryPrompt
                }
            ];

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.isLoading = false;

            if (data.error) {
                throw new Error(data.error);
            }

            return data.choices[0].message.content;

        } catch (error) {
            this.isLoading = false;
            console.error('Error generating summary report:', error);
            return 'Sorry, an error occurred while generating the summary report. Please try again later.';
        }
    }

    getTopicName(topic) {
        const names = {
            personalGrowth: 'Personal growth',
            future: 'Future development',
            relationship: 'Emotional life',
            career: 'Career development'
        };
        return names[topic] || topic;
    }

    async generateResponse(question, answer, context, isLastQuestion = false) {
        try {
            // Ensure context is an array
            const currentContext = Array.isArray(context) ? context : [];
            
            // Build new message
            const newMessage = {
                role: 'user',
                content: `Question: ${question}\nUser's answer: ${answer}`
            };
            
            // Build complete context
            const fullContext = [...currentContext, newMessage];
            
            // Build prompt
            const prompt = isLastQuestion ? 
                'This is the last question for the current direction. Please generate a warm summary response that affirms the user\'s sharing and provides some suggestions or inspiration.' :
                'Please generate a warm response based on the user\'s answer, and naturally lead to the next question.';

            // Call API
            return await this.getResponse(prompt, fullContext, true, isLastQuestion);
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }
}

if (typeof window !== 'undefined') {
    window.aiService = new AIService();
    console.log('AIService initialized:', window.aiService);
} 
