#!/usr/bin/env python3
"""
Search knowledge base by keywords (IRG Protocol - Index Only)
Usage: python scripts/knowledge_search.py "关键词"

This script searches the structured JSON knowledge base and returns
index-only results with mandatory deep-read warnings.
"""

import json
import sys
import argparse
from pathlib import Path


class KnowledgeBaseSearcher:
    """Search knowledge base by keywords (IRG Protocol compliant)"""

    def __init__(self, json_file: str):
        self.json_file = Path(json_file)
        self.data = self._load_json()

    def _load_json(self) -> list:
        """Load JSON knowledge base"""
        with open(self.json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data

    def search(self, keywords: str) -> list:
        """
        Search knowledge base by keywords (returns index info only)

        Args:
            keywords: String of keywords to search (space separated)

        Returns:
            List of matching entries with index info and file paths
        """
        keywords_lower = keywords.lower().split()
        matched_entries = []

        for entry in self.data:
            # Check if any key matches
            keys_text = ' '.join(entry['keys']).lower()

            # Match if any keyword is found in keys
            if any(keyword in keys_text for keyword in keywords_lower):
                matched_entries.append(entry)

        return matched_entries

    def format_output(self, matches: list) -> str:
        """
        Format search results as index-only output (IRG Step 1)

        Returns:
            Formatted index info with file paths and mandatory warnings
        """
        if not matches:
            suggestion = """❌ 未找到匹配的知识条目

💡 建议：
1. 尝试使用更简单的关键词（如"退款"、"签约"）
2. 查看 quick-reference.md 了解所有可用关键词
3. 如果问题复杂，直接阅读 knowledge-base/ 中的完整文档"""
            return suggestion

        output = []
        output.append("=" * 70)
        output.append(f"✅ 找到 {len(matches)} 条相关知识索引")
        output.append("=" * 70)

        for idx, entry in enumerate(matches, 1):
            output.append(f"\n【索引条目 {idx}】")

            # Index Info: Core summary from JSON content (知识库提炼精华)
            content = entry['content']

            # File Path: clear path to original document
            file_path = entry.get('file_path', '')
            # Ensure path starts with 'references/'
            if file_path and not file_path.startswith('references/'):
                file_path = f'references/{file_path}'

            output.append(f"📁 原始文档路径：{file_path}")

            # Strategy indicator
            strategy = entry.get('strategy', 'keyword')
            if strategy == 'constant':
                output.append(f"类型：📌 常驻条目（所有任务必读）")
            else:
                output.append(f"类型：🔍 关键词条目")

            # 核心逻辑摘要（知识库提炼精华）
            output.append(f"\n📋 知识库提炼精华：")
            output.append(content)

            output.append("-" * 70)

        # Incomplete Warning (Mandatory for IRG Protocol)
        output.append("\n" + "=" * 70)
        output.append("⚠️ 强制深读警告（IRG 协议）")
        output.append("=" * 70)
        output.append("上述内容为知识库提炼精华，但缺少字段定义、异常流程和 UI 交互细节。")
        output.append("撰写 PRD 或详细方案时，严禁仅依赖此内容，必须调用 read_file 工具")
        output.append("读取上述路径的完整文档，以确保获取全量细节。")
        output.append("")
        output.append("如果你正在执行以下任务，必须先读取完整文档：")
        output.append("  • PRD 撰写")
        output.append("  • 流程设计")
        output.append("  • 详细规则梳理")
        output.append("  • UI/UX 方案设计")
        output.append("=" * 70)

        return '\n'.join(output)


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='Search knowledge base by keywords',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python scripts/knowledge_search.py "预订金"
  python scripts/knowledge_search.py "退款 签约"
  python scripts/knowledge_search.py "企业客户"
        """
    )

    parser.add_argument('keywords', help='Keywords to search (space separated)')
    parser.add_argument(
        '--json-file',
        default='references/knowledge-base/knowledge-base.json',
        help='Path to JSON knowledge base file (default: references/knowledge-base/knowledge-base.json)'
    )

    args = parser.parse_args()

    # Initialize searcher
    try:
        searcher = KnowledgeBaseSearcher(args.json_file)
    except FileNotFoundError:
        print(f"❌ 错误：找不到知识库文件 {args.json_file}")
        print(f"\n请确认文件路径是否正确")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"❌ 错误：知识库文件格式不正确 {args.json_file}")
        sys.exit(1)

    # Search
    matches = searcher.search(args.keywords)

    # Output
    print(searcher.format_output(matches))


if __name__ == "__main__":
    main()
