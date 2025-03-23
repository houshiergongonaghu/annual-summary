document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM加载完成，开始初始化...');
        if (typeof ChatLogic === 'undefined') {
            console.error('ChatLogic 类未定义');
            return;
        }
        const chatLogic = new ChatLogic();
        console.log('ChatLogic 实例化成功');
        // 确保所有依赖的类都已加载
        if (typeof ChatMessages === 'undefined') {
            console.error('Required classes are not loaded');
            return;
        }

        const chatMessages = new ChatMessages(document.getElementById('chatMessages'));
        const userInput = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');
        
        // 禁用状态管理
        let isProcessing = false;

        // 初始化欢迎消息
        chatMessages.addMessage(`
            你好，我是年度总结分析师胖虎！👋
            <br><br>
            请你从以下方向中选择想要总结的内容：
            <br><br>
            1. 个人成长
            2. 未来发展
            3. 情感生活
            4. 职业发展
        `, true, false);

        // 输入建议
        const suggestions = {
            initial: ['1', '2', '3', '4', 'Personal Growth', 'Future Development', 'Relationships', 'Career Development'],
            confirmation: ['yes', 'no'],
        };

        // 处理用户输入
        const handleSend = async () => {
            const text = userInput.value.trim();
            
            if (isProcessing) {
                chatMessages.showError('Please wait for the previous message to complete...');
                return;
            }

            if (!text) {
                chatMessages.showError('Please enter content');
                return;
            }

            try {
                isProcessing = true;
                updateUIState(true);
                
                chatMessages.addMessage(text, false);
                userInput.value = '';
                
                const response = await chatLogic.handleUserInput(text);
                chatMessages.addMessage(response, true);
                
                updateInputSuggestions();
            } catch (error) {
                console.error('Error sending message:', error);
                chatMessages.showError('Error processing message, please try again');
            } finally {
                isProcessing = false;
                updateUIState(false);
            }
        };

        // 更新UI状态
        const updateUIState = (processing) => {
            userInput.disabled = processing;
            sendButton.disabled = processing;
            sendButton.textContent = processing ? 'Sending...' : 'Send';
            
            if (processing) {
                sendButton.classList.add('processing');
            } else {
                sendButton.classList.remove('processing');
            }
        };

        // 更新输入建议
        const updateInputSuggestions = () => {
            // 清除旧的建议
            const oldSuggestion = document.querySelector('.input-suggestion');
            if (oldSuggestion) {
                oldSuggestion.remove();
            }

            // 根据对话状态显示建议
            let currentSuggestions;
            if (!chatLogic.currentTopic) {
                currentSuggestions = suggestions.initial;
            } else if (chatLogic.isGeneratingSummary) {
                currentSuggestions = suggestions.confirmation;
            }

            if (currentSuggestions) {
                const suggestionText = `Suggested input: ${currentSuggestions.join(' | ')}`;
                chatMessages.showInputSuggestion(suggestionText);
            }
        };

        // 输入框焦点处理
        userInput.addEventListener('focus', () => {
            updateInputSuggestions();
        });

        // 绑定事件
        sendButton.addEventListener('click', handleSend);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        // 初始输入建议
        updateInputSuggestions();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}); 