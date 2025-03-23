require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files

// 简化的API代理 - 适配任何格式的请求
app.post('/api/chat', async (req, res) => {
    try {
        console.log('Received request:', req.body);
        
        // Prepare data to send to DeepSeek
        let deepseekBody;
        
        // Support two formats: { prompt } or { messages }
        if (req.body.prompt) {
            // If it's a simple prompt request
            deepseekBody = {
                model: 'deepseek-chat',
                messages: [
                    { role: 'user', content: req.body.prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            };
        } else if (req.body.messages) {
            // If it already has formatted messages
            deepseekBody = {
                ...req.body,
                model: req.body.model || 'deepseek-chat',
                temperature: req.body.temperature || 0.7,
                max_tokens: req.body.max_tokens || 2000
            };
        } else {
            return res.status(400).json({ error: 'Invalid request format' });
        }
        
        // Call DeepSeek API
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
            console.error('API error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: 'Failed to call DeepSeek API',
                statusCode: response.status,
                details: errorText
            });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 