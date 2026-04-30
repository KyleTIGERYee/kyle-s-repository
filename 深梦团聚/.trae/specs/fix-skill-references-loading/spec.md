# Fix Skill References Loading Spec

## Why

当前的 `interactive-courseware-creator` skill 存在一个问题：AI 在触发 skill 时，往往只读取 `SKILL.md` 主文件，而不会自动读取 `references/` 目录下的详细组件文档（components-basic.md, components-enhanced.md, navigation.md, styles.md, examples.md）。这导致 AI 在生成课件时缺少关键的组件代码、样式规范和实现示例，无法充分利用 skill 提供的完整能力。

## What Changes

* **重构 SKILL.md**：将 references/ 目录中的核心内容内联到 SKILL.md 中，确保 AI 在读取 skill 时能够获取完整的组件代码和样式规范

* **保留 references/ 目录**：作为详细参考文档和扩展阅读材料保留

* **优化文档结构**：在 SKILL.md 中提供清晰的组件选择指南和代码示例

## Impact

* **Affected specs**: interactive-courseware-creator skill 文档结构

* **Affected code**: SKILL.md 文件内容重构

## ADDED Requirements

### Requirement: Inline Component Documentation/

The system SHALL include all essential component code directly in SKILL.md

#### Scenario: Component Selection Guide

* **WHEN** AI reads SKILL.md

* **THEN** it SHALL have access to complete component code examples

* **AND** it SHALL be able to select appropriate components based on content type

#### Scenario: Code Examples Availability

* **WHEN** AI needs to implement a specific component

* **THEN** it SHALL find the complete HTML/CSS/JS code in SKILL.md

* **AND** it SHALL not need to read external reference files for basic usage

## MODIFIED Requirements

### Requirement: Document Structure

The SKILL.md SHALL be self-contained for basic usage

**Current State**: SKILL.md only references external files
**Desired State**: SKILL.md includes core component code inline

**Changes**:

1. 在"组件选择指南"章节后添加"核心组件代码库"章节
2. 内联最常用的基础组件代码（翻转卡片、手风琴、标签页、步骤流程）
3. 内联样式规范的核心 CSS 变量定义
4. 内联导航系统的核心 JavaScript 代码
5. 保留对 references/ 文件的引用链接，供需要详细文档时查阅

## REMOVED Requirements

None - 所有现有功能保留，只添加内联内容
