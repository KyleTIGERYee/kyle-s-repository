## 计划概述
使用 Slidev 的 apple-basic 主题，将第一章第一课"大模型+提示词基础"的完整讲义（7个章节）转换为演示幻灯片。

## 讲义内容结构（共7个章节）

### 1. 课程目标
- 4个学习目标

### 2. 1.1 AI基础概念
- 1.1.1 什么是大语言模型（LLM）
- 1.1.2 概率与非确定性
- 1.1.3 预测下一个词（Next Token Prediction）

### 3. 1.2 Transformer架构通识
- 1.2.1 什么是Transformer
- 1.2.2 注意力机制
- 1.2.3 不涉及复杂数学的理解方式

### 4. 1.3 大模型参数详解
- 1.3.1 Token与计费
- 1.3.2 上下文窗口（Context Window）
- 1.3.3 温度（Temperature）
- 1.3.4 其他重要参数（Top-p、Max Tokens）

### 5. 1.4 不确定性思维
- 1.4.1 接受AI的不确定性
- 1.4.2 提示词输入的重要性

### 6. 1.5 结构化提示词及框架
- 1.5.1 为什么需要结构化提示词
- 1.5.2 基础结构化框架
- 1.5.3 提示词工程六大策略（OpenAI官方）

### 7. 1.6 实战练习 + 1.7 本课小结
- 实战1：调节Temperature参数
- 实战2：编写结构化提示词
- 核心概念回顾
- 关键技能总结

## 幻灯片规划（约25-30页）

### 第1部分：开场（2页）
1. **封面页** (layout: cover)
   - 标题：大模型+提示词基础
   - 副标题：第1章 人工智能入门
   
2. **课程目标** (layout: default)
   - 4个学习目标列表

### 第2部分：AI基础概念（6页）
3. **什么是大语言模型** (layout: two-cols)
   - 定义 + 通俗理解（超级读者比喻）
   - 右侧：3个关键特征

4. **常见大语言模型** (layout: default)
   - 6个主流模型展示

5. **概率与非确定性** (layout: default)
   - 核心观点强调
   - 概率性解释

6. **概率示例** (layout: default)
   - "今天天气很"示例可视化

7. **非确定性的影响** (layout: default)
   - 3个影响点
   - 与AI协作的本质

8. **Next Token Prediction** (layout: two-cols)
   - Token定义
   - 工作原理流程图

### 第3部分：Transformer架构（4页）
9. **什么是Transformer** (layout: default)
   - 2017年Google提出
   - 3个创新点

10. **注意力机制** (layout: default)
    - 通俗理解
    - 自注意力示例

11. **注意力机制可视化** (layout: default)
    - "猫坐在垫子上"示例
    - 关联度展示

12. **简化理解** (layout: default)
    - 会议室比喻
    - 输入-处理-输出

### 第4部分：大模型参数（6页）
13. **Token与计费** (layout: two-cols)
    - Token定义
    - 中英文换算
    - 3个重要性

14. **上下文窗口** (layout: default)
    - 定义和组成
    - 2026年最新数据表格

15. **上下文窗口的意义** (layout: default)
    - 3个意义点

16. **Temperature参数** (layout: default)
    - 什么是Temperature
    - 工作原理（0、1、>1）

17. **Temperature对比示例** (layout: default)
    - 能量饮料广告语3个对比

18. **Temperature选择指南** (layout: default)
    - 场景推荐表格
    - 其他参数（Top-p、Max Tokens）

### 第5部分：不确定性思维（2页）
19. **接受AI的不确定性** (layout: default)
    - 3个正确心态

20. **提示词输入的重要性** (layout: default)
    - 输入决定输出

### 第6部分：结构化提示词（5页）
21. **为什么需要结构化提示词** (layout: two-cols)
    - 不好的示例 vs 好的示例

22. **基础结构化框架** (layout: default)
    - 角色-任务-要求-输出格式

23. **结构化提示词示例** (layout: default)
    - 完整示例展示

24. **提示词工程六大策略** (layout: default)
    - OpenAI官方6大策略

25. **六大策略详解** (layout: default)
    - 每个策略一句话说明

### 第7部分：实战与总结（4页）
26. **实战练习** (layout: default)
    - 实战1：调节Temperature
    - 实战2：编写结构化提示词

27. **核心概念回顾** (layout: default)
    - 7个核心概念列表

28. **关键技能** (layout: default)
    - 3个关键技能

29. **下节预告** (layout: default)
    - 下一课内容预告

30. **结束页** (layout: end)
    - 感谢页
    - 课后作业提示

## 主题配置
```yaml
---
theme: apple-basic
title: 第1课：大模型+提示词基础
info: |
  ## 第1章 人工智能入门
  
  VIBECODING AI课程
highlighter: shiki
lineNumbers: true
colorSchema: light
aspectRatio: 16/9
canvasWidth: 980
fonts:
  sans: system-ui
  mono: Fira Code
drawings:
  enabled: true
  persist: false
---
```

## 执行步骤
1. 安装 apple-basic 主题
2. 创建 slides.md 文件（包含全部30页内容）
3. 启动开发服务器预览
4. 导出 PDF

请确认这个完整计划后，我将开始执行。