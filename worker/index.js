export default {
    async fetch(request, env) {
        // 允许跨域配置
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',  // 生产环境建议设置具体域名
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Max-Age': '86400',  // 缓存预检请求结果24小时
        };

        // 处理预检请求
        if (request.method === 'OPTIONS') {
            return new Response(null, { 
                headers: corsHeaders,
                status: 204
            });
        }

        // 路由处理
        const url = new URL(request.url);
        
        // API测试端点
        if (url.pathname === '/api/test') {
            return new Response(
                JSON.stringify({
                    status: 'ok',
                    config: {
                        hasApiKey: !!env.DEEPSEEK_API_KEY
                    }
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // 主聊天端点
        if (url.pathname === '/api/chat') {
            console.log('=========/api/chat:');
            // 只允许POST方法
            if (request.method !== 'POST') {
                return new Response(
                    JSON.stringify({ error: 'Method not allowed' }), 
                    { 
                        status: 405,
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            try {
                // 验证API密钥
                if (!env.DEEPSEEK_API_KEY) {
                    throw new Error('API key not configured');
                }

                // 解析请求数据
                const data = await request.json();
                
                // 验证请求数据
                if (!data.messages || !Array.isArray(data.messages)) {
                    throw new Error('Invalid request format');
                }

                // 调用Deepseek API
                const response = await fetch(env.DEEPSEEK_API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
                    },
                    body: JSON.stringify({
                        ...data,
                        model: 'deepseek-chat',  // 指定模型
                        max_tokens: 2000,        // 限制响应长度
                        temperature: 0.7         // 控制创造性
                    })
                });

                // 检查API响应
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error?.message || 'API request failed');
                }

                const result = await response.json();

                // 返回处理后的响应
                return new Response(
                    JSON.stringify(result),
                    {
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache'  // 禁用缓存
                        }
                    }
                );

            } catch (error) {
                // 错误处理
                console.error('Error in chat endpoint:', error);
                
                return new Response(
                    JSON.stringify({
                        error: error.message || 'Internal server error',
                        timestamp: new Date().toISOString()
                    }),
                    {
                        status: error.status || 500,
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
        }

        // 404处理
        return new Response(
            JSON.stringify({ error: 'Not found' }),
            {
                status: 404,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}; 
