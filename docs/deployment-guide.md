# 项目部署指南

## 一、准备工作

### 1. 注册账号
1. 注册 Cloudflare 账号: https://dash.cloudflare.com/sign-up
2. 登录到 Cloudflare 控制台

### 2. 安装工具
1. 安装 Node.js (如果没有): https://nodejs.org/
2. 安装 Wrangler CLI: 

bash
npm install -g wrangler


### 3. 登录 Wrangler
bash
wrangler login


## 二、项目配置

### 1. 创建 wrangler.toml
在项目根目录创建 `wrangler.toml` 文件:

toml:wrangler.toml
name = "annual-summary-api"
main = "worker/index.js"
compatibility_date = "2024-01-01"
[vars]

DEEPSEEK_API_KEY = "" # 不要在这里填写实际的 API KEY
[rate_limits]
requests_per_minute = 50
[env.production]
routes = [
{ pattern = "api.yourdomain.com", custom_domain = true }
]
[env.development]
name = "annual-summary-api-dev"

### 2. 创建 Worker 文件
创建 `worker/index.js`:

javascript:worker/index.js
export default {
async fetch(request, env) {
// 允许跨域
const corsHeaders = {
'Access-Control-Allow-Origin': '',
'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type',
};
// 处理 OPTIONS 请求
if (request.method === 'OPTIONS') {
return new Response(null, { headers: corsHeaders });
}
// 只处理 POST 请求
if (request.method !== 'POST') {
return new Response('Method not allowed', { status: 405 });
}
try {
const data = await request.json();
// 转发到 Deepseek API
const response = await fetch('https://api.deepseek.com/chat/completions', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': Bearer ${env.DEEPSEEK_API_KEY}
},
body: JSON.stringify(data)
});
const result = await response.json();
return new Response(JSON.stringify(result), {
headers: {
...corsHeaders,
'Content-Type': 'application/json'
}
});
} catch (error) {
return new Response(JSON.stringify({ error: error.message }), {
status: 500,
headers: {
...corsHeaders,
'Content-Type': 'application/json'
}
});
}
}
};


### 3. 修改前端代码
修改 API 请求地址为你的 Worker 地址:

javascript:public/js/utils/AIService.js
constructor() {
// 修改为你的 Worker 地址
this.API_URL = 'https://annual-summary-api.你的域名.workers.dev/api/chat';
// ...其他代码保持不变
}

# 三、部署步骤

### 1. 部署 Worker
bash

发布 Worker
wrangler deploy


### 2. 配置环境变量
在 Cloudflare 控制台:
1. 进入 Workers & Pages
2. 选择你的 Worker
3. 点击 Settings > Variables
4. 添加环境变量 `DEEPSEEK_API_KEY`

### 3. 部署前端
1. 在 Cloudflare 控制台创建新的 Pages 项目
2. 连接你的 GitHub 仓库
3. 设置构建配置:
   - 构建命令: `npm run build`（如果有）
   - 输出目录: `public`

## 四、验证部署

1. 访问你的 Pages URL 测试前端
2. 使用 `diagnose.html` 测试 API 连接
3. 检查 Worker 的请求日志

## 五、常见问题

### 1. Worker 报错
- 检查环境变量是否正确设置
- 查看 Worker 的错误日志
- 确认 API Key 是否有效

### 2. 跨域问题
- 检查 corsHeaders 配置
- 确认请求方法是否正确
- 查看浏览器控制台错误信息

### 3. 部署失败
- 确认 wrangler.toml 配置正确
- 检查文件路径是否正确
- 查看部署日志

## 六、注意事项

1. **安全性**
   - 不要在代码中硬编码 API Key
   - 定期更换 API Key
   - 设置合理的请求限制

2. **成本控制**
   - 监控 Worker 使用量
   - 设置请求限制
   - 关注账单情况

3. **性能优化**
   - 启用缓存
   - 压缩响应
   - 控制请求大小

## 七、有用的命令
bash
本地开发
wrangler dev
查看日志
wrangler tail
查看环境变量
wrangler secret list
添加环境变量
wrangler secret put DEEPSEEK_API_KEY

# 前端部署指南

## 一、准备工作

### 1. 更新代码
1. 提交本地更改:

