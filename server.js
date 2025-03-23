require('dotenv').config(); // 加载.env文件中的环境变量
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS和JSON解析
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // 提供静态文件服务

// 简化的API代理 - 适配任何格式的请求
app.post('/api/chat', async (req, res) => {
    try {
        console.log('收到请求:', req.body);
        
        // 准备发送到DeepSeek的数据
        let deepseekBody;
        
        // 支持两种格式：{ prompt } 或 { messages }
        if (req.body.prompt) {
            // 如果是简单的 prompt 请求
            deepseekBody = {
                model: 'deepseek-chat',
                messages: [
                    { role: 'user', content: req.body.prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            };
        } else if (req.body.messages) {
            // 如果已经有格式化的 messages
            deepseekBody = {
                ...req.body,
                model: req.body.model || 'deepseek-chat',
                temperature: req.body.temperature || 0.7,
                max_tokens: req.body.max_tokens || 2000
            };
        } else {
            return res.status(400).json({ error: '无效的请求格式' });
        }
        
        // 调用 DeepSeek API
        const response = await fetch(process.env.DEEPSEEK_API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify(deepseekBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误:', response.status, errorText);
            return res.status(response.status).json({ 
                error: '调用DeepSeek API失败',
                statusCode: response.status,
                details: errorText
            });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('服务器错误:', error);
        res.status(500).json({ error: error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}); 