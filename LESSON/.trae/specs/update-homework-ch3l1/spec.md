# 第3章第1课-Agent入门 课后作业更新规格

## 变更ID
update-homework-ch3l1

## 背景与目标

### 问题
当前第3章第1课讲义中的课后作业部分不符合 `HOMEWORK_STANDARDS.md` 规范要求：
1. 作业没有按照「基础作业（必做）/进阶作业（选做）/挑战作业（加分）」三层结构划分
2. 缺少明确的提交内容结构要求
3. 缺少Dify项目信息要求
4. 缺少测试用例表格格式
5. 缺少学习建议和常见问题部分

### 目标
按照 `HOMEWORK_STANDARDS.md` 规范，重新设计课后作业部分，确保：
1. 三层次作业结构清晰
2. 每层次作业包含任务描述、具体要求、测试用例、提交内容
3. 包含Dify项目信息要求
4. 包含Markdown提交模板
5. 包含学习建议和常见问题

## 参考资源

### 规范文件
- **文件**: `c:\Users\37927\Desktop\VIBECODING\LESSON_TRAE\.trae\skills\course-writing\HOMEWORK_STANDARDS.md`
- **核心要求**:
  - 三层次作业设计：基础（必做）、进阶（选做）、挑战（加分）
  - 每层次必备要素：任务描述、具体要求、测试用例、提交内容
  - Dify项目信息必须放在1.1位置
  - 提交内容列表格式规范
  - Markdown提交模板
  - 学习建议格式
  - 常见问题格式

### 原讲义文件
- **文件**: `c:\Users\37927\Desktop\VIBECODING\LESSON_TRAE\课程讲义\第3章-Agent入门\第1课-Agent入门\第【3章-第1课-Agent入门】讲义.md`
- **原作业内容位置**: 第5.2节「课后作业」
- **原作业内容**:
  - 作业一：概念理解（必做）
  - 作业二：搭建AI找房Agent（必做）
  - 作业三：提示词优化（选做）
  - 作业四：扩展工具（选做）

## ADDED Requirements

### Requirement: 作业分层设计
The system SHALL provide three-level homework design as per HOMEWORK_STANDARDS.md.

#### Scenario: 基础作业
- **GIVEN** 学员需要巩固核心技能
- **WHEN** 设计基础作业
- **THEN** 标记为「必做」
- **AND** 包含任务描述、具体要求、测试用例、提交内容

#### Scenario: 进阶作业
- **GIVEN** 学员希望提升实践能力
- **WHEN** 设计进阶作业
- **THEN** 标记为「选做」
- **AND** 在基础作业之上增加难度

#### Scenario: 挑战作业
- **GIVEN** 学员希望拓展应用场景
- **WHEN** 设计挑战作业
- **THEN** 标记为「加分」
- **AND** 鼓励创新和探索

### Requirement: Dify项目信息要求
The system SHALL specify Dify project information requirements.

#### Scenario: 项目信息位置
- **GIVEN** 基础作业提交内容
- **WHEN** 组织提交材料
- **THEN** Dify项目链接和名称必须放在1.1位置
- **AND** 包含项目链接和项目名称

### Requirement: 提交内容规范
The system SHALL provide clear submission content specifications.

#### Scenario: 提交内容结构
- **GIVEN** 学员完成作业
- **WHEN** 准备提交材料
- **THEN** 按照规范的结构组织
- **AND** 包含所有要求的截图和文档

### Requirement: Markdown提交模板
The system SHALL provide a Markdown submission template.

#### Scenario: 提交格式
- **GIVEN** 学员需要提交作业
- **WHEN** 使用提供的模板
- **THEN** 按照模板格式填写内容
- **AND** 确保所有必填项完整

### Requirement: 学习建议
The system SHALL provide learning suggestions.

#### Scenario: 学习指导
- **GIVEN** 学员开始做作业
- **WHEN** 阅读学习建议部分
- **THEN** 获得有效的学习指导
- **AND** 了解作业完成的最佳实践

### Requirement: 常见问题
The system SHALL provide FAQ section.

#### Scenario: 问题解答
- **GIVEN** 学员在做作业过程中遇到问题
- **WHEN** 查看常见问题部分
- **THEN** 找到常见问题的解答
- **AND** 获得解决问题的思路

## 文件更新位置

需要更新的文件：
```
课程讲义/第3章-Agent入门/第1课-Agent入门/第【3章-第1课-Agent入门】讲义.md
```

更新位置：第5.2节「课后作业」（约第1218-1260行）

## 验收标准

1. **结构完整性**: 包含基础、进阶、挑战三个层次的作业
2. **规范符合性**: 完全符合HOMEWORK_STANDARDS.md要求
3. **内容准确性**: 保留原作业的核心内容，重新组织格式
4. **实用性**: 提交模板可直接使用，学习建议和FAQ有实际帮助
