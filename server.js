const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API代理路由
app.post('/api/chat', async (req, res) => {
    try {
        console.log('收到API请求:', req.body);

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

        if (!response.ok) {
            throw new Error(`Deepseek API responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API响应:', data);
        res.json(data);

    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({
            error: '处理请求时出现错误',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 