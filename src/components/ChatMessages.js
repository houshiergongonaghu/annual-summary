export class ChatMessages {
    constructor(container) {
        this.container = container;
    }

    addMessage(content, isAI = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isAI ? 'ai-message' : 'user-message'}`;
        messageDiv.innerHTML = content;
        this.container.appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }
} 