# Tasks

- [x] Task 1: 在Dify平台创建工作流
  - [x] SubTask 1.1: 创建新的工作流类型应用，命名为"深梦团聚-申请审核"
  - [x] SubTask 1.2: 配置11个文本输入变量（name, idCard, phone, workUnit, jobType, store, familySize, relationships, checkInDate, stayDays, story）
  - [x] SubTask 1.3: 配置2个文件数组输入变量（idImages, relationImages）

- [x] Task 2: 配置LLM节点
  - [x] SubTask 2.1: 添加LLM节点，选择支持视觉能力的模型
  - [x] SubTask 2.2: 启用"视觉(Vision)"能力
  - [x] SubTask 2.3: 将spec.md中的完整提示词模板复制到系统提示词区域
  - [x] SubTask 2.4: 将Start节点的所有变量连接到LLM节点（图片变量连向视觉输入区）

- [x] Task 3: 配置输出解析
  - [x] SubTask 3.1: 添加代码执行节点（Python/JS），解析LLM输出的JSON
  - [x] SubTask 3.2: 从JSON中提取 audit_result（PASSED/FAILED）
  - [x] SubTask 3.3: 从JSON中提取 audit_reason（审核通过时为空字符串）

- [x] Task 4: 配置结束节点
  - [x] SubTask 4.1: 配置输出变量 audit_result（类型：String）
  - [x] SubTask 4.2: 配置输出变量 audit_reason（类型：String）

- [ ] Task 5: 测试与发布（需在Dify平台手动执行）
  - [ ] SubTask 5.1: 准备测试用例（通过、材料不全、职业不符等场景）
  - [ ] SubTask 5.2: 执行端到端测试，验证输出格式
  - [ ] SubTask 5.3: 发布工作流，获取API Key
  - [ ] SubTask 5.4: 更新后端main.py中的API Key配置

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 4]

# 代码执行节点示例代码

```python
import json

def main(llm_output: str) -> dict:
    """
    解析LLM输出的JSON格式
    {
      "audit_result": "PASSED" | "FAILED",
      "audit_reason": "审核原因（通过时为空）"
    }
    """
    try:
        # 清理可能的markdown代码块标记
        clean_output = llm_output.strip()
        if clean_output.startswith("```json"):
            clean_output = clean_output[7:]
        if clean_output.startswith("```"):
            clean_output = clean_output[3:]
        if clean_output.endswith("```"):
            clean_output = clean_output[:-3]
        clean_output = clean_output.strip()
        
        result = json.loads(clean_output)
        
        audit_result = result.get("audit_result", "FAILED")
        audit_reason = result.get("audit_reason", "")
        
        # 确保结果只能是 PASSED 或 FAILED
        if audit_result not in ["PASSED", "FAILED"]:
            audit_result = "FAILED"
        
        # 审核通过时，audit_reason必须为空
        if audit_result == "PASSED":
            audit_reason = ""
        
        return {
            "audit_result": audit_result,
            "audit_reason": audit_reason
        }
    except json.JSONDecodeError:
        return {
            "audit_result": "FAILED",
            "audit_reason": "审核结果格式异常，请重新提交"
        }
```
