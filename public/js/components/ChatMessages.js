class ChatMessages {
    constructor(container) {
        this.container = container;
        this.typingSpeed = 30; // 打字机效果的速度(ms)
        this.setupStyles();
    }

    setupStyles() {
        // 添加必要的样式
        if (!document.getElementById('chat-messages-styles')) {
            const style = document.createElement('style');
            style.id = 'chat-messages-styles';
            style.textContent = `
                .typing-indicator {
                    display: inline-block;
                    padding: 10px 15px;
                    background: #e1e1e1;
                    border-radius: 15px;
                    margin: 10px 0;
                }

                .typing-indicator span {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background: #666;
                    border-radius: 50%;
                    margin: 0 2px;
                    animation: typing-bounce 1.4s infinite ease-in-out;
                }

                .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
                .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

                @keyframes typing-bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }

                .error-message {
                    color: #721c24;
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    padding: 10px 15px;
                    border-radius: 15px;
                    margin: 5px 0;
                }

                .input-suggestion {
                    color: #666;
                    font-size: 0.9em;
                    margin: 5px 0;
                    padding: 5px 10px;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 4px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    async addMessage(text, isAI = false, withTyping = true) {
        if (isAI) {
            // 显示输入中动画
            const typingIndicator = this.showTypingIndicator();
            
            if (withTyping) {
                // 等待一个自然的延迟
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 移除输入中动画
                typingIndicator.remove();
                
                // 创建消息元素
                const message = this.createMessageElement(text, isAI);
                this.container.appendChild(message);
                
                // 应用打字机效果
                await this.typeMessage(message, text);
            } else {
                typingIndicator.remove();
                const message = this.createMessageElement(text, isAI);
                this.container.appendChild(message);
            }
        } else {
            // 用户消息直接显示
            const message = this.createMessageElement(text, isAI);
            this.container.appendChild(message);
        }

        this.scrollToBottom();
    }

    createMessageElement(text, isAI) {
        const message = document.createElement('div');
        message.className = `message ${isAI ? 'ai-message' : 'user-message'}`;
        if (!isAI) {
            message.innerHTML = text;
        }
        return message;
    }

    async typeMessage(element, text) {
        let index = 0;
        element.textContent = '';

        return new Promise(resolve => {
            const type = () => {
                if (index < text.length) {
                    element.textContent += text[index++];
                    setTimeout(type, this.typingSpeed);
                } else {
                    resolve();
                }
            };
            type();
        });
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        this.container.appendChild(indicator);
        this.scrollToBottom();
        return indicator;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.container.appendChild(errorDiv);
        this.scrollToBottom();

        // 3秒后自动移除错误消息
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    showInputSuggestion(text) {
        const suggestion = document.createElement('div');
        suggestion.className = 'input-suggestion';
        suggestion.textContent = text;
        this.container.appendChild(suggestion);
        this.scrollToBottom();
        return suggestion;
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    clear() {
        this.container.innerHTML = '';
    }
} 