class ChatMessages {
    constructor(container) {
        this.container = container;
    }

    addMessage(text, isAI = false) {
        const message = document.createElement('div');
        message.className = `message ${isAI ? 'ai-message' : 'user-message'}`;
        message.innerHTML = text;
        this.container.appendChild(message);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    clear() {
        this.container.innerHTML = '';
    }
} 