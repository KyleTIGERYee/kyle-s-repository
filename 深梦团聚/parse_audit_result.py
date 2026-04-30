"""
Dify LLM 输出解析器
用于解析AI审核结果，提取 audit_result 和 audit_reason 两个变量
"""
import json
from typing import Tuple, Union, Any


def parse_audit_result(llm_output: Union[str, dict, Any]) -> Tuple[str, str]:
    """
    解析LLM输出的JSON格式审核结果
    
    Args:
        llm_output: LLM输出的原始内容，可能是字符串、字典或其他对象
        
    Returns:
        Tuple[str, str]: (audit_result, audit_reason)
            - audit_result: "PASSED" 或 "FAILED"
            - audit_reason: 审核原因（通过时为空字符串）
    """
    try:
        if llm_output is None:
            return "FAILED", "审核结果为空，请重新提交"
        
        if isinstance(llm_output, dict):
            if "llm_output" in llm_output:
                return parse_audit_result(llm_output["llm_output"])
            
            audit_result = llm_output.get("audit_result", "FAILED")
            audit_reason = llm_output.get("audit_reason", "")
            
            if audit_result not in ["PASSED", "FAILED"]:
                audit_result = "FAILED"
            
            if audit_result == "PASSED":
                audit_reason = ""
            
            return audit_result, audit_reason
        
        if not isinstance(llm_output, str):
            if hasattr(llm_output, '__dict__'):
                obj_dict = llm_output.__dict__
                if 'audit_result' in obj_dict:
                    return parse_audit_result(obj_dict)
                if 'text' in obj_dict:
                    return parse_audit_result(obj_dict['text'])
                if 'content' in obj_dict:
                    return parse_audit_result(obj_dict['content'])
            
            try:
                llm_output = str(llm_output)
            except:
                return "FAILED", "审核结果格式异常，请重新提交"
        
        clean_output = llm_output.strip()
        
        if clean_output.startswith("```json"):
            clean_output = clean_output[7:]
        elif clean_output.startswith("```"):
            clean_output = clean_output[3:]
        if clean_output.endswith("```"):
            clean_output = clean_output[:-3]
        clean_output = clean_output.strip()
        
        if not clean_output.startswith("{"):
            clean_output = "{" + clean_output
        if not clean_output.endswith("}"):
            clean_output = clean_output + "}"
        
        result = json.loads(clean_output)
        
        audit_result = result.get("audit_result", "FAILED")
        audit_reason = result.get("audit_reason", "")
        
        if audit_result not in ["PASSED", "FAILED"]:
            audit_result = "FAILED"
        
        if audit_result == "PASSED":
            audit_reason = ""
        
        return audit_result, audit_reason
        
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        return "FAILED", "审核结果格式异常，请重新提交"
    except Exception as e:
        print(f"解析异常: {e}")
        return "FAILED", "系统处理异常，请重新提交"


def parse_audit_result_dict(llm_output: Union[str, dict, Any]) -> dict:
    """
    解析LLM输出的JSON格式审核结果（返回字典格式）
    
    Args:
        llm_output: LLM输出的原始内容
        
    Returns:
        dict: {"audit_result": str, "audit_reason": str}
    """
    audit_result, audit_reason = parse_audit_result(llm_output)
    return {
        "audit_result": audit_result,
        "audit_reason": audit_reason
    }


def main(llm_output: Union[str, dict, Any]) -> dict:
    """
    Dify代码执行节点入口函数
    
    Args:
        llm_output: LLM节点的输出
        
    Returns:
        dict: {"audit_result": str, "audit_reason": str}
    """
    return parse_audit_result_dict(llm_output)


if __name__ == "__main__":
    test_cases = [
        '{"audit_result": "PASSED", "audit_reason": ""}',
        '{"audit_result": "FAILED", "audit_reason": "身份证明材料不清晰，请重新上传"}',
        '```json\n{"audit_result": "PASSED", "audit_reason": ""}\n```',
        {"audit_result": "PASSED", "audit_reason": ""},
        {"audit_result": "FAILED", "audit_reason": "测试字典输入"},
        {"llm_output": "\"audit_result\": \"PASSED\",\n  \"audit_reason\": \"\"\n}"},
        "\"audit_result\": \"FAILED\",\n  \"audit_reason\": \"测试不完整JSON\"\n}",
        None,
        12345,
    ]
    
    print("=" * 60)
    print("LLM输出解析测试")
    print("=" * 60)
    
    for i, test_input in enumerate(test_cases, 1):
        print(f"\n测试用例 {i}:")
        print(f"输入类型: {type(test_input)}")
        print(f"输入: {str(test_input)[:50]}...")
        result = parse_audit_result_dict(test_input)
        print(f"输出: {result}")
