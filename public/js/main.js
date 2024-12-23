import { ChatMessages } from './components/ChatMessages.js';
import { ChatLogic } from './scripts/chat-logic.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    
    // 创建聊天界面
    app.innerHTML = `
        <div class="chat-container">
            <div class="chat-header">
                <h2>年度总结助手 - 胖虎</h2>
            </div>
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input">
                <input type="text" id="userInput" placeholder="输入你的选择或回答...">
                <button id="sendButton">发送</button>
            </div>
        </div>
    `;

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
        <br><br>
        请输入你想要探讨的方向...
    `, true);

    // 处理用户输入
    const handleSend = async () => {
        const input = document.getElementById('userInput');
        const text = input.value.trim();
        
        if (text) {
            chatMessages.addMessage(text, false);
            input.value = '';
            
            const response = await chatLogic.handleUserInput(text);
            if (response) {
                chatMessages.addMessage(response, true);
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