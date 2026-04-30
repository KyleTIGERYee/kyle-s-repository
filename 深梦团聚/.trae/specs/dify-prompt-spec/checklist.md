# Dify 提示词配置检查清单

## 工作流配置检查
- [ ] 工作流类型为"工作流(Workflow)"而非"聊天助手(Chatbot)"
- [ ] 工作流已创建，名称为"深梦团聚-申请审核"
- [ ] 11个文本输入变量已正确配置
- [ ] 2个文件数组输入变量已正确配置（idImages, relationImages）

## LLM节点检查
- [ ] LLM节点已启用"视觉(Vision)"能力
- [ ] 所有文本变量已连接到LLM节点
- [ ] 图片变量已连接到LLM的视觉输入区
- [ ] 提示词模板已完整复制

## 输入变量检查
- [ ] name（申请人姓名，String，50字）
- [ ] idCard（身份证号，String，18字）
- [ ] phone（手机号码，String，20字）
- [ ] workUnit（工作单位，String，200字）
- [ ] jobType（职业类型，String，50字）
- [ ] store（意向门店，String，50字）
- [ ] familySize（家庭人数，String，10字）
- [ ] relationships（成员关系，String，100字）
- [ ] checkInDate（入住日期，String，20字）
- [ ] stayDays（停留天数，String，10字）
- [ ] story（采编意愿，String，10字）
- [ ] idImages（身份证明，File Array）
- [ ] relationImages（关系证明，File Array）

## 输出变量检查
- [ ] audit_result（只能是"PASSED"或"FAILED"）
- [ ] audit_reason（审核失败时的中文评语，审核通过时为空字符串""）

## JSON输出格式检查
- [ ] LLM输出为纯JSON格式
- [ ] 审核通过时：`{"audit_result": "PASSED", "audit_reason": ""}`
- [ ] 审核失败时：`{"audit_result": "FAILED", "audit_reason": "具体原因"}`

## 代码执行节点检查
- [ ] 代码节点已添加在LLM节点和结束节点之间
- [ ] Python/JS代码能正确解析JSON输出
- [ ] 能处理markdown代码块标记
- [ ] 异常情况有默认处理

## 测试用例检查
- [ ] 测试通过场景：符合条件的基层建设者申请，audit_reason为空
- [ ] 测试材料不全场景：未上传身份证明，返回FAILED和具体原因
- [ ] 测试图片模糊场景：照片无法识别，返回FAILED和具体原因
- [ ] 测试JSON格式校验：输出是否符合规范

## 集成检查
- [ ] 工作流已发布（Publish）
- [ ] API Key已配置到后端main.py
- [ ] 前端能正确接收audit_result和audit_reason
- [ ] 审核通过时前端显示成功页（audit_reason为空）
- [ ] 审核失败时前端显示失败页和audit_reason内容
