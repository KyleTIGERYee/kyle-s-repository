# AJLY AI 搜房 MCP 接口文档

## 📋 概述

本文档说明 AJLY AI 搜房服务的所有入参和出参字段，包括 MCP 工具（供 Claude/Dify 等 AI 使用）和 HTTP API（供小程序/前端使用）。

---

## 🎯 功能一：搜索房源

### 入参字段（搜索条件）

> 所有入参均为**非必填**字段，可以任意组合使用。条件越精准，搜索结果越好。

| 字段名 | 类型 | 说明 | 示例值 | 使用场景 |
|--------|------|------|--------|---------|
| **min_price** | string | 最低月租金（元） | `"1000"` | 预算下限，如"1000元以上" |
| **max_price** | string | 最高月租金（元） | `"3000"` | 预算上限，如"3000元以下" |
| **key_word** | string | 房型关键词，支持模糊匹配 | `"一房一厅"`、`"朝南"`、`"开间"`、`"明亮"` | 按户型特征、朝向、采光等关键词搜索 |

### key_word 字段详细说明（房型关键词）

`key_word` 是一个**房型关键词**搜索字段，用于按房型特征搜索房源。系统会在以下数据库字段中进行**模糊匹配**：

#### 匹配范围
- `area_name` - 区域名称（如"优享"、"舒适"、"豪华"）
- `pattern_name` - 户型名称（如"一居室"、"二居室"、"开间"）
- `lighting_name` - 采光名称（如"明亮"、"朝南"）
- `balcony_name` - 阳台名称（如"带阳台"、"无阳台"）

#### 常用房型关键词示例

| 关键词类型 | 示例值 | 说明 |
|----------|--------|------|
| **户型** | `"一房一厅"`、`"一居室"`、`"二居室"`、`"开间"`、`"单间"` | 按房型搜索 |
| **朝向** | `"朝南"`、`"朝东"`、`"南北通透"` | 按房间朝向搜索 |
| **采光** | `"明亮"`、`"采光好"` | 按采光条件搜索 |
| **阳台** | `"带阳台"`、`"无阳台"` | 按阳台情况搜索 |
| **装修** | `"精装"`、`"简装"` | 按装修标准搜索 |

#### 使用示例

**1. 搜索一房一厅**
```json
{
  "key_word": "一房一厅"
}
```

**2. 搜索朝南的房子**
```json
{
  "key_word": "朝南"
}
```

**3. 搜索开间户型**
```json
{
  "key_word": "开间"
}
```

**4. 组合搜索（一房一厅 + 预算范围）**
```json
{
  "key_word": "一房一厅",
  "min_price": "1500",
  "max_price": "3000"
}
```

#### 注意事项

1. **模糊匹配**：只要房型名称包含关键词即可匹配，不需要完全一致
   - 输入 `"一房"` 可以匹配到 `"一房一厅"`、`"一房一卫"` 等
   - 输入 `"居"` 可以匹配到 `"一居室"`、`"二居室"` 等

2. **匹配规则**：系统会同时匹配房型的4个属性字段（区域、户型、采光、阳台），满足任一即可
   - 例如输入 `"明亮"` 会匹配所有采光名称包含"明亮"的房型
   - 例如输入 `"一居"` 会匹配所有户型名称包含"一居"的房型

3. **与其他条件组合**：建议与价格、门店等条件一起使用，结果更精准
   ```json
   {
     "key_word": "一房一厅",
     "store_names": "西乡店",
     "max_price": "2500"
   }
   ```

4. **搜索范围限制**：最多返回 100 条房型记录，然后筛选房间
| **store_names** | string | 指定门店名称，多个用逗号分隔 | `"西乡店,坪洲店"` | 指定门店搜索 |
| **distance** | string | 搜索半径（公里） | `"1.5"` | 需要配合 address 或 select_lat/select_lng 使用 |
| **address** | string | 搜索中心地址 | `"坪洲地铁站"` | 按地点搜索附近房源 |
| **area** | string | 区域/商圈 | `"龙华"`、`"南山"` | 按行政区或商圈搜索 |
| **lat** | string | 用户当前纬度 | `"22.567"` | 基于用户当前位置搜索 |
| **lng** | string | 用户当前经度 | `"113.891"` | 基于用户当前位置搜索 |
| **select_lat** | string | 目标位置纬度（用于通勤计算） | `"22.550"` | 工作地点纬度，配合 duration 使用 |
| **select_lng** | string | 目标位置经度（用于通勤计算） | `"113.880"` | 工作地点经度，配合 duration 使用 |
| **duration** | float | 最大通勤时间（分钟） | `30` | 配合 select_lat/select_lng 使用 |
| **transportation** | int | 交通方式：0=驾车，1=公交，2=骑行，3=步行 | `1` | 配合 duration 使用 |
| **village** | string | 村名（模糊匹配） | `"沙元埔"` | 按村搜索 |
| **floor_num** | string | 楼层号 | `"5"` | 指定楼层搜索 |
| **is_lift** | int | 是否电梯房：0=否，1=是 | `1` | 筛选电梯房/楼梯房 |
| **is_balcony** | string | 阳台：`"有"` 或 `"无"` | `"有"` | 筛选带阳台的房间 |
| **is_self_help** | int | 是否支持自助看房：0=否，1=是 | `1` | 筛选支持自助看房的房源 |

### 入参组合示例

#### 1. 基础价格搜索
```json
{
  "min_price": "1500",
  "max_price": "3000"
}
```

#### 2. 指定门店 + 户型
```json
{
  "store_names": "西乡店,坪洲店",
  "key_word": "一房一厅"
}
```

#### 3. 地址附近搜索（5公里内）
```json
{
  "address": "坪洲地铁站",
  "distance": "5"
}
```

#### 4. 通勤搜索（公交30分钟内到科技园）
```json
{
  "select_lat": "22.550",
  "select_lng": "113.950",
  "duration": 30,
  "transportation": 1,
  "min_price": "1000",
  "max_price": "2500"
}
```

#### 5. 电梯房 + 带阳台
```json
{
  "is_lift": 1,
  "is_balcony": "有",
  "min_price": "1500"
}
```

#### 6. 支持自助看房
```json
{
  "is_self_help": 1,
  "min_price": "1000",
  "max_price": "3000"
}
```

#### 6. 指定楼层 + 指定村
```json
{
  "village": "沙元埔",
  "floor_num": "5"
}
```

#### 7. 综合搜索（完整版）
```json
{
  "min_price": "1000",
  "max_price": "3000",
  "key_word": "一房一厅",
  "area": "南山",
  "is_lift": 1,
  "is_balcony": "有",
  "is_self_help": 1,
  "floor_num": "3"
}
```

---

### 出参字段（返回结果）

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| **type** | int | 结果类型，固定值 1 表示房源搜索 | `1` |
| **list** | array | 房源列表 | - |
| **list[].id** | int | 房型ID | `1009` |
| **list[].housingID** | int | 房源ID（qft_focus_room.housing_id） | `764` |
| **list[].layoutName** | string | 房型名称 | `"优享开间"` |
| **list[].price** | float | 月租金（元） | `2500.0` |
| **list[].homePic** | string | 房源主图URL | `"https://..."` |
| **list[].storeId** | int | 门店ID | `173` |
| **list[].storeName** | string | 门店名称 | `"安居乐寓沙元埔店①"` |
| **list[].roomNumber** | string | 房间号 | `"2-C"` |
| **list[].insideSpace** | float | 室内面积（平方米） | `20.0` |
| **list[].roomId** | int | 房间ID（qft_focus_room.id） | `33207` |
| **list[].village** | string/null | 村名 | `"沙元埔"` |
| **list[].floorNum** | int/null | 楼层 | `2` |
| **list[].isLift** | int/null | 是否电梯房：0=否，1=是 | `1` |
| **list[].isSelfHelp** | int/null | 是否支持自助看房：0=否，1=是 | `1` |
| **list[].orientation** | string/null | 朝向 | `"东"`、`"南"` |
| **list[].daylightFactor** | string | 采光系数 | `"1"` |
| **list[].isBalcony** | string | 阳台：`"有"` 或 `"无"` | `"有"` |
| **list[].kitchen** | string | 厨房：`"有"` 或 `"无"` | `"无"` |
| **list[].operationTable** | string | 操作台：`"有"` 或 `"无"` | `"无"` |
| **list[].refrigerator** | string | 冰箱：`"有"` 或 `"无"` | `"有"` |
| **list[].washingMachine** | string | 洗衣机：`"有"` 或 `"无"` | `"有"` |
| **list[].waterHeater** | string | 热水器：`"有"` 或 `"无"` | `"有"` |
| **list[].rangeHood** | string | 抽油烟机：`"有"` 或 `"无"` | `"无"` |
| **list[].sofa** | string | 沙发：`"有"` 或 `"无"` | `"无"` |
| **list[].coffeeTable** | string | 茶几：`"有"` 或 `"无"` | `"有"` |
| **list[].wardrobe** | string | 衣柜：`"有"` 或 `"无"` | `"有"` |
| **list[].desk** | string | 书桌：`"有"` 或 `"无"` | `"有"` |
| **list[].diningTable** | string | 餐桌：`"有"` 或 `"无"` | `"有"` |
| **storeNames** | array | 涉及的门店名称列表 | `["创业花园店", "沙元埔店①"]` |

### 出参示例

```json
{
  "type": 1,
  "list": [
    {
      "id": 965,
      "housingID": 787,
      "layoutName": "舒适一居室",
      "price": 800.0,
      "homePic": "https://oss.szajly.com/qft/images/dev/app/company_6/focus_room/20250716101820399532100.jpg",
      "storeId": 144,
      "storeName": "创业花园店",
      "roomNumber": "201",
      "insideSpace": 25.0,
      "roomId": 33372,
      "village": null,
      "floorNum": 2,
      "isLift": 1,
      "isSelfHelp": 1,
      "orientation": "东",
      "daylightFactor": "1",
      "isBalcony": "有",
      "kitchen": "无",
      "operationTable": "有",
      "refrigerator": "有",
      "washingMachine": "有",
      "waterHeater": "有",
      "rangeHood": "无",
      "sofa": "无",
      "coffeeTable": "有",
      "wardrobe": "无",
      "desk": "无",
      "diningTable": "有"
    }
  ],
  "storeNames": ["创业花园店", "沙元埔店①"]
}
```

---

## 🎯 功能二：推荐管家

### 入参字段

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| **store_name** | string | **是** | 门店名称 | `"西乡店"` |

### 出参字段

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| **type** | int | 结果类型，固定值 2 表示管家推荐 | `2` |
| **list** | array | 管家列表 | - |
| **list[].id** | int | 管家ID | `456` |
| **list[].realname** | string | 真实姓名 | `"张三"` |
| **list[].phone** | string | 联系电话 | `"13800138000"` |
| **list[].pictureUrl** | string/null | 头像URL | `"https://..."` |
| **list[].storeName** | string/null | 所属门店 | `"西乡店"` |

---

## 📡 使用方式

### 方式一：MCP 工具（AI 对话集成）

适用于 Claude Desktop、Dify 等 AI 平台。

**配置示例（Claude Desktop）：**
```json
{
  "mcpServers": {
    "ajly-house-search": {
      "command": "/path/to/python",
      "args": ["/path/to/mcp_app/server.py"]
    }
  }
}
```

**自然语言示例：**
- "帮我找坪洲地铁站附近 2000 左右的一房一厅"
- "我想找有电梯、带阳台的房子"
- "推荐一下公交 30 分钟内到科技园的房源"
- "西乡店的管家联系方式是什么？"

### 方式二：HTTP API（程序调用）

**搜索房源：**
```bash
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse" \
  -H "Content-Type: application/json" \
  -d '{
    "minPrice": "1000",
    "maxPrice": "3000",
    "isLift": 1,
    "isBalcony": "有",
    "isSelfHelp": 1
  }'
```

**推荐管家：**
```bash
curl -X POST "http://localhost:8001/api/wechat/ai/recommend/butler" \
  -H "Content-Type: application/json" \
  -d '{"storeName": "西乡店"}'
```

---

## ⚠️ 注意事项

### 1. 参数组合规则

- **距离搜索**：`distance` 需要配合 `address` 或 `select_lat`+`select_lng` 使用
- **通勤搜索**：`duration` 必须配合 `select_lat`+`select_lng` 使用
- **村搜索**：`village` 为模糊匹配，如输入 "沙元" 可匹配 "沙元埔"
- **楼层搜索**：`floor_num` 为精确匹配，需输入具体数字

### 2. 返回结果限制

- 每个门店最多返回 **5 个房间**
- 最多返回 **3 个门店**的房源
- 结果按**价格升序**排列

### 3. 配套字段说明

配套字段（厨房、操作台、冰箱、洗衣机等）均返回 `"有"` 或 `"无"`，数据来源：
- **空间配套**（spatial_matching）：厨房、操作台
- **家电配套**（home_appliance_matching）：冰箱、洗衣机、热水器、抽油烟机
- **家私配套**（furniture_matching）：沙发、茶几、衣柜、书桌、餐桌

### 4. 字段命名规范

- **入参（MCP 工具）**：下划线命名，如 `min_price`、`is_lift`
- **入参（HTTP API）**：驼峰命名，如 `minPrice`、`isLift`
- **出参**：驼峰命名，如 `housingID`、`floorNum`、`isLift`

---

## 🚀 本地开发

### 环境要求

- Python 3.10+
- MySQL 数据库

### 安装依赖

```bash
pip install -r requirements.txt
```

### 配置环境变量

创建 `.env` 文件：

```env
DB_HOST=172.25.40.2
DB_PORT=3306
DB_USER=ajly-uat
DB_PASSWORD=your_password
```

### 启动服务

**HTTP API 模式：**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

**MCP Server 模式：**
```bash
python -m mcp_app.server
```

### Docker 部署

```bash
# 构建 HTTP API 镜像
docker build -t ajly-rent-mcp .
docker run -d -p 8001:8001 --env-file .env ajly-rent-mcp

# 构建 MCP Server 镜像
docker build -f Dockerfile.mcp -t ajly-mcp-server .
docker run -d -p 8002:8002 --env-file .env ajly-mcp-server
```

---

## 📞 技术支持

如有问题，请联系开发团队。


---

## 🧪 测试方法

### 1. 使用 curl 命令行测试

#### 基础搜索测试
```bash
# 搜索 1000-3000 元的房源
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{"minPrice": "1000", "maxPrice": "3000"}' | python3 -m json.tool
```

#### 房型关键词测试
```bash
# 搜索一房一厅
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{"key_word": "一房一厅"}' | python3 -m json.tool

# 搜索朝南的房子
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{"key_word": "朝南"}' | python3 -m json.tool
```

#### 电梯房和阳台测试
```bash
# 搜索电梯房
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{"isLift": 1}' | python3 -m json.tool

# 搜索带阳台的房子
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{"isBalcony": "有"}' | python3 -m json.tool

# 搜索电梯房且带阳台
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{"isLift": 1, "isBalcony": "有"}' | python3 -m json.tool
```

#### 楼层和村测试
```bash
# 搜索 5 楼的房子
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{"floorNum": "5"}' | python3 -m json.tool

# 搜索指定村的房子
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{"village": "沙元埔"}' | python3 -m json.tool
```

#### 配套字段测试
```bash
# 搜索带冰箱和洗衣机的房子
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{"minPrice": "1000", "maxPrice": "3000"}' | python3 -c "
import sys, json
data = json.load(sys.stdin)
for house in data.get('list', []):
    print(f"户型: {house['layoutName']}, 价格: {house['price']}元")
    print(f"  冰箱: {house.get('refrigerator', '无')}")
    print(f"  洗衣机: {house.get('washingMachine', '无')}")
    print(f"  热水器: {house.get('waterHeater', '无')}")
    print(f"  空调: {house.get('airConditioner', '无')}")
    print()
"
```

#### 综合搜索测试
```bash
# 搜索电梯房、带阳台、一房一厅、1500-2500元
curl -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{
    "key_word": "一房一厅",
    "minPrice": "1500",
    "maxPrice": "2500",
    "isLift": 1,
    "isBalcony": "有"
  }' | python3 -m json.tool
```

#### 管家推荐测试
```bash
# 推荐西乡店管家
curl -X POST "http://localhost:8001/api/wechat/ai/recommend/butler"   -H "Content-Type: application/json"   -d '{"storeName": "西乡店"}' | python3 -m json.tool
```

---

### 2. 使用 Python 脚本测试

创建测试文件 `test_api.py`：

```python
import requests
import json

BASE_URL = "http://localhost:8001"

def test_search_houses(params, description):
    """测试房源搜索"""
    print(f"
{'='*60}")
    print(f"测试: {description}")
    print(f"{'='*60}")
    print(f"请求参数: {json.dumps(params, ensure_ascii=False, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/api/wechat/ai/searchHouse",
        json=params
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"
✅ 成功! 返回 {len(data.get('list', []))} 条结果")
        
        # 显示前3条结果
        for i, house in enumerate(data.get('list', [])[:3], 1):
            print(f"
--- 房源 {i} ---")
            print(f"  户型: {house.get('layoutName')}")
            print(f"  价格: {house.get('price')}元")
            print(f"  门店: {house.get('storeName')}")
            print(f"  房间号: {house.get('roomNumber')}")
            print(f"  楼层: {house.get('floorNum')}")
            print(f"  电梯: {'是' if house.get('isLift') == 1 else '否'}")
            print(f"  阳台: {house.get('isBalcony')}")
            print(f"  朝向: {house.get('orientation', '无')}")
            print(f"  冰箱: {house.get('refrigerator', '无')}")
            print(f"  洗衣机: {house.get('washingMachine', '无')}")
    else:
        print(f"
❌ 失败! 状态码: {response.status_code}")
        print(f"错误信息: {response.text}")

def test_recommend_butler(store_name):
    """测试管家推荐"""
    print(f"
{'='*60}")
    print(f"测试: 推荐管家 - {store_name}")
    print(f"{'='*60}")
    
    response = requests.post(
        f"{BASE_URL}/api/wechat/ai/recommend/butler",
        json={"storeName": store_name}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"
✅ 成功! 返回 {len(data.get('list', []))} 个管家")
        for butler in data.get('list', []):
            print(f"  - {butler.get('realname')}: {butler.get('phone')}")
    else:
        print(f"
❌ 失败! 状态码: {response.status_code}")

if __name__ == "__main__":
    # 测试用例
    test_cases = [
        ({"minPrice": "1000", "maxPrice": "3000"}, "价格范围搜索"),
        ({"key_word": "一房一厅"}, "房型关键词搜索"),
        ({"isLift": 1}, "电梯房搜索"),
        ({"isBalcony": "有"}, "带阳台搜索"),
        ({"floorNum": "5"}, "指定楼层搜索"),
        ({"village": "沙元埔"}, "指定村搜索"),
        ({
            "key_word": "一房一厅",
            "minPrice": "1500",
            "maxPrice": "2500",
            "isLift": 1,
            "isBalcony": "有"
        }, "综合条件搜索"),
    ]
    
    for params, desc in test_cases:
        test_search_houses(params, desc)
    
    # 测试管家推荐
    test_recommend_butler("西乡店")
```

运行测试：
```bash
python3 test_api.py
```

---

### 3. 使用 Postman/Apifox 测试

#### 导入配置
- **Base URL**: `http://localhost:8001`
- **Content-Type**: `application/json`

#### 搜索房源接口
- **Method**: `POST`
- **URL**: `/api/wechat/ai/searchHouse`
- **Body** (JSON):
```json
{
  "minPrice": "1000",
  "maxPrice": "3000",
  "key_word": "一房一厅",
  "isLift": 1,
  "isBalcony": "有"
}
```

#### 推荐管家接口
- **Method**: `POST`
- **URL**: `/api/wechat/ai/recommend/butler`
- **Body** (JSON):
```json
{
  "storeName": "西乡店"
}
```

---

### 4. 使用浏览器测试

访问 Swagger 文档（自动生成交互式 API 文档）：
```
http://localhost:8001/docs
```

可以直接在浏览器中：
1. 查看所有接口
2. 点击接口展开
3. 填写参数
4. 点击 "Execute" 执行测试
5. 查看返回结果

---

### 5. MCP 工具测试（AI 对话）

如果使用 Claude Desktop 或 Dify 等 AI 平台，可以直接用自然语言测试：

**示例对话：**
```
用户: "帮我找 1500 到 2500 元的一房一厅"
AI: [调用 search_houses 工具，返回结果]

用户: "我想要电梯房，带阳台的"
AI: [调用 search_houses 工具，isLift=1, isBalcony="有"]

用户: "找一下有冰箱和洗衣机的房子"
AI: [调用 search_houses 工具，返回包含配套信息的结果]

用户: "西乡店的管家联系方式是什么？"
AI: [调用 recommend_butler 工具，返回管家信息]
```

---

### 6. 验证返回字段

测试时重点验证以下新增字段是否正确返回：

```bash
curl -s -X POST "http://localhost:8001/api/wechat/ai/searchHouse"   -H "Content-Type: application/json"   -d '{"minPrice": "1000", "maxPrice": "3000"}' | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('list'):
    house = data['list'][0]
    print('验证新增字段:')
    print(f"  ✓ village: {house.get('village')}")
    print(f"  ✓ floorNum: {house.get('floorNum')}")
    print(f"  ✓ isLift: {house.get('isLift')}")
    print(f"  ✓ isSelfHelp: {house.get('isSelfHelp')}")
    print(f"  ✓ orientation: {house.get('orientation')}")
    print(f"  ✓ daylightFactor: {house.get('daylightFactor')}")
    print(f"  ✓ isBalcony: {house.get('isBalcony')}")
    print(f"  ✓ kitchen: {house.get('kitchen')}")
    print(f"  ✓ refrigerator: {house.get('refrigerator')}")
    print(f"  ✓ washingMachine: {house.get('washingMachine')}")
    print(f"  ✓ sofa: {house.get('sofa')}")
    print(f"  ✓ wardrobe: {house.get('wardrobe')}")
else:
    print('无结果')
"
```

---

### 常见问题排查

#### 1. 连接被拒绝
```bash
# 检查服务是否启动
ps aux | grep uvicorn

# 重新启动服务
cd /Users/kyle/Desktop/VIBECODING/ajly-rent-mcp
pyenv exec uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### 2. 数据库连接失败
```bash
# 检查 .env 文件配置
cat .env

# 验证数据库连接
pyenv exec python -c "
from core.database import SessionLocalBasic
db = SessionLocalBasic()
try:
    result = db.execute('SELECT 1')
    print('✅ 数据库连接成功')
except Exception as e:
    print(f'❌ 数据库连接失败: {e}')
finally:
    db.close()
"
```

#### 3. 返回结果为空
- 检查搜索条件是否过于严格
- 尝试减少筛选条件
- 查看服务日志：`tail -f logs/app.log`（如有日志配置）
