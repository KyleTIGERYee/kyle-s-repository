#!/usr/bin/env python3
"""
Competitor Researcher
Generate search strategies and provide quality checklist for competitive research
"""

import argparse
import json
from typing import Dict, List


class CompetitorResearcher:
    """Generate search strategies and quality checklist for competitive research"""

    def __init__(self):
        self.search_strategies = {
            "direct": [
                '"{topic}" app',
                '"{topic}" platform',
                '"{topic}" saas',
                '"{topic}" product',
                '"{topic}" software'
            ],
            "market_leaders": [
                '"{topic}" market leaders',
                '"{topic}" top companies',
                '"{topic}" 竞争格局',
                '"{topic}" 市场份额',
                '"{topic}" market share'
            ],
            "feature_comparison": [
                '"{feature}" feature comparison',
                '"{feature}" best practices',
                '"{feature}" implementation examples',
                '"{feature}" 对比'
            ],
            "chinese": [
                '"{topic}" 竞品分析',
                '"{topic}" 市场报告',
                '"{topic}" 行业报告',
                '"{topic}" 头部企业'
            ],
            "reviews": [
                '"{topic}" review',
                '"{topic}" comparison',
                '"{topic}" alternatives',
                '"{topic}" 替代品'
            ]
        }

        self.quality_checklist = {
            "necessary": [
                "直接与调研主题相关",
                "来源可辨识（知道是哪个产品）",
                "信息可验证（有官网或权威报道）",
                "核心内容可免费获取"
            ],
            "direct_competitor": [
                "产品形态相同或类似",
                "目标用户重叠度高",
                "解决相同的核心问题"
            ],
            "indirect_competitor": [
                "解决相同问题但产品形态不同",
                "目标用户有部分重叠",
                "有替代关系"
            ],
            "data_quality": [
                "信息来源可查证（官网、权威报道）",
                "信息不是纯营销内容",
                "不是明显的AI生成内容（缺乏具体细节）",
                "数据或案例有具体来源"
            ],
            "red_flags": [
                "⚠️ 网站充满广告，难以阅读",
                "⚠️ 来源不明，没有产品信息",
                "⚠️ 标题党（\"震惊！\" \"10个你不知道的\"）",
                "⚠️ 内容和标题不符",
                "⚠️ 纯粹的产品推广文"
            ]
        }

    def generate_search_strategies(self, topic: str, feature: str = None) -> Dict[str, List[str]]:
        """
        Generate search strategies for the given topic

        Args:
            topic: The product or market topic to research
            feature: Optional specific feature to compare

        Returns:
            Dictionary with category keys and lists of search queries
        """
        strategies = {}

        # Direct competitors
        strategies["直接竞品搜索"] = [q.format(topic=topic) for q in self.search_strategies["direct"]]

        # Market leaders
        strategies["头部玩家搜索"] = [q.format(topic=topic) for q in self.search_strategies["market_leaders"]]

        # Feature comparison
        if feature:
            strategies["功能对比搜索"] = [q.format(feature=feature) for q in self.search_strategies["feature_comparison"]]

        # Chinese search
        strategies["中文搜索"] = [q.format(topic=topic) for q in self.search_strategies["chinese"]]

        # Reviews
        strategies["评价与对比"] = [q.format(topic=topic) for q in self.search_strategies["reviews"]]

        return strategies

    def get_quality_checklist(self) -> Dict[str, List[str]]:
        """
        Get quality checklist for evaluating competitors

        Returns:
            Dictionary with category keys and lists of checklist items
        """
        return self.quality_checklist

    def get_extraction_template(self, competitor_name: str) -> str:
        """
        Get template for extracting competitor information

        Args:
            competitor_name: Name of the competitor

        Returns:
            Markdown formatted template string
        """
        template = f"""## 竞品：{competitor_name}
**类型**：直接竞品 / 间接竞品 / 替代方案
**定位**：{一句话描述}
**链接**：{官网链接}

### 核心价值主张
- {{核心差异化点1}}
- {{核心差异化点2}}

### 关键功能分析
| 功能模块 | 实现方式 | 优点 | 可借鉴点 |
|---------|---------|------|---------|
| {{功能1}} | {{如何实现}} | {{优势}} | {{我们的可以如何借鉴}} |
| {{功能2}} | {{如何实现}} | {{优势}} | {{我们的可以如何借鉴}} |

### 用户体验亮点
- **信息架构**：{{如何组织信息}}
- **关键流程**：{{重要流程的设计}}
- **设计亮点**：{{值得借鉴的设计细节}}

### 商业模式
- **定价**：{{价格体系}}
- **盈利模式**：{{如何赚钱}}
- **增值服务**：{{额外收入来源}}

### 创新点与独特策略
- **技术创新**：{{技术方面的创新}}
- **设计创新**：{{设计方面的创新}}
- **运营创新**：{{运营方面的创新}}

### 弱点与机会
- **用户抱怨**：{{用户反馈的主要问题}}
- **未被满足的需求**：{{竞品没做到的地方}}
- **我们的机会**：{{我们可以如何超越}}

### 评分
| 维度 | 评分 (1-5) | 说明 |
|-----|----------|------|
| 产品完整性 |  | |
| 用户体验 |  | |
| 创新性 |  | |
| 商业模式 |  | |
| 整体印象 |  | |
"""
        return template

    def get_insights_template(self) -> str:
        """
        Get template for generating insights and recommendations

        Returns:
            Markdown formatted template string
        """
        template = """## 竞品调研洞察与建议

### 市场格局
- **市场成熟度**：{{评估（新兴/成长/成熟）}}
- **主要玩家**：{{列出关键竞品}}
- **我们的定位机会**：{{建议}}

### 功能借鉴优先级
| 功能 | 竞品覆盖率 | 重要性 | 建议 |
|-----|----------|--------|------|
| {{功能1}} | {{80%}} | 高 | 必做 |
| {{功能2}} | {{30%}} | 中 | 可选 |

### 设计启示
- **通用模式**：{{行业普遍采用的设计}}
- **创新做法**：{{值得借鉴的创新设计}}
- **我们的设计方向**：{{建议}}

### 可行动建议
1. **短期**：{{近期应该做的}}
2. **中期**：{{下一步考虑的}}
3. **长期**：{{未来规划的}}

### 风险规避
- ⚠️ 竞品的常见问题：{{需要避免的坑}}
- ⚠️ 用户反馈的痛点：{{竞品没做好的地方}}

### 差异化机会
- {{我们的独特优势1}}
- {{我们的独特优势2}}
- {{我们的独特优势3}}
"""
        return template

    def format_output(self, strategies: Dict, checklist: Dict) -> str:
        """
        Format the output as a readable Markdown string

        Args:
            strategies: Search strategies dictionary
            checklist: Quality checklist dictionary

        Returns:
            Formatted Markdown string
        """
        output = []
        output.append("=" * 70)
        output.append("竞品调研辅助工具")
        output.append("=" * 70)
        output.append("")

        # Search Strategies
        output.append("## 搜索策略\n")
        for category, queries in strategies.items():
            output.append(f"### {category}\n")
            for query in queries:
                output.append(f"- {query}")
            output.append("")

        # Quality Checklist
        output.append("## 质量检核清单\n")
        for category, items in checklist.items():
            output.append(f"### {category}\n")
            for item in items:
                output.append(f"- [ ] {item}")
            output.append("")

        # Tips
        output.append("## 调研建议\n")
        output.append("### 执行原则")
        output.append("- 质量优先于数量：深入分析 2-3 个关键竞品，不要浅浅列出 10 个")
        output.append("- 差异化视角：不只描述\"他们做了什么\"，要分析\"为什么这样做\"")
        output.append("- 可行动洞察：每个分析都要形成具体建议\n")

        output.append("### 竞品类型")
        output.append("- **直接竞品**：相同产品形态，目标用户重叠度高")
        output.append("- **间接竞品**：解决相同问题，但产品形态不同")
        output.append("- **替代方案**：用户可能会用的替代方式")
        output.append("- **潜在竞品**：尚未进入但具备优势的玩家\n")

        output.append("=" * 70)

        return '\n'.join(output)


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='Generate search strategies and quality checklist for competitive research'
    )

    parser.add_argument('--topic', required=True, help='Product or market topic to research')
    parser.add_argument('--feature', help='Specific feature to compare (optional)')
    parser.add_argument('--generate-search', action='store_true', help='Generate search strategies')
    parser.add_argument('--checklist', action='store_true', help='Show quality checklist')
    parser.add_argument('--template', help='Generate extraction template for a competitor name')

    args = parser.parse_args()

    researcher = CompetitorResearcher()

    # Generate search strategies
    if args.generate_search or True:  # Default to generating search strategies
        strategies = researcher.generate_search_strategies(args.topic, args.feature)
        checklist = researcher.get_quality_checklist()
        output = researcher.format_output(strategies, checklist)
        print(output)

    # Show checklist only
    if args.checklist:
        checklist = researcher.get_quality_checklist()
        print("\n" + "=" * 70)
        print("质量检核清单")
        print("=" * 70)
        for category, items in checklist.items():
            print(f"\n{category}:")
            for item in items:
                print(f"  - {item}")

    # Generate template
    if args.template:
        template = researcher.get_extraction_template(args.template)
        print("\n" + "=" * 70)
        print(f"竞品提取模板：{args.template}")
        print("=" * 70)
        print(template)

        insights_template = researcher.get_insights_template()
        print("\n" + "=" * 70)
        print("洞察与建议模板")
        print("=" * 70)
        print(insights_template)


if __name__ == "__main__":
    main()
