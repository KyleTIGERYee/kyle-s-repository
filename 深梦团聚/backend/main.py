import os
import json
import asyncio
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# 允许跨域请求，方便前端联调
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有域名跨域，生产环境应配置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === 配置区域 ===
# 请将此处的 Key 替换为您真实的工作流 API Key
DIFY_API_KEY = "app-maJEkX0PlrQdyLzh3jY7RApF" # 你的 Workflow Key
DIFY_API_URL = "https://ajly-dify.szajly.com/v1/workflows/run"
DIFY_UPLOAD_URL = "https://ajly-dify.szajly.com/v1/files/upload"

async def upload_file_to_dify(client: httpx.AsyncClient, file: UploadFile, user_id: str) -> dict:
    """
    将来自前端的文件，以 multipart/form-data 的形式转手传给 Dify 文件上传接口
    返回 Dify 生成的 file 对象 (内含 id)
    """
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}"
        # 注意: 上传文件不能写死 Content-Type，让 httpx 帮忙自动生成带有 boundary 的 multipart 头
    }
    
    # 读出字节流
    content = await file.read()
    
    files = {
        "file": (file.filename, content, file.content_type)
    }
    data = {"user": user_id}
    
    response = await client.post(DIFY_UPLOAD_URL, headers=headers, data=data, files=files)
    response.raise_for_status()
    # 返回示例: {"id": "xxx", "name": "xxx.png", "size": 1234, "extension": "png", "mime_type": "image/png", "created_by": "xxx", "created_at": 1234567890}
    return response.json()


@app.post("/api/submit-application")
async def submit_application(
    name: str = Form(...),
    idCard: str = Form(""),
    phone: str = Form(""),
    workUnit: str = Form(""),
    jobType: str = Form(""),
    store: str = Form(""),
    familySize: str = Form(""),
    relationships: str = Form(""), # 前端可能将数组转为逗号分隔字符串
    checkInDate: str = Form(""),
    stayDays: str = Form(""),
    story: str = Form(""),
    idImages: List[UploadFile] = File(default=[]),      # 身份照片
    relationImages: List[UploadFile] = File(default=[]) # 关系证明照
):
    """
    接收前端表单，组装参数转发给 Dify 工作流
    """
    # 用户标识 (用身份证或手机，Dify的硬性要求，否则报错)
    user_id = idCard if idCard else "anonymous_user"

    try:
        # 建立共用的异步连接
        async with httpx.AsyncClient(timeout=60.0) as client:
            
            # ---【阶段 1：先把所有图片分别发给 Dify 换取 File ID】---
            dify_id_images = []
            dify_relation_images = []
            
            # 并发上传身份照片
            if idImages and len(idImages) > 0 and idImages[0].filename:
                # 过滤掉空的文件项
                valid_files = [f for f in idImages if f.filename]
                tasks = [upload_file_to_dify(client, f, user_id) for f in valid_files]
                results = await asyncio.gather(*tasks)
                for res in results:
                    dify_id_images.append({
                        "type": "image",
                        "transfer_method": "local_file",
                        "upload_file_id": res["id"]
                    })
                    
            # 并发上传关系证明照片
            if relationImages and len(relationImages) > 0 and relationImages[0].filename:
                valid_files = [f for f in relationImages if f.filename]
                tasks = [upload_file_to_dify(client, f, user_id) for f in valid_files]
                results = await asyncio.gather(*tasks)
                for res in results:
                    dify_relation_images.append({
                        "type": "image",
                        "transfer_method": "local_file",
                        "upload_file_id": res["id"]
                    })
            
            # ---【阶段 2：组装运行大模型工作流的核心请求】---
            headers = {
                "Authorization": f"Bearer {DIFY_API_KEY}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "inputs": {
                    "name": name,
                    "idCard": idCard,
                    "phone": phone,
                    "workUnit": workUnit,
                    "jobType": jobType,
                    "store": store,
                    "familySize": familySize,
                    "relationships": relationships,
                    "checkInDate": checkInDate,
                    "stayDays": stayDays,
                    "story": story,
                    # 这是向 Dify 新增的文件数组字段（你要确保你在Dify的Start节点配置了同名 File Array 变量）
                    "idImages": dify_id_images,
                    "relationImages": dify_relation_images
                },
                "response_mode": "blocking",
                "user": user_id
            }

            response = await client.post(DIFY_API_URL, headers=headers, json=payload)
            response.raise_for_status() # 如果状态码不是 2xx，抛出异常
            dify_res = response.json()
            
            # 解析 Dify 工作流返回的结果
            # 工作流在 response_mode='blocking' 时返回的结构通常包含 data.outputs
            outputs = dify_res.get("data", {}).get("outputs", {})
            
            # 从输出变量中提取我们约定好的两个字段
            audit_result = outputs.get("audit_result", "FAILED") 
            audit_reason = outputs.get("audit_reason", "未能从大模型获取到原因，请检查 Dify 工作流配置。")
            
            return {
                "status": audit_result,
                "reason": audit_reason
            }
            
    except httpx.HTTPError as e:
        # 捕获网络异常（如 Dify 平台宕机）
        error_detail = e.response.text if hasattr(e, 'response') and e.response else "无详细响应"
        print(f"请求 Dify 失败: {e} | 详情: {error_detail}")
        return {
            "status": "FAILED",
            "reason": "系统审核超时或网络异常，请稍后再试。"
        }
    except Exception as e:
        # 捕获其他未知异常
        print(f"发生未知错误: {e}")
        return {
            "status": "FAILED",
            "reason": "系统内部发生错误，请联系管理员。"
        }

@app.get("/")
def read_root():
    return {"message": "Service is running."}
