# 深梦团聚-春节免费住 技术方案 Spec

## Why
基于已完成的PRD文档，需要输出详细的技术方案，明确报名页面字段设计、Dify接口对接方式、以及问题反馈机制，为开发团队提供可执行的技术规范。

## What Changes
- 明确报名页面字段清单及校验规则
- 定义Dify AI审核接口对接方案（https://ajly-dify.szajly.com/v1）
- 设计审核结果反馈和问题处理流程
- 简化范围：仅包含报名页面和问题反馈，不包含活动首页

## Impact
- Affected specs: shenmeng-tuanju-signup
- Affected code: 小程序报名页面、Dify接口层、反馈页面

---

## ADDED Requirements

### Requirement: 报名页面字段设计

报名页面采用**单页分步表单**设计，共3个步骤，字段如下：

#### Step 1: 基本信息

| 序号 | 字段名 | 字段编码 | 类型 | 必填 | 校验规则 | 说明 |
|------|--------|---------|------|------|---------|------|
| 1 | 申请人姓名 | applicantName | String | ✅ | 2-20字符，中文 | 需为真实姓名 |
| 2 | 申请人身份证号 | applicantIdCard | String | ✅ | 18位身份证格式 | 用于年龄校验（≥18岁） |
| 3 | 性别 | gender | String | ✅ | 男/女 | 根据身份证自动识别 |
| 4 | 联系方式 | phone | String | ✅ | 11位手机号 | 用于后续联系 |
| 5 | 职业类别 | occupation | String | ✅ | 枚举值（7类） | 见职业类别枚举 |
| 6 | 工作区域 | workArea | String | ❌ | 深圳行政区 | 选填 |

**职业类别枚举值**：
```javascript
const OCCUPATION_OPTIONS = [
  { value: 'courier', label: '快递员' },
  { value: 'delivery', label: '网约配送员' },
  { value: 'ride_hailing_driver', label: '网约车司机' },
  { value: 'truck_driver', label: '货车司机' },
  { value: 'construction_worker', label: '保障房建筑工人' },
  { value: 'bus_driver', label: '公交车司机' },
  { value: 'metro_staff', label: '地铁一线运营服务人员' }
]
```

#### Step 2: 入住信息

| 序号 | 字段名 | 字段编码 | 类型 | 必填 | 校验规则 | 说明 |
|------|--------|---------|------|------|---------|------|
| 1 | 拟入住人数 | guestCount | Number | ✅ | 1-10人 | 含申请人本人 |
| 2 | 拟入住人员关系 | guestRelation | String | ✅ | 文本描述 | 与申请人的关系 |
| 3 | 入住时间 | checkInDate | Date | ✅ | 2026.2.1-2.14 | 日期选择器 |
| 4 | 计划居住天数 | stayDays | Number | ✅ | 1-15天 | 默认15天 |
| 5 | 申请门店 | applyStore | String | ❌ | 门店ID | 意向门店，选填 |

#### Step 3: 材料上传

| 序号 | 字段名 | 字段编码 | 类型 | 必填 | 校验规则 | 说明 |
|------|--------|---------|------|------|---------|------|
| 1 | 身份认证材料 | idProofImages | Array | ✅ | 1-4张图片 | 工作证/接单证明/社保证明 |
| 2 | 关系证明材料 | relationProofImages | Array | ✅ | 1-4张图片 | 户口本/出生证明/结婚证 |

**图片上传限制**：
- 格式：jpg、png
- 大小：单张不超过5MB
- 数量：每个类型1-4张

---

### Requirement: Dify AI审核接口对接

#### 接口基础信息

| 项目 | 值 |
|------|-----|
| 基础URL | https://ajly-dify.szajly.com/v1 |
| 认证方式 | Bearer Token |
| 请求格式 | application/json |
| 响应格式 | application/json |

#### 审核接口

**请求**：
```
POST https://ajly-dify.szajly.com/v1/workflows/run
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

**请求体**：
```json
{
  "inputs": {
    "applicant_name": "张三",
    "applicant_id_card": "440305199001011234",
    "gender": "男",
    "phone": "13800138000",
    "occupation": "courier",
    "occupation_label": "快递员",
    "work_area": "宝安区",
    "guest_count": 3,
    "guest_relation": "父母、子女",
    "check_in_date": "2026-02-05",
    "stay_days": 15,
    "apply_store": "宝安区-福海塘尾西店",
    "id_proof_images": [
      "https://xxx.com/image1.jpg",
      "https://xxx.com/image2.jpg"
    ],
    "relation_proof_images": [
      "https://xxx.com/relation1.jpg"
    ]
  },
  "response_mode": "blocking",
  "user": "user_123"
}
```

**响应体（审核通过）**：
```json
{
  "workflow_run_id": "wr_123456",
  "task_id": "task_123456",
  "data": {
    "id": "wr_123456",
    "workflow_id": "wf_shenmeng_tuanju",
    "status": "succeeded",
    "outputs": {
      "audit_result": "pass",
      "audit_reason": "审核通过",
      "opportunity_id": "OP_20260116_001",
      "assigned_store": "宝安区-福海塘尾西店",
      "assigned_butler": "李管家",
      "butler_phone": "138****1234"
    },
    "created_at": 1705382400,
    "finished_at": 1705382410
  }
}
```

**响应体（审核失败）**：
```json
{
  "workflow_run_id": "wr_123457",
  "task_id": "task_123457",
  "data": {
    "id": "wr_123457",
    "workflow_id": "wf_shenmeng_tuanju",
    "status": "succeeded",
    "outputs": {
      "audit_result": "reject",
      "audit_reason": "资料不全",
      "reject_code": "MATERIAL_INCOMPLETE",
      "reject_details": [
        {
          "field": "id_proof_images",
          "reason": "缺少工作证明材料",
          "suggestion": "请补充上传工作证、接单截图或社保证明"
        }
      ],
      "modify_suggestion": "您上传的身份认证材料不完整，请补充上传工作证明材料（如工作证、接单截图或社保证明），然后重新提交。"
    },
    "created_at": 1705382400,
    "finished_at": 1705382410
  }
}
```

#### 审核失败原因枚举

| 错误码 | 说明 | 用户提示 |
|--------|------|---------|
| NOT_QUALIFIED | 资格不符 | 您的职业不在活动服务范围内，感谢您的关注 |
| MATERIAL_INCOMPLETE | 资料不全 | 请补充上传相关证明材料 |
| MATERIAL_MISMATCH | 资料不符 | 上传的证明材料与填写信息不符，请核实后重新上传 |
| NOT_IMMEDIATE_FAMILY | 非直系亲属 | 同住人需为直系亲属（父母、配偶、子女），请提供关系证明 |
| AGE_LIMIT | 年龄不符 | 申请人需年满18周岁 |
| DUPLICATE_APPLY | 重复申请 | 每人仅享受一次15天免费住权益 |

---

### Requirement: 审核结果反馈页面

#### 审核中状态
- 显示加载动画
- 提示文字："您的申请正在审核中，预计1-3分钟出结果..."
- 提供【返回首页】按钮
- 支持轮询查询审核状态（每5秒查询一次，最多查询60次）

#### 审核通过状态
- 显示成功图标（绿色对勾）
- 提示文字："恭喜您，审核通过！"
- 展示信息：
  - 分配门店
  - 对接管家姓名
  - 管家联系电话（脱敏显示）
- 操作按钮：
  - 【联系管家】（点击拨打电话）
  - 【查看活动详情】

#### 审核失败状态
- 显示失败图标（红色感叹号）
- 提示文字："审核未通过"
- 展示失败原因和修改建议
- 操作按钮：
  - 【查看详情】（跳转详情页）
  - 【修改资料】（返回表单页，预填数据）

---

### Requirement: 问题反馈详情页

#### 页面结构
```
┌─────────────────────────────────────┐
│  审核结果详情                          │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ ❌ 审核未通过                      ││
│  │ 失败原因：资料不全                   ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  具体问题：                            │
│  ┌─────────────────────────────────┐│
│  │ 1. 身份认证材料不完整               ││
│  │    缺少工作证明材料                 ││
│  │    建议：请上传工作证或接单截图      ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  修改建议：                            │
│  请补充上传工作证明材料（如工作证、      ││
│  接单截图或社保证明），然后重新提交。    ││
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │      【修改资料并重新提交】          ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

#### 交互逻辑
1. 点击【修改资料并重新提交】
2. 跳转至报名表单页
3. 预填已填写的数据
4. 定位到需要修改的字段
5. 用户修改后重新提交

---

## MODIFIED Requirements

### Requirement: 简化页面范围

根据用户需求，本次开发范围简化为：
- ✅ 报名表单页（3步）
- ✅ 审核结果页
- ✅ 审核失败详情页
- ❌ 活动首页（不在本次范围）

---

## 技术架构

### 前端架构（Vue2 + uni-app）

```
src/
├── pages/
│   └── shenmeng-tuanju/
│       ├── form-step1.vue      # 基本信息
│       ├── form-step2.vue      # 入住信息
│       ├── form-step3.vue      # 材料上传
│       ├── result.vue          # 审核结果
│       └── reject-detail.vue   # 审核失败详情
├── components/
│   ├── step-indicator.vue      # 步骤指示器
│   ├── image-uploader.vue      # 图片上传组件
│   └── occupation-picker.vue   # 职业选择器
├── api/
│   ├── dify.js                 # Dify接口封装
│   └── upload.js               # 图片上传接口
├── utils/
│   ├── validator.js            # 表单校验
│   ├── id-card.js              # 身份证解析
│   └── storage.js              # 本地存储
└── store/
    └── modules/
        └── signup.js           # 报名状态管理
```

### Dify接口封装

```javascript
// api/dify.js
const DIFY_BASE_URL = 'https://ajly-dify.szajly.com/v1'
const DIFY_API_KEY = 'app-xxx' // 从配置获取

export async function submitAudit(formData) {
  const response = await uni.request({
    url: `${DIFY_BASE_URL}/workflows/run`,
    method: 'POST',
    header: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    data: {
      inputs: {
        applicant_name: formData.applicantName,
        applicant_id_card: formData.applicantIdCard,
        gender: formData.gender,
        phone: formData.phone,
        occupation: formData.occupation,
        occupation_label: formData.occupationLabel,
        work_area: formData.workArea,
        guest_count: formData.guestCount,
        guest_relation: formData.guestRelation,
        check_in_date: formData.checkInDate,
        stay_days: formData.stayDays,
        apply_store: formData.applyStore,
        id_proof_images: formData.idProofImages,
        relation_proof_images: formData.relationProofImages
      },
      response_mode: 'blocking',
      user: formData.userId
    },
    timeout: 60000
  })
  
  return response.data
}
```

### 数据流转图

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   小程序表单   │────▶│   图片上传    │────▶│   OSS存储    │
└──────────────┘     └──────────────┘     └──────────────┘
        │                                         │
        │                                         │
        ▼                                         ▼
┌──────────────┐                         ┌──────────────┐
│   表单数据    │                         │   图片URL    │
└──────────────┘                         └──────────────┘
        │                                         │
        └─────────────────┬───────────────────────┘
                          │
                          ▼
                 ┌──────────────┐
                 │  Dify审核API │
                 │ (AI审核)      │
                 └──────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
   ┌──────────────┐            ┌──────────────┐
   │   审核通过    │            │   审核失败    │
   └──────────────┘            └──────────────┘
            │                           │
            ▼                           ▼
   ┌──────────────┐            ┌──────────────┐
   │  创建商机     │            │  返回失败原因  │
   │  (Dify调用)  │            │  和修改建议    │
   └──────────────┘            └──────────────┘
```

---

## 接口清单

| 序号 | 接口名称 | 方法 | URL | 说明 |
|------|---------|------|-----|------|
| 1 | Dify审核 | POST | https://ajly-dify.szajly.com/v1/workflows/run | 提交审核 |
| 2 | 图片上传 | POST | /api/upload/image | 上传图片到OSS |
| 3 | 查询审核状态 | GET | /api/activity/audit-status | 轮询查询状态 |
| 4 | 获取报名记录 | GET | /api/activity/record | 获取已填写数据 |
