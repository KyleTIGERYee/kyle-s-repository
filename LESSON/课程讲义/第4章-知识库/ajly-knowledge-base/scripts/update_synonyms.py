import argparse
import json
import os

def update_synonyms(term, synonyms):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    syn_file = os.path.join(current_dir, '..', 'references', 'index', 'synonyms.json')
    
    with open(syn_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    keywords_dict = data.get("keywords", {})
    
    # 清洗传进来的扩充词列表
    new_syns = [s.strip() for s in synonyms.split(',')] if synonyms else []
    
    if term in keywords_dict:
        # 使用去重逻辑合并两个数组
        existing = set(keywords_dict[term])
        existing.update(new_syns)
        keywords_dict[term] = list(existing)
    else:
        # 新建立的术语
        keywords_dict[term] = new_syns
        
    data["keywords"] = keywords_dict
    
    with open(syn_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ 成功将同义词族 [{term} => {','.join(keywords_dict[term])}] 更新到了字典骨干！")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="防呆更新同义词网关")
    parser.add_argument('--term', required=True, help='主词汇 (比如：发票)')
    parser.add_argument('--synonyms', required=True, help='发散词汇，用英文逗号分隔 (比如：开票,红字发票,专票)')
    args = parser.parse_args()
    
    update_synonyms(args.term, args.synonyms)
