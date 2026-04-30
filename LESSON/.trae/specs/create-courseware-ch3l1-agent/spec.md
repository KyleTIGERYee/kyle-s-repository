# 第3章第1课-Agent入门 交互式课件规格

## 变更ID
create-courseware-ch3l1-agent

## Why
需要将"Agent入门"课程讲义转化为交互式网页课件，提供直观的学习体验，帮助学员通过视觉化方式理解AI Agent的核心概念和实操技能。

## What Changes
- 创建交互式网页课件（HTML+TailwindCSS+GSAP）
- 将讲义内容转化为多个幻灯片页面
- 为核心概念添加SVG动画和交互组件
- 实现幻灯片导航系统

## Impact
- Affected specs: N/A（新创建）
- Affected code: 课程讲义/第3章-Agent入门/第1课-Agent入门/presentation/

## ADDED Requirements

### Requirement: 课件页面结构
The system SHALL provide slide-based presentation structure.

#### Scenario: 幻灯片导航
- **WHEN** 用户打开课件或点击导航按钮
- **THEN** 切换到对应幻灯片
- **AND** 支持键盘左右箭头切换

### Requirement: Agent核心概念可视化
The system SHALL visualize Agent's four core capabilities.

#### Scenario: 四大能力展示
- **WHEN** 展示Agent四大核心能力页面
- **THEN** 使用流程图动画展示感知→规划→决策→执行
- **AND** 点击各能力节点显示详情

### Requirement: Agent vs 工作流对比
The system SHALL provide interactive comparison between Agent and Workflow.

#### Scenario: 对比展示
- **WHEN** 展示工作流与Agent对比页面
- **THEN** 使用滑动对比器或卡片对比方式
- **AND** 清晰展示两者差异

### Requirement: 实操步骤展示
The system SHALL demonstrate Dify Agent setup steps.

#### Scenario: 步骤流程
- **WHEN** 展示实操内容
- **THEN** 使用步骤流程组件
- **AND** 每个步骤可交互展开详情

### Requirement: 系统提示词展示
The system SHALL display system prompt structure interactively.

#### Scenario: 提示词结构
- **WHEN** 展示系统提示词配置
- **THEN** 使用高亮扫描或折叠面板
- **AND** 清晰展示各模块结构

## 页面规划

| 页面序号 | 内容 | 组件类型 |
|---------|------|---------|
| 1 | 封面：课程标题 | 标题动画 |
| 2 | 课程概览 | 卡片展示 |
| 3 | 课程导入：从工作流到Agent | 对比卡片 |
| 4 | 什么是AI Agent | 概念图谱/卡片 |
| 5 | Agent核心特征 | 流程动画 |
| 6 | Agent四大核心能力 | 流程图+详情 |
| 7 | 能力一：感知 | 卡片+示例 |
| 8 | 能力二：规划 | 卡片+示例 |
| 9 | 能力三：决策 | 卡片+示例 |
| 10 | 能力四：执行 | 卡片+示例 |
| 11 | Agent技术架构 | SVG架构图 |
| 12 | Agent vs 工作流对比 | 滑动对比器 |
| 13 | 详细对比表 | 表格 |
| 14 | 如何选择 | 决策卡片 |
| 15 | Agent + 工作流融合架构 | 架构图 |
| 16 | Dify Agent功能简介 | 卡片列表 |
| 17 | AI找房Agent架构概览 | SVG架构图 |
| 18-23 | 实操步骤：导入工作流 | 步骤流程 |
| 24-27 | 实操步骤：创建应用和Agent | 步骤流程 |
| 28 | 系统提示词结构解析 | 折叠面板/高亮 |
| 29 | Agent节点配置 | 步骤流程 |
| 30-32 | 工具配置（房源/知识库/管家） | 步骤流程 |
| 33 | 配置策略和测试 | 卡片+示例 |
| 34 | 课程总结 | 核心要点回顾 |
| 35 | 课后作业说明 | 卡片展示 |

## 技术规范

### 文件结构
```
presentation/
├── index.html          # 课件主文件
├── css/
│   └── styles.css      # 自定义样式
└── js/
    └── app.js          # 交互逻辑
```

### 技术栈
- HTML5
- TailwindCSS（通过CDN）
- GSAP动画库（通过CDN）
- 原生JavaScript

### 设计规范
- 统一字号：text-hero(72px), text-title(48px), text-subtitle(32px), text-body(24px), text-label(20px)
- 配色：主色调#d4af37(金)，背景#0f0f10(深色)
- 幻灯片切换：淡入淡出+轻微位移
- 动画时长：0.3-0.5s为主

## 验收标准

1. 课件包含至少35个幻灯片页面
2. 所有核心概念都有对应的可视化组件
3. 支持键盘导航和按钮导航
4. 动画流畅，无明显卡顿
5. 内容严格遵循讲义原文
6. 响应式布局，支持常见屏幕尺寸
