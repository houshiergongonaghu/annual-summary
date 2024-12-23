// 移除import语句，直接使用全局变量
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = new ChatMessages(document.getElementById('chatMessages'));
    const chatLogic = new ChatLogic();

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
    `, true);

    // 处理用户输入
    const handleSend = async () => {
        const input = document.getElementById('userInput');
        const text = input.value.trim();
        
        if (text) {
            chatMessages.addMessage(text, false);
            input.value = '';
            
            try {
                const response = await chatLogic.handleUserInput(text);
                if (response) {
                    chatMessages.addMessage(response, true);
                }
            } catch (error) {
                console.error('Error:', error);
                chatMessages.addMessage('抱歉，处理消息时出现错误。', true);
            }
        }
    };

    // 绑定事件
    document.getElementById('sendButton').addEventListener('click', handleSend);
    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
}); 