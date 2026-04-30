import os
import json

def check_health():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    skill_dir = os.path.abspath(os.path.join(current_dir, '..'))
    system_map_path = os.path.join(skill_dir, 'references', 'index', 'system_map.json')
    docs_dir = os.path.join(skill_dir, 'references', 'documents')

    try:
        with open(system_map_path, 'r', encoding='utf-8') as f:
            system_map = json.load(f)
    except Exception as e:
        print(f"❌ 错误：无法读取 system_map.json: {e}")
        return

    nodes_in_map = {}
    
    empty_summary = 0
    empty_keywords = 0

    # 递归提取地图中的文件
    def collect_nodes(data):
        nonlocal empty_summary, empty_keywords
        if isinstance(data, dict):
            if "path" in data and "summary_preview" in data:
                path = data["path"]
                nodes_in_map[path] = data
                if data["summary_preview"] in ["等待大模型精读后补全", "等待补全", ""]:
                    empty_summary += 1
                if not data.get("keywords") or len(data.get("keywords")) == 0:
                    empty_keywords += 1
            else:
                for k, v in data.items():
                    if k != "_meta":
                        collect_nodes(v)

    collect_nodes(system_map)

    # 统计物理文件
    actual_files = set()
    for root, _, files in os.walk(docs_dir):
        for f in files:
            if f.endswith('.md'):
                abs_path = os.path.join(root, f)
                rel_path = os.path.relpath(abs_path, skill_dir).replace(os.sep, '/')
                actual_files.add(rel_path)

    mapped_files = set(nodes_in_map.keys())

    orphans = actual_files - mapped_files
    zombies = mapped_files - actual_files

    print("\n" + "="*50)
    print("🩺 安居乐寓知识库系统健康体检报告")
    print("="*50)

    print(f"📊 【整体数据】")
    print(f"   ├ 物理 Markdown 文件数: {len(actual_files)}")
    print(f"   └ Map 中挂载的节点数  : {len(mapped_files)}")
    
    print(f"\n🧠 【大脑发育指标】")
    print(f"   ├ 空摘要节点数 : {empty_summary}")
    print(f"   └ 空关键词节点 : {empty_keywords}")
    
    if empty_summary > 0 or empty_keywords > 0:
        print("   ⚠️ 知识库正处于未初始化状态！大量节点无法被精准检索！强烈建议触发初始化精读。")

    print(f"\n🔗 【链接一致性指标】")
    if zombies:
        print(f"   🔴 存在 {len(zombies)} 个僵尸节点 (有索引但实体文件丢失):")
        for z in list(zombies)[:5]:
            print(f"      - {z}")
        if len(zombies) > 5:
            print("      ...")
    else:
        print("   ✅ 完美！没有任何僵尸节点。")

    if orphans:
        print(f"   ⚠️ 存在 {len(orphans)} 个游离文件 (有物理文件但大树未挂载):")
        for o in list(orphans)[:5]:
            print(f"      - {o}")
        if len(orphans) > 5:
            print("      ...")
        print("   建议运行类似 build_system_map 或者循环 update_node 的批处理进行挂载。")
    else:
        print("   ✅ 完美！全库所有物理文件均已挂载在大图谱节点内。")
        
    print("="*50 + "\n")

if __name__ == '__main__':
    check_health()
