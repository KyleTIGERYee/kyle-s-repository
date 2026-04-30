## 项目概述
基于讲义内容《第1课：大模型+提示词基础》，使用 Slidev 制作高端品牌风格的教学演示文稿，输出为静态网页。

## 目标受众
新手学生，需要直观、易懂的可视化内容

## 执行计划

### 阶段1：设计系统生成（使用 ui-ux-pro-max）
1. 运行设计系统搜索命令，获取高端品牌教育风格：
   ```bash
   python3 .trae/skills/ui-ux-pro-max/scripts/search.py "education technology AI course premium luxury" --design-system -p "AI基础课程" -f markdown
   ```
2. 获取配色方案、字体搭配、视觉效果建议
3. 搜索图表相关建议：
   ```bash
   python3 .trae/skills/ui-ux-pro-max/scripts/search.py "comparison diagram flowchart" --domain chart
   ```

### 阶段2：Slidev 项目初始化
1. 检查 slidev 目录是否已有项目结构
2. 如需要，初始化 Slidev 项目
3. 配置主题和样式

### 阶段3：演示文稿内容制作
根据讲义内容，制作以下幻灯片：

**封面**
- 课程标题：大模型+提示词基础
- 副标题：人工智能入门第一课

**第一部分：AI基础概念**
1. 什么是大语言模型（LLM）- 使用图标+文字说明
2. 概率与非确定性 - 使用流程图/对比图
3. Next Token Prediction - 使用动画演示生成过程

**第二部分：Transformer架构**
1. 什么是Transformer - 架构图
2. 注意力机制 - 可视化示意图
3. 简化理解方式 - 类比图示

**第三部分：大模型参数详解**
1. Token与计费 - 使用表格+示例
2. 上下文窗口 - 使用对比图表（各厂商对比）
3. Temperature参数 - 使用滑动条可视化+对比示例
4. 其他参数 - 简洁列表

**第四部分：提示词工程**
1. 不确定性思维 - 概念图
2. 结构化提示词框架 - 代码块对比
3. 六大策略 - 列表+图标

**第五部分：实战练习**
1. Temperature调节练习
2. 结构化提示词编写

**结尾页**
- 课程小结
- 课后作业
- 参考资料

### 阶段4：视觉增强
1. 添加 Mermaid 图表：
   - Token生成流程图
   - Transformer架构图
   - 注意力机制示意图
   - 温度参数对比流程

2. 添加对比表格：
   - 各厂商模型上下文窗口对比
   - 不同Temperature输出对比
   - 结构化vs非结构化提示词对比

3. 使用网络图片：
   - AI/LLM概念相关图片
   - 科技感背景图

### 阶段5：构建与输出
1. 配置导出为静态网页
2. 运行构建命令
3. 输出到 dist 目录

## 技术栈
- Slidev（基于 Vite + Vue + Markdown）
- Mermaid 图表
- Tailwind CSS 样式
- 设计系统来自 ui-ux-pro-max

## 预期输出
- 完整的 Slidev 演示文稿（slides.md）
- 构建后的静态网页（dist/ 目录）
- 高端品牌风格：深色主题、科技感、专业配色

请确认此计划后，我将开始执行。