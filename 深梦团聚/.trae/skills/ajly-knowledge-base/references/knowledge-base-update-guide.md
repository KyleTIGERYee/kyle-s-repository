# 知识库更新指南

本文档说明如何更新安居乐寓知识库，包括更新 JSON 知识索引和 Markdown 完整文档。

---

## 更新流程

### 场景：用户提供 Word 文档

当用户提供一个 Word 文档（`.docx` 或 `.doc`）需要更新到知识库时，按照以下步骤操作：

### Step 1: 文档转换

**方法 1：使用 Python 脚本转换**（推荐）

如果系统中有 `python-docx` 库，可以使用以下脚本：

```python
from docx import Document

def convert_docx_to_md(docx_path, md_path):
    """
    将 Word 文档转换为 Markdown 格式
    
    Args:
        docx_path: Word 文档路径
        md_path: 输出的 Markdown 文档路径
    """
    doc = Document(docx_path)
    
    markdown_content = []
    markdown_content.append(f"# {docx_path.stem}\n")
    
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            # 检测标题
            style_name = para.style.name if para.style else ""
            if "Heading" in style_name:
                level = style_name.split()[-1] if style_name.split()[-1].isdigit() else "2"
                markdown_content.append(f"{'#' * int(level)} {text}\n")
            elif len(text) < 100 and text.isupper():
                markdown_content.append(f"## {text}\n")
            else:
                markdown_content.append(f"{text}\n")
    
    # 写入 Markdown 文件
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(markdown_content))

# 使用示例
convert_docx_to_md("文档.docx", "knowledge-base/文档.md")
```

**方法 2：手动转换**

1. 使用 Microsoft Word 或 WPS 打开文档
2. 复制所有内容
3. 粘贴到 Markdown 编辑器（如 Typora、VSCode）
4. 保存为 `.md` 文件

### Step 2: 生成知识索引

**手动提取知识索引**

从 Word 文档中提取关键信息，生成 JSON 知识索引条目：

```json
{
  "keys": ["关键词1", "关键词2", "关键词3"],
  "content": "【核心内容】\n\n**1. 主要功能**：\n功能描述...\n\n**2. 关键规则**：\n规则描述...\n\n**3. 注意事项**：\n注意事项...",
  "strategy": "keyword",
  "enabled": true,
  "file_path": "knowledge-base/文档.md"
}
```

**知识索引字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keys | array | 是 | 关键词列表，用于检索 |
| content | string | 是 | 知识库提炼精华，包含核心业务规则和逻辑 |
| strategy | string | 否 | "keyword"（关键词条目）或 "constant"（常驻条目） |
| enabled | boolean | 否 | 是否启用，默认 true |
| file_path | string | 是 | 对应的 Markdown 完整文档路径 |

**内容提取原则**：

- **keys**：提取文档的核心关键词，包括：
  - 功能名称（如"预订金"、"退款"）
  - 业务模块（如"租务系统"、"SCRM"）
  - 操作类型（如"签约"、"退房"）
  - 角色类型（如"管家"、"店长"）

- **content**：提取知识库提炼精华，包括：
  - **核心功能**：1-2 句话描述文档的核心功能
  - **关键规则**：列出最重要的 3-5 条业务规则
  - **注意事项**：列出需要注意的关键点（2-3 条）
  - **产品经理批注**（可选）：PM 的经验总结

**示例**：

假设用户提供了"预订金功能说明.docx"文档，提取的知识索引如下：

```json
{
  "keys": ["预订金", "意向金", "锁房", "定金"],
  "content": "【核心功能：预订金管理】\n\n**1. 主要功能**：\n用户在看房后可通过小程序缴纳预订金，锁定房源7天。预订金可抵扣首期租金，不支持退款。\n\n**2. 关键规则**：\n- 预订金金额为500元\n- 锁房期限为7天\n- 超期未签约自动释放房源\n- 预订金不支持退款\n\n**3. 注意事项**：\n- 预订金缴纳后不可更改房源\n- 管家需在24小时内联系用户确认\n\n**产品经理批注**：\n注意：此功能涉及资金安全，需与财务部门确认对账规则。",
  "strategy": "keyword",
  "enabled": true,
  "file_path": "knowledge-base/预订金功能说明.md"
}
```

### Step 3: 更新 JSON 知识库

**文件位置**：`knowledge-base/knowledge-base.json`

**更新步骤**：

1. 打开 `knowledge-base/knowledge-base.json` 文件
2. 在数组末尾添加新的知识索引条目
3. 确保文件格式正确（有效的 JSON 数组）

**示例**：

```json
[
  {
    "keys": ["乐寓租务系统", "租务后台", "全房通"],
    "content": "【核心系统：乐寓租务系统】\n\n**1. 系统定位与现状**：\n乐寓租务系统是支撑安居乐寓5.4万间房源全生命周期管理的核心后台...",
    "strategy": "keyword",
    "enabled": true,
    "file_path": "knowledge-base/pm-guidelines.md"
  },
  {
    "keys": ["预订金", "意向金", "锁房"],
    "content": "【核心功能：预订金管理】\n\n**1. 主要功能**：\n用户在看房后可通过小程序缴纳预订金，锁定房源7天...",
    "strategy": "keyword",
    "enabled": true,
    "file_path": "knowledge-base/预订金功能说明.md"
  }
]
```

### Step 4: 添加 Markdown 完整文档

**文件位置**：`knowledge-base/`

**操作步骤**：

1. 将转换后的 Markdown 文件放入 `knowledge-base/` 目录
2. 确保文件名与 JSON 知识索引中的 `file_path` 一致
3. 确保文件内容完整，包含：
   - 详细的功能说明
   - 完整的操作流程
   - 字段定义和约束
   - 状态机流转
   - 异常流程
   - UI 交互细节
   - 注意事项

---

## 更新后的验证

### 验证步骤

1. **验证 JSON 知识库**：
   ```bash
   # 检查 JSON 格式是否正确
   python -m json.tool knowledge-base/knowledge-base.json
   ```

2. **验证知识检索**：
   ```bash
   # 测试知识检索功能
   python scripts/knowledge_search.py "新添加的关键词"
   ```

3. **验证文档可读性**：
   - 使用 Markdown 编辑器打开新添加的文档
   - 检查格式是否正确
   - 检查内容是否完整

---

## 常见问题

### Q1: 如何确保知识索引的质量？

**A**：遵循以下原则：
- 关键词要准确反映文档内容
- 知识库提炼精华要简洁但关键
- 文档路径要准确匹配

### Q2: 如果文档内容很多，如何提取精华？

**A**：重点提取：
- 核心功能和目标
- 最关键的业务规则（3-5条）
- 最重要的注意事项（2-3条）
- 如果有 PM 批注，务必包含

### Q3: 文档路径有什么要求？

**A**：
- 必须以 `knowledge-base/` 开头
- 必须与实际 Markdown 文件名一致
- 建议使用有意义的文件名（如"预订金功能说明.md"）

### Q4: 如何批量更新多个文档？

**A**：
1. 将所有 Word 文档转换为 Markdown
2. 为每个文档提取知识索引
3. 批量更新 JSON 知识库
4. 批量添加 Markdown 文档
5. 进行批量验证

---

## 示例完整流程

假设用户提供了"新功能-优惠券管理.docx"文档：

### Step 1: 文档转换
```bash
# 转换为 Markdown
python convert_script.py "新功能-优惠券管理.docx" "knowledge-base/新功能-优惠券管理.md"
```

### Step 2: 生成知识索引
```json
{
  "keys": ["优惠券", "折扣券", "代金券", "营销活动"],
  "content": "【核心功能：优惠券管理】\n\n**1. 主要功能**：\n支持创建和管理三种类型的优惠券：折扣券、代金券、租金券。优惠券可通过活动发放、推荐奖励等方式获得。\n\n**2. 关键规则**：\n- 折扣券：支持百分比折扣和固定金额折扣\n- 代金券：无门槛使用\n- 租金券：仅限支付租金时使用\n- 有效期：可设置具体日期或领取后N天有效\n\n**3. 注意事项**：\n- 同一订单限用一张优惠券\n- 折扣券与代金券不可叠加\n- 优惠券不可转让",
  "strategy": "keyword",
  "enabled": true,
  "file_path": "knowledge-base/新功能-优惠券管理.md"
}
```

### Step 3: 更新 JSON 知识库
将上述 JSON 条目添加到 `knowledge-base/knowledge-base.json`

### Step 4: 验证
```bash
# 验证 JSON 格式
python -m json.tool knowledge-base/knowledge-base.json

# 测试检索
python scripts/knowledge_search.py "优惠券"
```

---

## 工具推荐

### Word 转 Markdown 工具

1. **Pandoc**（推荐）
   ```bash
   pandoc 文档.docx -o knowledge-base/文档.md
   ```

2. **Writage**（在线工具）
   - 访问 https://www.writage.com/
   - 上传 Word 文档
   - 下载 Markdown 文件

3. **Typora**
   - 支持 Word 文件导入
   - 导出为 Markdown 格式

### JSON 编辑工具

1. **VS Code**
   - 安装 JSON 插件
   - 自动格式化和校验

2. **Sublime Text**
   - 支持 JSON 语法高亮
   - 自动格式化

---

## 注意事项

1. **文件编码**：确保所有 Markdown 文件使用 UTF-8 编码
2. **JSON 格式**：确保 JSON 文件格式正确，逗号和引号无误
3. **文件命名**：使用有意义的文件名，避免中文特殊字符
4. **内容完整性**：确保 Markdown 文档内容完整，格式正确
5. **索引准确性**：确保知识索引准确反映文档内容
