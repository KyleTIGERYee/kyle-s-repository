import argparse
import json
import os

def update_node(file_path, summary, keys):
    import sys
    current_dir = os.path.dirname(os.path.abspath(__file__))
    skill_root = os.path.abspath(os.path.join(current_dir, '..'))
    
    # 路径标准化：优先验证传入路径绝对路径有效性，否则当成基于目录计算的相对路径
    abs_file = os.path.abspath(file_path)
    if not os.path.exists(abs_file):
        abs_file = os.path.abspath(os.path.join(skill_root, file_path))
        
    if not os.path.exists(abs_file):
        print(f"⚠️ 错误：找不到文件，请检查传入的路径！({file_path})")
        sys.exit(1)
        
    normalized_path = os.path.relpath(abs_file, skill_root).replace(os.sep, '/')
    
    system_map_path = os.path.join(current_dir, '..', 'references', 'index', 'system_map.json')
    
    with open(system_map_path, 'r', encoding='utf-8') as f:
        system_map = json.load(f)
        
    filename = os.path.basename(normalized_path)
    section = "features (业务功能级文档)" if "/features/" in normalized_path else "modules (系统模块级文档)"
    
    keywords_list = [k.strip() for k in keys.split(',')] if keys else []
    
    if section == "features (业务功能级文档)":
        if filename not in system_map[section]:
            system_map[section][filename] = {}
        system_map[section][filename]["path"] = normalized_path
        system_map[section][filename]["summary_preview"] = summary
        system_map[section][filename]["keywords"] = keywords_list
    else:
        # 兼容任意多级的目录结构挂载
        parts = normalized_path.split('/')
        try:
            modules_idx = parts.index('modules')
            categories = parts[modules_idx+1:-1]
        except (ValueError, IndexError):
            categories = []
            
        if not categories:
            categories = ["未分类"]
            
        # 逐层深入建立树状结构
        current_node = system_map[section]
        for cat in categories:
            if cat not in current_node:
                current_node[cat] = {}
            current_node = current_node[cat]
            
        if filename not in current_node:
            current_node[filename] = {}
            
        current_node[filename]["path"] = normalized_path
        current_node[filename]["summary_preview"] = summary
        current_node[filename]["keywords"] = keywords_list
        
    # 重写回 json（原子写入：先写临时文件再 rename，防止写入损坏）
    tmp_path = system_map_path + '.tmp'
    with open(tmp_path, 'w', encoding='utf-8') as f:
        json.dump(system_map, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, system_map_path)

    print(f"✅ 成功将 {filename} 更新至系统地图！\n  |- Summary: {summary[:20]}...\n  |- Keywords: {keywords_list}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="安全更新 System Map 的网关工具")
    parser.add_argument('--file', required=True, help='MD 文件的相对路径如：references/documents/features/abc.md')
    parser.add_argument('--summary', required=True, help='由 LLM 提炼出的高优摘要文段')
    parser.add_argument('--keys', required=True, help='由 LLM 提炼出的核心词，使用英文逗号拼接，如"A,B,C"')
    args = parser.parse_args()
    
    update_node(args.file, args.summary, args.keys)
