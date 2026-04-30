# Tasks

## Phase 1: 项目初始化与基础架构

- [x] Task 1: 创建Vue2小程序项目基础结构
  - [x] SubTask 1.1: 初始化uni-app Vue2项目
  - [x] SubTask 1.2: 配置项目基础目录结构（pages、components、api、utils、store）
  - [x] SubTask 1.3: 配置小程序基础配置（pages.json、manifest.json）
  - [x] SubTask 1.4: 配置Dify接口基础URL（https://ajly-dify.szajly.com/v1）

- [x] Task 2: 创建公共组件和工具函数
  - [x] SubTask 2.1: 创建步骤指示器组件（step-indicator.vue）
  - [x] SubTask 2.2: 创建图片上传组件（image-uploader.vue）
  - [x] SubTask 2.3: 创建职业选择器组件（occupation-picker.vue）
  - [x] SubTask 2.4: 创建表单校验工具函数（validator.js）
  - [x] SubTask 2.5: 创建身份证解析工具（id-card.js）
  - [x] SubTask 2.6: 创建API请求封装（request.js）
  - [x] SubTask 2.7: 创建数据暂存工具（storage.js）

## Phase 2: 报名页面开发

- [x] Task 3: 开发报名表单页-基本信息（form-step1.vue）
  - [x] SubTask 3.1: 创建基本信息表单布局（6个字段）
  - [x] SubTask 3.2: 实现申请人姓名输入框（2-20字符校验）
  - [x] SubTask 3.3: 实现身份证号输入框（18位格式校验 + 自动识别性别年龄）
  - [x] SubTask 3.4: 实现性别显示（根据身份证自动识别）
  - [x] SubTask 3.5: 实现联系方式输入框（11位手机号校验）
  - [x] SubTask 3.6: 实现职业类别选择器（7类职业枚举）
  - [x] SubTask 3.7: 实现工作区域选择器（深圳行政区）
  - [x] SubTask 3.8: 实现表单校验逻辑
  - [x] SubTask 3.9: 实现数据暂存功能

- [x] Task 4: 开发报名表单页-入住信息（form-step2.vue）
  - [x] SubTask 4.1: 创建入住信息表单布局（5个字段）
  - [x] SubTask 4.2: 实现拟入住人数输入框（1-10人校验）
  - [x] SubTask 4.3: 实现拟入住人员关系输入框
  - [x] SubTask 4.4: 实现入住时间选择器（日期范围：2026.2.1-2.14）
  - [x] SubTask 4.5: 实现计划居住天数输入框（默认15天，最长15天）
  - [x] SubTask 4.6: 实现申请门店选择器（门店列表）
  - [x] SubTask 4.7: 实现表单校验逻辑
  - [x] SubTask 4.8: 实现数据暂存功能

- [x] Task 5: 开发报名表单页-材料上传（form-step3.vue）
  - [x] SubTask 5.1: 创建材料上传页面布局
  - [x] SubTask 5.2: 实现身份认证材料上传（1-4张，jpg/png，<5MB）
  - [x] SubTask 5.3: 实现关系证明材料上传（1-4张，jpg/png，<5MB）
  - [x] SubTask 5.4: 实现图片预览功能
  - [x] SubTask 5.5: 实现图片删除功能
  - [x] SubTask 5.6: 实现图片压缩功能
  - [x] SubTask 5.7: 实现提交报名逻辑

## Phase 3: 审核结果页面开发

- [x] Task 6: 开发审核结果页（result.vue）
  - [x] SubTask 6.1: 创建审核结果页面布局
  - [x] SubTask 6.2: 实现审核中状态展示（加载动画 + 提示文字）
  - [x] SubTask 6.3: 实现审核通过状态展示（成功图标 + 管家信息）
  - [x] SubTask 6.4: 实现审核失败状态展示（失败图标 + 原因）
  - [x] SubTask 6.5: 实现联系管家按钮（拨打电话）
  - [x] SubTask 6.6: 实现查看详情按钮跳转
  - [x] SubTask 6.7: 实现轮询查询审核状态（每5秒，最多60次）

- [x] Task 7: 开发审核失败详情页（reject-detail.vue）
  - [x] SubTask 7.1: 创建失败详情页面布局
  - [x] SubTask 7.2: 实现失败原因分类展示
  - [x] SubTask 7.3: 实现具体问题列表展示
  - [x] SubTask 7.4: 实现修改建议展示
  - [x] SubTask 7.5: 实现修改资料按钮（跳转表单 + 预填数据）

## Phase 4: 接口对接

- [x] Task 8: 封装Dify审核接口（api/dify.js）
  - [x] SubTask 8.1: 配置Dify基础URL（https://ajly-dify.szajly.com/v1）
  - [x] SubTask 8.2: 实现submitAudit函数（POST /workflows/run）
  - [x] SubTask 8.3: 实现请求参数映射
  - [x] SubTask 8.4: 实现响应结果解析
  - [x] SubTask 8.5: 实现错误处理和重试机制

- [x] Task 9: 对接图片上传接口
  - [x] SubTask 9.1: 实现图片上传函数（POST /api/upload/image）
  - [x] SubTask 9.2: 实现上传进度显示
  - [x] SubTask 9.3: 实现上传失败重试

- [x] Task 10: 对接其他业务接口
  - [x] SubTask 10.1: 实现查询审核状态接口（GET /api/activity/audit-status）
  - [x] SubTask 10.2: 实现获取报名记录接口（GET /api/activity/record）

## Phase 5: 测试与优化

- [ ] Task 11: 功能测试
  - [ ] SubTask 11.1: 测试报名流程完整性（3步表单）
  - [ ] SubTask 11.2: 测试表单校验逻辑
  - [ ] SubTask 11.3: 测试图片上传功能
  - [ ] SubTask 11.4: 测试Dify审核接口调用
  - [ ] SubTask 11.5: 测试审核结果展示
  - [ ] SubTask 11.6: 测试审核失败详情展示
  - [ ] SubTask 11.7: 测试修改重填流程

- [ ] Task 12: 性能优化
  - [ ] SubTask 12.1: 优化图片上传性能（压缩）
  - [ ] SubTask 12.2: 优化页面加载速度
  - [ ] SubTask 12.3: 优化表单暂存机制

- [ ] Task 13: 兼容性测试
  - [ ] SubTask 13.1: iOS微信兼容性测试
  - [ ] SubTask 13.2: Android微信兼容性测试
  - [ ] SubTask 13.3: 不同机型适配测试

# Task Dependencies

- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 4]
- [Task 6] depends on [Task 5]
- [Task 7] depends on [Task 6]
- [Task 8] depends on [Task 1]
- [Task 9] depends on [Task 1]
- [Task 10] depends on [Task 1]
- [Task 11] depends on [Task 7, Task 8, Task 9, Task 10]
- [Task 12] depends on [Task 11]
- [Task 13] depends on [Task 12]
