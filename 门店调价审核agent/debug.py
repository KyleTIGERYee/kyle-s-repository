import json, copy
with open('/Users/kyle/Desktop/VIBECODING/PM/门店调价审核agent/chuangye_garden.json', 'r', encoding='utf-8') as f:
    village_result = json.load(f)
cols = village_result['columns']
test_village_result = copy.deepcopy(village_result)
target_row_v = next((r for r in test_village_result['rows'] if str(r[cols.index('房间号')]) == '802'), None)
fake = copy.deepcopy(target_row_v)
print(fake)
