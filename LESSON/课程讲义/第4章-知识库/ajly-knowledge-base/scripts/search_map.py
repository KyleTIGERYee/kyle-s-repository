import argparse
import json
import os
import sys

def search_system_map(query):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    system_map_path = os.path.join(current_dir, '..', 'references', 'index', 'system_map.json')
    synonyms_path = os.path.join(current_dir, '..', 'references', 'index', 'synonyms.json')

    # 加载系统地图
    try:
        with open(system_map_path, 'r', encoding='utf-8') as f:
            system_map = json.load(f)
    except Exception as e:
        print(f"Error loading system_map.json: {e}")
        sys.exit(1)

    # 加载同义词库
    try:
        with open(synonyms_path, 'r', encoding='utf-8') as f:
            syn_dict = json.load(f).get("keywords", {})
    except Exception:
        syn_dict = {}

    # 1. 意图词拆分与同义词膨胀
    query_terms = [t.strip() for t in query.split() if t.strip()]
    original_terms = set(query_terms)
    
    expanded_terms = set()
    for t in original_terms:
        # 如果搜索词是键的同义词
        if t in syn_dict:
            expanded_terms.update(syn_dict[t])
        # 或者搜索词命中了某个子同义词，将其所在的族谱全部拿出
        for key, values in syn_dict.items():
            if t in values:
                expanded_terms.add(key)
                expanded_terms.update(values)
                
    # 剥离原词，防止算分成倍叠加
    expanded_terms = expanded_terms - original_terms

    results = []
    
    # 定义单个节点的打分逻辑
    def score_node(filename, node_data):
        score = 0
        keywords = node_data.get('keywords', [])
        summary = node_data.get('summary_preview', '')
        path = node_data.get('path', '')
        
        # 将原文件内容当作长字符串用于兜底匹配
        full_text = filename + " " + summary + " " + path
        
        # 针对原提问词
        for term in original_terms:
            if term in keywords:
                score += 10 # 规则要求：直接命中 map 里的 keyword 给 10分
            elif term in full_text:
                score += 2  # 散落命中给 2分
                
        # 针对同义词扩展
        for term in expanded_terms:
            if term in keywords:
                score += 5  # 扩展词命中其关键词数组给 5分
            elif term in full_text:
                score += 2  # 边缘命中同样给 2分
                
        if score > 0:
            results.append({
                "filename": filename,
                "score": score,
                "path": path,
                "summary": summary,
                "keywords": keywords
            })

    # 遍历树状地图算分 (使用递归支持任意多级深度的目录结构)
    def traverse_and_score(data_node, filename_hint=""):
        if isinstance(data_node, dict):
            # 判断是否为叶子节点（有 path 和 summary_preview 是最小标识）
            if "path" in data_node and "summary_preview" in data_node:
                score_node(filename_hint, data_node)
            else:
                for key, value in data_node.items():
                    if key == "_meta":
                        continue
                    traverse_and_score(value, key)
                    
    traverse_and_score(system_map)

    # 3. 排序与输出终端 Top N
    results.sort(key=lambda x: x['score'], reverse=True)
    top_n = results[:10]
    
    print(f"\n======== 检索雷达探测结果: '{query}' ========")
    print(f"提取原意图词: {list(original_terms)}")
    if expanded_terms:
        print(f"引申同义词网络: {list(expanded_terms)}")
    print("=" * 45)
    
    if not top_n:
        print("暂无高分匹配文档。请大模型自检搜索词是否偏离业务！")
        return

    for idx, res in enumerate(top_n, 1):
        print(f"[{idx}] 综合总评分: {res['score']}")
        print(f"  ├ 文件: {res['filename']}")
        print(f"  ├ 位置: {res['path']}")
        print(f"  ├ 摘要: {res['summary']}")
        print(f"  └ 标签: {res['keywords']}")
        print("-" * 45)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="多维权限算分大模型减负雷达")
    parser.add_argument('query', type=str, help='提取到的检索名，如 "退租 换房"')
    args = parser.parse_args()
    
    search_system_map(args.query)
