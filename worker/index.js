export default {
    async fetch(request, env) {
        // 允许跨域配置
        const corsHeaders = {
            'Access-Control-Allow-Origin': 'https://annualsummary.pages.dev',  // 更新为实际的前端域名
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Max-Age': '86400',
        };

        // 获取请求URL
        const url = new URL(request.url);

        // 处理 OPTIONS 预检请求
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders
            });
        }

        // API测试端点
        if (url.pathname === '/api/test') {
            return new Response(
                JSON.stringify({
                    status: 'ok',
                    config: {
                        hasApiKey: !!env.DEEPSEEK_API_KEY,
                        hasBaseUrl: !!env.DEEPSEEK_API_BASE_URL,
                        // 不要返回实际的值，只返回是否存在
                        environment: {
                            DEEPSEEK_API_KEY: !!env.DEEPSEEK_API_KEY,
                            DEEPSEEK_API_BASE_URL: !!env.DEEPSEEK_API_BASE_URL
                        }
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
                // 打印请求信息
                console.log('Received request:', {
                    method: request.method,
                    headers: Object.fromEntries(request.headers.entries()),
                    url: request.url
                });

                // 验证API密钥
                if (!env.DEEPSEEK_API_KEY) {
                    throw new Error('API key not configured');
                }

                // 验证API基础URL
                if (!env.DEEPSEEK_API_BASE_URL.includes('/v1/')) {
                    console.warn('API URL may be missing version number, current URL:', env.DEEPSEEK_API_BASE_URL);
                }

                // 解析请求数据
                const data = await request.json();
                console.log('Request data:', data);
                
                // 验证请求数据
                if (!data.messages || !Array.isArray(data.messages)) {
                    throw new Error('Invalid request format');
                }

                // 调用Deepseek API前的日志
                console.log('Preparing to call Deepseek API:', {
                    url: env.DEEPSEEK_API_BASE_URL,
                    hasApiKey: !!env.DEEPSEEK_API_KEY,
                    requestBody: data
                });

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

                // 打印响应信息
                console.log('Deepseek API response:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries())
                });

                // 检查API响应
                if (!response.ok) {
                    const error = await response.json();
                    console.error('Deepseek API error:', error);
                    throw new Error(`Deepseek API error: ${error.error?.message || 'Unknown error'}`);
                }

                const result = await response.json();

                // 返回处理后的响应
                return new Response(
                    JSON.stringify(result),
                    {
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json'
                        }
                    }
                );

            } catch (error) {
                console.error('Detailed error information:', {
                    errorName: error.name,
                    errorMessage: error.message,
                    errorStack: error.stack
                });
                return new Response(
                    JSON.stringify({ error: error.message }),
                    {
                        status: 500,
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
