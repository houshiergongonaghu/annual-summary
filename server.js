const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 添加请求计数器
let requestCounter = 0;

// API代理路由
app.post('/api/chat', async (req, res) => {
    requestCounter++;
    const requestId = `req_${Date.now()}_${requestCounter}`;
    
    try {
        console.log(`[${requestId}] 收到API请求:`, {
            消息数量: req.body.messages?.length,
            消息内容: req.body.messages,
            请求头: req.headers
        });

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: req.body.messages,
                temperature: 0.9,
                max_tokens: 2000,
                top_p: 0.95,
                presence_penalty: 0.7,
                frequency_penalty: 0.5
            })
        });

        console.log(`[${requestId}] Deepseek响应状态:`, {
            状态码: response.status,
            状态文本: response.statusText
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[${requestId}] Deepseek错误响应:`, {
                状态码: response.status,
                错误内容: errorText
            });
            throw new Error(`Deepseek API responded with status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`[${requestId}] API响应成功:`, data);
        res.json(data);

    } catch (error) {
        console.error(`[${requestId}] API错误:`, {
            错误信息: error.message,
            错误栈: error.stack,
            请求体: req.body
        });
        res.status(500).json({
            error: '处理请求时出现错误',
            details: error.message,
            requestId
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 