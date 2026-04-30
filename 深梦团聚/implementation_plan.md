# 深梦团聚 - 接入 Dify AI 审核实施方案

## 1. 目标描述与背景
本项目原本计划直接由前端调用 Dify AI 的接口以提交并分析申请表单，但由于直接暴露 `app-ZeCz95BFfWJWWBS0ukTzWFW0` API Key 存在严重的安全隐患，并且前端直接跨域请求经常受到浏览器同源策略及 HTTPS 限制，因此本方案决定**引入一个轻量级的 Python 后端**作为请求中转代理服务。

前端（Vue2）负责收集用户填写的《深梦团聚》申请表单内容，并在用户提交时展示 [AuditingStatus.vue](file:///Users/kyle/Desktop/VIBECODING/%E6%B7%B1%E6%A2%A6%E5%9B%A2%E8%81%9A/Deep%20Dream%20Reunion/src/components/AuditingStatus.vue)（审核中动效）页面；同时在后台将表单数据发送至 Python 后端。Python 后端通过 HTTPS 安全调用 `ajly-dify.szajly.com/v1` 大模型接口进行决策，并将“**通过（PASSED）**”或“**驳回（FAILED）**”的最终结果及其具体原因返回前端。前端收到答复后再切换到 [ResultPassed.vue](file:///Users/kyle/Desktop/VIBECODING/%E6%B7%B1%E6%A2%A6%E5%9B%A2%E8%81%9A/Deep%20Dream%20Reunion/src/components/ResultPassed.vue) 或 [ResultFailed.vue](file:///Users/kyle/Desktop/VIBECODING/%E6%B7%B1%E6%A2%A6%E5%9B%A2%E8%81%9A/Deep%20Dream%20Reunion/src/components/ResultFailed.vue) 页面，展示基于大模型返回内容的审核说明。

## 2. Dify 工作流（Workflow）设计要求

为了让前端能够**百分百准确**地识别并拆分出“最终结果（通过/驳回）”和“具体原因”，你的 Dify 工作流节点设计必须遵循结构化输出的规则。

### 2.1 设定 Dify 表单输入变量 (Start 节点)
在 Dify 工作流的最开始（Start 节点），你需要定义好前端会传过来的字段作为输入变量（类型选 String/Number），例如：
*   `name` (申请人姓名)
*   `idCard` (身份证号)
*   `jobType` (职业)
*   `familySize` (家庭人数)
*   ...（与 Vue 表单字段一一对应）

### 2.2 设计判定节点 (LLM 或 If/Else 节点)
让大模型依据这些输入变量进行思考并做出判断。

### 2.3 核心：设计输出节点 (End 节点)
这是最关键的一步。在 Dify 工作流的**结束节点（End 节点）**，你必须明确配置输出的参数结构，最好是强制让它输出**标准的 JSON 格式**文本，或者定义**两个明确的输出变量**。

**推荐做法：配置两个输出变量 (Output Variables)**
并在大语言模型产生结论后，将对应的值赋给这两个变量：
1.  **`audit_result`** (String 类型): 它的值只能是 `"PASSED"` 或者 `"FAILED"`。
2.  **`audit_reason`** (String 类型): 它的值是一段具体的文本，例如 `"您的工作属于公共服务领域，符合入住要求。"`

### 2.4 数据扭转逻辑说明
1.  **前端** 发送包含 `name, jobType...` 等字段的 JSON 报文给 Python 后端。
2.  **Python 后端** 将报文包装为 Dify 要求的 `inputs` 字典，调用 `POST /v1/workflows/run`。
3.  **Dify 平台** 运行工作流，结束时通过 End 节点返回预设好的变量。
4.  **Python 后端** 收到 Dify 返回的 JSON 后，提取其中的 `data.outputs.audit_result` 和 `data.outputs.audit_reason`，并直接转发回前端。
5.  **前端 App.vue** 接收到后，直接写判定代码：
    ```javascript
    if (res.audit_result === 'PASSED') {
       this.resultMessage = res.audit_reason; 
       this.currentPage = 'PASSED';
    } else {
       this.resultMessage = res.audit_reason;
       this.currentPage = 'FAILED';
    }
    ```
通过这种**结构化的输出设定**，前端就不需要去盲猜或用正则解析一段长文本了，不会出任何错。

## 3. 拟议变更方案

### 3.1 [新增功能模块] Python 后端服务 (FastAPI)
我们将在项目根目录 `/Users/kyle/Desktop/VIBECODING/深梦团聚/backend` 新建一个基于 Python 和 FastAPI 的服务，因为它性能好且原生支持异步 HTTPS 请求，非常适合作为 AI 流式缓冲或长轮询的中间件。

#### [NEW] `backend/requirements.txt`
*   包含依赖：`fastapi`, `uvicorn` (ASGI服务器), `httpx` (用于安全请求 Dify), `pydantic` (用于校验前端传递的数据), `cors`。

#### [NEW] `backend/main.py`
*   **路由 `/api/submit-application` (POST)：** 
    *   接收由 Vue 传来的完整 JSON 表单数据。
    *   拼装 Dify 要求的特定格式（带上隐藏的 `Bearer app-ZeCz95...` 头信息和 `https://ajly-dify.szajly.com/v1`）。
    *   调用 Dify，等待 AI 思考（假设 2~8秒），并抓取结果。
    *   解析 Dify 的 JSON 回复，向 Vue 返回标准化结构：`{ "status": "PASSED" | "FAILED", "reason": "AI 分析的详细文案..." }`。
*   **CORS 配置**：配置中间件允许本地（例如前端 `localhost:3000` 或 `5173` 等）跨域访问此后端 API。

___

### 3.2 [模块化修改] Vue2 前端收集与通信对接

#### [MODIFY] [Deep Dream Reunion/src/components/ApplicationForm.vue](file:///Users/kyle/Desktop/VIBECODING/%E6%B7%B1%E6%A2%A6%E5%9B%A2%E8%81%9A/Deep%20Dream%20Reunion/src/components/ApplicationForm.vue)
*   目前表单（姓名、身份证、职业等）仅画了 UI 壳子，没有通过 `v-model` 进行数据双向绑定。
*   **变更点：**
    *   在 [data()](file:///Users/kyle/Desktop/VIBECODING/%E6%B7%B1%E6%A2%A6%E5%9B%A2%E8%81%9A/Deep%20Dream%20Reunion/src/App.vue#36-42) 中补充 `formData: { name: '', idCard: '', phone: '', ... }`。
    *   为每一个 HTML `<input>` 和 `<select>` 添加 `v-model="formData.fieldname"`。
    *   在提交按钮点击时，触发 `$emit('submit', this.formData)` 将整个数据对象传递给父组件。

#### [MODIFY] [Deep Dream Reunion/src/App.vue](file:///Users/kyle/Desktop/VIBECODING/%E6%B7%B1%E6%A2%A6%E5%9B%A2%E8%81%9A/Deep%20Dream%20Reunion/src/App.vue)
*   接收子组件发出的 `formData` 事件结构。
*   将当前的本地 `setTimeout` 假延迟替换为真正的网络请求：
    *   先 `this.currentPage = 'AUDITING'` 展现动画。
    *   通过原生 `fetch()` 往 Python 本地服务 `http://127.0.0.1:8000/api/submit-application` POST 提交数据。
    *   利用 Promise 或 async/await 接收后端接口打回的数据：如果是 `PASSED`，即切换到通过页；如果是 `FAILED` 则切换到失败页。
*   在 [data()](file:///Users/kyle/Desktop/VIBECODING/%E6%B7%B1%E6%A2%A6%E5%9B%A2%E8%81%9A/Deep%20Dream%20Reunion/src/App.vue#36-42) 中增加 `resultMessage: ''`，用来向结果子组件传递来自 AI 的文本。

#### [MODIFY] [Deep Dream Reunion/src/components/ResultPassed.vue](file:///Users/kyle/Desktop/VIBECODING/%E6%B7%B1%E6%A2%A6%E5%9B%A2%E8%81%9A/Deep%20Dream%20Reunion/src/components/ResultPassed.vue) & [ResultFailed.vue](file:///Users/kyle/Desktop/VIBECODING/%E6%B7%B1%E6%A2%A6%E5%9B%A2%E8%81%9A/Deep%20Dream%20Reunion/src/components/ResultFailed.vue)
*   在 `props` 接收 `resultMessage`。
*   将两个结果页面中“恭喜您已通过资格审核”或者“不符合条件”等固定僵化的静态短句，修改为**由 AI 生成的个性化回复**，例如“张文宏医生，感谢您的贡献，您的深梦旗舰店入住申请已通过！”

## 4. 验证与联调计划

### 后端 API 测试
1. 使用终端 `cd backend`，并按照 `pip install -r requirements.txt` 安装依赖。
2. 运行起服务 `uvicorn main:app --reload --port 8000`。
3. 检查控制台无报错。

### 前端功能跑通
1. 回到 `Deep Dream Reunion` 目录并运行 `npm run dev` （目前已经有两个终端在跑，选用一个查看）。
2. 在浏览器界面随意填写一组数据，如“深圳教师”，点【提交】。看到动效页面跳出代表数据已经触发传递。

### 端到端联调测试（基于真实 Dify 反馈）
1. 观察后端控制台，确认接收到明文请求。
2. 观察后端发出长连接到 Dify。
3. 等待约 3~5 秒后，前端原本处于等待动效的页面自动拉起最终结果；并且页面的反馈语句**确实包含了 Dify 根据我们填写的表单大模型实时分析的内容**（非假数据假动效）。
4. 故意修改 Python 代码为错误的域名或主动断网，测试前端的错误兜底弹窗机制是否正确被执行。
