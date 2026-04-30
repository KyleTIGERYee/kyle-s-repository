## 修改目标
将 AI 服务中的 `<thinking>` 标签折叠功能，改为同时支持 `<thinking>` 和 `<think>` 两种标签格式。

## 修改文件
- `views/AIChat.tsx`

## 具体修改内容

### 1. 修改正则表达式（第 87 行）
**当前代码：**
```typescript
const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/g;
```
**修改为：**
```typescript
const thinkingRegex = /<(thinking|think)>([\s\S]*?)<\/(thinking|think)>/g;
```

### 2. 修改匹配内容提取逻辑（第 90-92 行）
**当前代码：**
```typescript
const thinkingContent = thinkingMatches.length > 0
  ? thinkingMatches.map(m => m[1].trim()).join('\n\n---\n\n')
  : null;
```
**修改为：**
```typescript
const thinkingContent = thinkingMatches.length > 0
  ? thinkingMatches.map(m => m[2].trim()).join('\n\n---\n\n')
  : null;
```

### 3. 修改生成中状态的处理逻辑（第 111-125 行）
需要同时检查 `<thinking>` 和 `<think>` 标签的存在，并正确处理两种标签的开启和闭合。

### 4. 修改 MessageItem 组件中的条件判断（第 137、144 行）
将 `message.content.includes('<thinking>')` 改为同时检查两种标签。

请确认此计划后，我将执行修改。